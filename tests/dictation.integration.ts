// Development-only. Start the built app on port 3100 after applying the reviewed migration.
// Retains fictional Test fixtures; never deletes existing data.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { asc, eq, notInArray, sql } from "drizzle-orm";
import { dictationTasks, schoolClasses, schools, studentDictation, students } from "../db/schema";
import { getCareDate } from "../lib/care-date";
import { nextCalendarDate } from "../lib/dictation-due";

config({ path: ".env.local", quiet: true });
async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Development test only.");
  const baseUrl = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as { node: Record<string, { exportedName: string }> };
  const invoke = async (name: string, input: unknown) => {
    const actionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === name)?.[0];
    assert.ok(actionId);
    const response = await fetch(`${baseUrl}/dictation/new`, {
      method: "POST", headers: { "Next-Action": actionId, "Content-Type": "text/plain;charset=UTF-8", Origin: baseUrl }, body: JSON.stringify([input]),
    });
    assert.equal(response.status, 200);
    for (const line of (await response.text()).split("\n")) {
      const match = line.match(/^\w+:(\{.*\})$/);
      if (!match) continue;
      const value = JSON.parse(match[1]);
      if (typeof value.success === "boolean") return value as { success: boolean; id?: string; message?: string };
    }
    throw new Error("No action result received.");
  };
  const html = async (path: string) => (await (await fetch(`${baseUrl}${path}`)).text()).replace(/<!--[\s\S]*?-->/g, "");
  const { db } = await import("../db/connection");
  try {
    const before = {
      schools: await db.select().from(schools).orderBy(asc(schools.id)),
      classes: await db.select().from(schoolClasses).orderBy(asc(schoolClasses.id)),
      students: await db.select().from(students).orderBy(asc(students.id)),
      tasks: await db.select().from(dictationTasks).orderBy(asc(dictationTasks.id)),
      assignments: await db.select().from(studentDictation).orderBy(asc(studentDictation.id)),
    };
    const schoolIds = [randomUUID(), randomUUID()];
    const classIds = Array.from({ length: 5 }, () => randomUUID());
    const studentIds = Array.from({ length: 4 }, () => randomUUID());
    await db.transaction(async (tx) => {
      await tx.insert(schools).values(schoolIds.map((id, i) => ({ id, name: `Test Dictation School ${id.slice(0, 8)}`, status: i ? "INACTIVE" as const : "ACTIVE" as const })));
      await tx.insert(schoolClasses).values(classIds.map((id, i) => ({ id, schoolId: i === 3 ? schoolIds[1] : schoolIds[0], grade: 4, academicYear: 2026, className: `Test Dictation ${i}`, status: i === 2 ? "INACTIVE" as const : "ACTIVE" as const })));
      await tx.insert(students).values(studentIds.map((id, i) => ({ id, name: `Test Dictation Student ${i} ${id.slice(0, 8)}`, schoolClassId: i === 3 ? classIds[1] : classIds[0], status: i === 2 ? "INACTIVE" as const : "ACTIVE" as const })));
    });
    const id = randomUUID();
    const [clock] = await db.execute<{ now: string }>(sql`select now()::text as now`);
    const today = getCareDate(new Date(clock.now));
    const yesterday = getCareDate(new Date(new Date(clock.now).getTime() - 86400000));
    const input = { submissionId: id, schoolClassId: classIds[0], type: "SPELLING", source: "SCHOOL", description: `Test Dictation ${id}`, assignedDate: today, scheduledDate: today };
    const taskValues = { type: "SPELLING" as const, source: "SCHOOL" as const, assignedDate: today, scheduledDate: today };
    for (const schoolClassId of [classIds[2], classIds[3], classIds[4], randomUUID()]) {
      const submissionId = randomUUID();
      assert.equal((await invoke("createDictation", { ...input, submissionId, schoolClassId })).success, false);
      assert.equal((await db.select().from(dictationTasks).where(eq(dictationTasks.id, submissionId))).length, 0);
    }
    assert.equal((await invoke("createDictation", { ...input, description: " " })).success, false);
    assert.equal((await invoke("createDictation", { ...input, scheduledDate: yesterday })).success, false);
    const results = await Promise.all([invoke("createDictation", input), invoke("createDictation", input)]);
    assert.ok(results.every((result) => result.success && result.id === id));
    assert.equal((await db.select().from(dictationTasks).where(eq(dictationTasks.id, id))).length, 1);
    const readAssignments = () => db.select().from(studentDictation).where(eq(studentDictation.dictationTaskId, id)).orderBy(asc(studentDictation.id));
    const assigned = await readAssignments();
    assert.equal(assigned.length, 2);
    assert.deepEqual(assigned.map((item) => item.studentId).sort(), studentIds.slice(0, 2).sort());
    assert.ok(assigned.every((item) => item.status === "PENDING" && item.verifiedAt === null));
    assert.equal((await invoke("createDictation", { ...input, description: "Test changed retry" })).success, false);

    // Prove database uniqueness and transaction rollback: a later failed assignment
    // must roll back the task and earlier assignments in the same transaction.
    const rolledBackId = randomUUID();
    await assert.rejects(db.transaction(async (tx) => {
      await tx.insert(dictationTasks).values({ id: rolledBackId, scope: "CLASS", schoolClassId: classIds[0], description: "Test rollback", ...taskValues });
      await tx.insert(studentDictation).values({ studentId: studentIds[0], dictationTaskId: rolledBackId });
      await tx.insert(studentDictation).values({ studentId: studentIds[0], dictationTaskId: rolledBackId });
    }));
    assert.equal((await db.select().from(dictationTasks).where(eq(dictationTasks.id, rolledBackId))).length, 0);
    assert.equal((await db.select().from(studentDictation).where(eq(studentDictation.dictationTaskId, rolledBackId))).length, 0);
    await assert.rejects(db.insert(studentDictation).values({ studentId: assigned[0].studentId, dictationTaskId: id }));
    await assert.rejects(db.insert(dictationTasks).values({ scope: "CLASS", schoolClassId: classIds[0], studentId: studentIds[0], description: "Test invalid scope", ...taskValues }));
    await assert.rejects(db.insert(dictationTasks).values({ scope: "CLASS", schoolClassId: classIds[0], description: "Test invalid dates", ...taskValues, scheduledDate: yesterday }));
    assert.ok((await html("/today/grades/4")).includes(`data-attention-id="${assigned[0].id}"`));
    assert.equal((await invoke("changeDictationStatus", { id: assigned[0].id, status: "COMPLETED" })).success, true);
    let current = await readAssignments();
    assert.deepEqual(current[1], assigned[1]);
    assert.equal(current[0].status, "COMPLETED");
    assert.ok(current[0].verifiedAt && current[0].updatedAt >= assigned[0].updatedAt);
    const completed = current[0];
    for (const status of ["COMPLETED", "NEEDS_PRACTICE", "PENDING"]) assert.equal((await invoke("changeDictationStatus", { id: completed.id, status })).success, false);
    assert.deepEqual((await readAssignments())[0], completed);
    assert.equal((await invoke("changeDictationStatus", { id: assigned[1].id, status: "NEEDS_PRACTICE" })).success, true);
    const correctionHtml = await html(`/dictation/${id}`);
    assert.ok(correctionHtml.includes("需要练习/订正") && correctionHtml.includes("1 未完成"));
    const practice = (await readAssignments())[1];
    assert.equal(practice.verifiedAt, null);
    assert.equal((await invoke("changeDictationStatus", { id: assigned[1].id, status: "NEEDS_PRACTICE" })).success, true);
    assert.deepEqual((await readAssignments())[1], practice);
    assert.equal((await invoke("changeDictationStatus", { id: assigned[1].id, status: "COMPLETED" })).success, true);
    current = await readAssignments();
    assert.ok(current.every((item) => item.status === "COMPLETED"));
    assert.ok(current.every((item) => item.verifiedAt !== null));
    assert.ok(!(await html("/today/grades/4")).includes(`data-attention-id="${assigned[0].id}"`));
    const extraTaskIds: string[] = [];
    const extraAssignmentIds: string[] = [];
    for (const scheduledDate of [yesterday, today, nextCalendarDate(today), nextCalendarDate(nextCalendarDate(today))]) {
      const submissionId = randomUUID();
      extraTaskIds.push(submissionId);
      assert.equal((await invoke("createDictation", { ...input, submissionId, schoolClassId: classIds[1], assignedDate: yesterday, scheduledDate })).success, true);
      const [row] = await db.select().from(studentDictation).where(eq(studentDictation.dictationTaskId, submissionId));
      extraAssignmentIds.push(row.id);
    }
    const todayHtml = await html("/today/grades/4");
    for (const attentionId of extraAssignmentIds.slice(0, 3)) assert.ok(todayHtml.includes(`data-attention-id="${attentionId}"`));
    assert.ok(!todayHtml.includes(`data-attention-id="${extraAssignmentIds[3]}"`));
    assert.ok(todayHtml.indexOf(`data-attention-id="${extraAssignmentIds[0]}"`) < todayHtml.indexOf(`data-attention-id="${extraAssignmentIds[2]}"`));
    assert.equal((await invoke("changeDictationStatus", { id: extraAssignmentIds[0], status: "COMPLETED" })).success, true);
    assert.ok(!(await html("/today/grades/4")).includes(`data-attention-id="${extraAssignmentIds[0]}"`));
    assert.ok((await html(`/dictation/${id}`)).includes("0 未完成"));
    const browsing = await html("/dictation");
    for (let grade = 1; grade <= 6; grade++) assert.ok(browsing.includes(`年级 ${grade}`));
    assert.ok(browsing.includes(`/dictation/classes/${classIds[0]}`));
    assert.ok(!browsing.includes(input.description));
    const classPage = await html(`/dictation/classes/${classIds[0]}`);
    assert.ok(classPage.includes(input.description) && classPage.includes("返回年级与班级"));
    const otherClassPage = await html(`/dictation/classes/${classIds[1]}`);
    assert.ok(!otherClassPage.includes(`href="/dictation/${id}"`));
    assert.ok((await html(`/dictation/${id}`)).includes(`/dictation/classes/${classIds[0]}`));
    for (const invalid of ["bad", randomUUID()]) assert.ok((await html(`/dictation/classes/${invalid}`)).includes("找不到班级"));
    assert.ok((await html("/dictation/new")).includes(`value="${classIds[0]}"`));
    for (const invalid of ["bad", randomUUID()]) assert.ok((await html(`/dictation/${invalid}`)).includes("找不到听写"));
    assert.equal((await invoke("createDictation", input)).success, true);
    assert.deepEqual(await readAssignments(), current);
    await db.update(schoolClasses).set({ status: "INACTIVE" }).where(eq(schoolClasses.id, classIds[0]));
    assert.ok((await html(`/dictation/classes/${classIds[0]}`)).includes(input.description));
    assert.ok((await html("/dictation")).includes(`/dictation/classes/${classIds[0]}`));
    assert.deepEqual(await db.select().from(schools).where(notInArray(schools.id, schoolIds)).orderBy(asc(schools.id)), before.schools);
    assert.deepEqual(await db.select().from(schoolClasses).where(notInArray(schoolClasses.id, classIds)).orderBy(asc(schoolClasses.id)), before.classes);
    assert.deepEqual(await db.select().from(students).where(notInArray(students.id, studentIds)).orderBy(asc(students.id)), before.students);
    assert.deepEqual(await db.select().from(dictationTasks).where(notInArray(dictationTasks.id, [id, ...extraTaskIds])).orderBy(asc(dictationTasks.id)), before.tasks);
    assert.deepEqual(await db.select().from(studentDictation).where(notInArray(studentDictation.id, [...assigned.map((item) => item.id), ...extraAssignmentIds])).orderBy(asc(studentDictation.id)), before.assignments);
    console.log("Dictation integration passed: eligibility, concurrent retry, atomic rollback, uniqueness, scope, transitions, reads and existing-record preservation. Test fixtures retained.");
  } finally { await db.$client.end(); }
}
run().catch(() => { console.error("Dictation integration failed (details suppressed to protect database values)."); process.exitCode = 1; });
