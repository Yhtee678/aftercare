// Development-only. Start the built app on port 3100 after applying the reviewed migration.
// Retains fictional Test fixtures; never deletes existing data.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { asc, eq, notInArray } from "drizzle-orm";
import { homeworkTasks, schoolClasses, schools, studentHomework, students } from "../db/schema";

config({ path: ".env.local", quiet: true });
async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Development test only.");
  const baseUrl = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as { node: Record<string, { exportedName: string }> };
  const invoke = async (name: string, input: unknown) => {
    const actionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === name)?.[0];
    assert.ok(actionId);
    const response = await fetch(`${baseUrl}/homework/new`, {
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
      tasks: await db.select().from(homeworkTasks).orderBy(asc(homeworkTasks.id)),
      assignments: await db.select().from(studentHomework).orderBy(asc(studentHomework.id)),
    };
    const schoolIds = [randomUUID(), randomUUID()];
    const classIds = Array.from({ length: 5 }, () => randomUUID());
    const studentIds = Array.from({ length: 4 }, () => randomUUID());
    await db.transaction(async (tx) => {
      await tx.insert(schools).values(schoolIds.map((id, i) => ({ id, name: `Test Homework School ${id.slice(0, 8)}`, status: i ? "INACTIVE" as const : "ACTIVE" as const })));
      await tx.insert(schoolClasses).values(classIds.map((id, i) => ({ id, schoolId: i === 3 ? schoolIds[1] : schoolIds[0], grade: 4, academicYear: 2026, className: `Test Homework ${i}`, status: i === 2 ? "INACTIVE" as const : "ACTIVE" as const })));
      await tx.insert(students).values(studentIds.map((id, i) => ({ id, name: `Test Homework Student ${i} ${id.slice(0, 8)}`, schoolClassId: i === 3 ? classIds[1] : classIds[0], status: i === 2 ? "INACTIVE" as const : "ACTIVE" as const })));
    });
    const id = randomUUID();
    const input = { submissionId: id, schoolClassId: classIds[0], subject: "Test Math", description: `Test Homework ${id}`, taskType: "Exercise", pageFrom: "20", pageTo: "22", taskDate: "2026-09-13" };
    for (const schoolClassId of [classIds[2], classIds[3], classIds[4], randomUUID()]) {
      const submissionId = randomUUID();
      assert.equal((await invoke("createHomework", { ...input, submissionId, schoolClassId })).success, false);
      assert.equal((await db.select().from(homeworkTasks).where(eq(homeworkTasks.id, submissionId))).length, 0);
    }
    assert.equal((await invoke("createHomework", { ...input, subject: " " })).success, false);
    const results = await Promise.all([invoke("createHomework", input), invoke("createHomework", input)]);
    assert.ok(results.every((result) => result.success && result.id === id));
    assert.equal((await db.select().from(homeworkTasks).where(eq(homeworkTasks.id, id))).length, 1);
    const readAssignments = () => db.select().from(studentHomework).where(eq(studentHomework.homeworkTaskId, id)).orderBy(asc(studentHomework.id));
    const assigned = await readAssignments();
    assert.equal(assigned.length, 2);
    assert.deepEqual(assigned.map((item) => item.studentId).sort(), studentIds.slice(0, 2).sort());
    assert.ok(assigned.every((item) => item.status === "PENDING" && item.checkedAt === null));
    assert.equal((await invoke("createHomework", { ...input, description: "Test changed retry" })).success, false);

    // Prove database uniqueness and transaction rollback: a later failed assignment
    // must roll back the task and earlier assignments in the same transaction.
    const rolledBackId = randomUUID();
    await assert.rejects(db.transaction(async (tx) => {
      await tx.insert(homeworkTasks).values({ id: rolledBackId, scope: "CLASS", schoolClassId: classIds[0], subject: "Test rollback", description: "Test rollback", taskDate: input.taskDate });
      await tx.insert(studentHomework).values({ studentId: studentIds[0], homeworkTaskId: rolledBackId });
      await tx.insert(studentHomework).values({ studentId: studentIds[0], homeworkTaskId: rolledBackId });
    }));
    assert.equal((await db.select().from(homeworkTasks).where(eq(homeworkTasks.id, rolledBackId))).length, 0);
    assert.equal((await db.select().from(studentHomework).where(eq(studentHomework.homeworkTaskId, rolledBackId))).length, 0);
    await assert.rejects(db.insert(studentHomework).values({ studentId: assigned[0].studentId, homeworkTaskId: id }));
    await assert.rejects(db.insert(homeworkTasks).values({ scope: "CLASS", schoolClassId: classIds[0], studentId: studentIds[0], subject: "Test invalid scope", description: "Test", taskDate: input.taskDate }));
    assert.equal((await invoke("changeHomeworkStatus", { id: assigned[0].id, status: "COMPLETED" })).success, true);
    let current = await readAssignments();
    assert.deepEqual(current[1], assigned[1]);
    assert.equal(current[0].status, "COMPLETED");
    assert.ok(current[0].checkedAt && current[0].updatedAt >= assigned[0].updatedAt);
    const completed = current[0];
    for (const status of ["COMPLETED", "CORRECTION_REQUIRED", "PENDING"]) assert.equal((await invoke("changeHomeworkStatus", { id: completed.id, status })).success, false);
    assert.deepEqual((await readAssignments())[0], completed);
    assert.equal((await invoke("changeHomeworkStatus", { id: assigned[1].id, status: "CORRECTION_REQUIRED" })).success, true);
    const correctionHtml = await html(`/homework/${id}`);
    assert.ok(correctionHtml.includes("Correction Required") && correctionHtml.includes("1 unresolved"));
    assert.equal((await invoke("changeHomeworkStatus", { id: assigned[1].id, status: "CORRECTION_REQUIRED" })).success, false);
    assert.equal((await invoke("changeHomeworkStatus", { id: assigned[1].id, status: "COMPLETED" })).success, true);
    current = await readAssignments();
    assert.ok(current.every((item) => item.status === "COMPLETED"));
    assert.ok((await html(`/homework/${id}`)).includes("0 unresolved"));
    const browsing = await html("/homework");
    for (let grade = 1; grade <= 6; grade++) assert.ok(browsing.includes(`Grade ${grade}`));
    assert.ok(browsing.includes(`/homework/classes/${classIds[0]}`));
    assert.ok(!browsing.includes(input.description));
    const classPage = await html(`/homework/classes/${classIds[0]}`);
    assert.ok(classPage.includes(input.description) && classPage.includes("Back to Grades and Classes"));
    const otherClassPage = await html(`/homework/classes/${classIds[1]}`);
    assert.ok(!otherClassPage.includes(input.description) && otherClassPage.includes("No homework recorded for this class"));
    assert.ok((await html(`/homework/${id}`)).includes(`/homework/classes/${classIds[0]}`));
    for (const invalid of ["bad", randomUUID()]) assert.ok((await html(`/homework/classes/${invalid}`)).includes("Class not found"));
    assert.ok((await html("/homework/new")).includes(`value="${classIds[0]}"`));
    for (const invalid of ["bad", randomUUID()]) assert.ok((await html(`/homework/${invalid}`)).includes("Homework not found"));
    assert.equal((await invoke("createHomework", input)).success, true);
    assert.deepEqual(await readAssignments(), current);
    await db.update(schoolClasses).set({ status: "INACTIVE" }).where(eq(schoolClasses.id, classIds[0]));
    assert.ok((await html(`/homework/classes/${classIds[0]}`)).includes(input.description));
    assert.ok((await html("/homework")).includes(`/homework/classes/${classIds[0]}`));
    assert.deepEqual(await db.select().from(schools).where(notInArray(schools.id, schoolIds)).orderBy(asc(schools.id)), before.schools);
    assert.deepEqual(await db.select().from(schoolClasses).where(notInArray(schoolClasses.id, classIds)).orderBy(asc(schoolClasses.id)), before.classes);
    assert.deepEqual(await db.select().from(students).where(notInArray(students.id, studentIds)).orderBy(asc(students.id)), before.students);
    assert.deepEqual(await db.select().from(homeworkTasks).where(notInArray(homeworkTasks.id, [id])).orderBy(asc(homeworkTasks.id)), before.tasks);
    assert.deepEqual(await db.select().from(studentHomework).where(notInArray(studentHomework.id, assigned.map((item) => item.id))).orderBy(asc(studentHomework.id)), before.assignments);
    console.log("Homework integration passed: eligibility, concurrent retry, atomic rollback, uniqueness, scope, transitions, reads and existing-record preservation. Test fixtures retained.");
  } finally { await db.$client.end(); }
}
run().catch(() => { console.error("Homework integration failed (details suppressed to protect database values)."); process.exitCode = 1; });
