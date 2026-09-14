// Run against a local production build on port 3100 after the approved migration.
// Only fictional Test fixtures are created/modified; nothing is deleted.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { and, asc, eq, notInArray, sql } from "drizzle-orm";
import { dailyStudentRecords, schoolClasses, schools, students } from "../db/schema";
import { getCareDate } from "../lib/care-date";

config({ path: ".env.local", quiet: true });
async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Development test only.");
  const baseUrl = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as { node: Record<string, { exportedName: string }> };
  const actionId = Object.entries(manifest.node).find(([, item]) => item.exportedName === "completeCareAction")?.[0];
  assert.ok(actionId);
  const invoke = async (input: unknown) => {
    const response = await fetch(`${baseUrl}/care`, { method: "POST", headers: {
      "Next-Action": actionId, "Content-Type": "text/plain;charset=UTF-8", Origin: baseUrl,
    }, body: JSON.stringify([input]) });
    assert.equal(response.status, 200);
    for (const line of (await response.text()).split("\n")) {
      const match = line.match(/^\w+:(\{.*\})$/);
      if (!match) continue;
      const value = JSON.parse(match[1]);
      if (typeof value.success === "boolean") return value as { success: boolean; message?: string };
    }
    throw new Error("No care action response.");
  };
  const html = async (path: string) => (await (await fetch(`${baseUrl}${path}`)).text()).replace(/<!--[\s\S]*?-->/g, "");
  const { db } = await import("../db/connection");
  try {
    const before = {
      schools: await db.select().from(schools).orderBy(asc(schools.id)),
      classes: await db.select().from(schoolClasses).orderBy(asc(schoolClasses.id)),
      students: await db.select().from(students).orderBy(asc(students.id)),
      records: await db.select().from(dailyStudentRecords).orderBy(asc(dailyStudentRecords.id)),
    };
    const schoolIds = [randomUUID(), randomUUID()];
    const classIds = Array.from({ length: 4 }, () => randomUUID());
    const studentIds = Array.from({ length: 5 }, () => randomUUID());
    await db.transaction(async (tx) => {
      await tx.insert(schools).values(schoolIds.map((id, i) => ({ id, name: `Test Care School ${id.slice(0, 8)}`, status: i ? "INACTIVE" as const : "ACTIVE" as const })));
      await tx.insert(schoolClasses).values(classIds.map((id, i) => ({ id, schoolId: i === 3 ? schoolIds[1] : schoolIds[0],
        grade: 1, academicYear: 2026, className: `Test Care Class ${i}`, status: i === 2 ? "INACTIVE" as const : "ACTIVE" as const })));
      await tx.insert(students).values(studentIds.map((id, i) => ({ id, name: `Test Care Student ${i} ${id.slice(0, 8)}`,
        schoolClassId: i >= 3 ? classIds[i - 1] : classIds[0], status: i === 2 ? "INACTIVE" as const : "ACTIVE" as const })));
    });
    const [clock] = await db.execute<{ now: string }>(sql`select now()::text as now`);
    const today = getCareDate(new Date(clock.now));
    const yesterday = getCareDate(new Date(new Date(clock.now).getTime() - 86400000));
    const input = { studentId: studentIds[0], schoolClassId: classIds[0], recordDate: today, action: "arrival" };
    const read = () => db.select().from(dailyStudentRecords).where(and(eq(dailyStudentRecords.studentId, studentIds[0]), eq(dailyStudentRecords.recordDate, today)));
    const historicalContext = { schoolClassId: classIds[0], schoolName: `Test Care School ${schoolIds[0].slice(0, 8)}`, className: "Test Care Class 0", grade: 1, academicYear: 2026 };
    const [history] = await db.insert(dailyStudentRecords).values({ studentId: studentIds[0], recordDate: yesterday, ...historicalContext, arrivalTime: new Date(`${yesterday}T05:00:00Z`), mealCompleted: true }).returning();
    assert.equal((await invoke({ ...input, action: "mealCompleted" })).success, false);
    assert.equal((await read()).length, 0);
    assert.equal((await invoke({ ...input, recordDate: yesterday })).success, false);
    assert.equal((await invoke({ ...input, action: "reset" })).success, false);
    for (const [studentId, schoolClassId] of [[studentIds[2], classIds[0]], [studentIds[3], classIds[2]], [studentIds[4], classIds[3]], [studentIds[0], classIds[1]]]) {
      assert.equal((await invoke({ ...input, studentId, schoolClassId })).success, false);
    }
    assert.ok((await Promise.all([invoke(input), invoke(input)])).every((result) => result.success));
    let records = await read();
    assert.equal(records.length, 1);
    const arrived = records[0];
    assert.ok(arrived.arrivalTime);
    assert.equal(arrived.recordDate, getCareDate(arrived.arrivalTime));
    assert.equal(arrived.mealCompleted, false);
    assert.equal((await invoke(input)).success, true);
    assert.deepEqual((await read())[0], arrived);
    // Two different simultaneous checks must both persist, without overwriting each other.
    assert.ok((await Promise.all([invoke({ ...input, action: "mealCompleted" }), invoke({ ...input, action: "showerCompleted" })])).every((result) => result.success));
    for (const action of ["bagChecked", "finalCheckCompleted"]) assert.equal((await invoke({ ...input, action })).success, true);
    records = await read();
    const completed = records[0];
    for (const field of ["mealCompleted", "showerCompleted", "bagChecked", "finalCheckCompleted"] as const) assert.equal(completed[field], true);
    assert.deepEqual(completed.arrivalTime, arrived.arrivalTime);
    for (const action of ["arrival", "mealCompleted", "showerCompleted", "bagChecked", "finalCheckCompleted"]) assert.equal((await invoke({ ...input, action })).success, true);
    assert.deepEqual((await read())[0], completed);
    await assert.rejects(db.insert(dailyStudentRecords).values({ studentId: studentIds[0], recordDate: today, ...historicalContext }));
    const classPage = await html(`/care/classes/${classIds[0]}`);
    assert.ok(classPage.includes(`Test Care Student 0`) && classPage.includes(`Test Care Student 1`));
    assert.ok(!classPage.includes(`Test Care Student 2`));
    assert.ok(classPage.includes("已到班") && classPage.includes('aria-pressed="true"'));
    const browsing = await html("/care");
    for (let grade = 1; grade <= 6; grade++) assert.ok(browsing.includes(`年级 ${grade}`));
    assert.ok(browsing.includes(`/care/classes/${classIds[0]}`) && !browsing.includes(`/care/classes/${classIds[2]}`));
    assert.ok((await html(`/care/classes/${classIds[1]}`)).includes("此班级暂无启用的学生"));
    for (const id of ["bad", randomUUID()]) assert.ok((await html(`/care/classes/${id}`)).includes("找不到班级"));
    // Changing enrollment and labels must not rewrite either day's recorded context.
    await db.update(students).set({ schoolClassId: classIds[1] }).where(eq(students.id, studentIds[0]));
    await db.update(schoolClasses).set({ className: "Test Care Renamed", grade: 2 }).where(eq(schoolClasses.id, classIds[0]));
    await db.update(schools).set({ name: "Test Care School Renamed" }).where(eq(schools.id, schoolIds[0]));
    assert.equal((await invoke(input)).success, false);
    assert.equal((await invoke({ ...input, schoolClassId: classIds[1] })).success, true);
    assert.deepEqual((await read())[0], completed);
    assert.ok((await html(`/care/classes/${classIds[1]}`)).includes("本日首次记录班级："));
    await db.update(students).set({ status: "INACTIVE" }).where(eq(students.id, studentIds[0]));
    assert.equal((await invoke({ ...input, schoolClassId: classIds[1] })).success, false);
    assert.deepEqual((await read())[0], completed);
    assert.deepEqual((await db.select().from(dailyStudentRecords).where(eq(dailyStudentRecords.id, history.id)))[0], history);
    assert.equal((await db.select().from(dailyStudentRecords).where(eq(dailyStudentRecords.studentId, studentIds[1]))).length, 0);
    assert.deepEqual(await db.select().from(schools).where(notInArray(schools.id, schoolIds)).orderBy(asc(schools.id)), before.schools);
    assert.deepEqual(await db.select().from(schoolClasses).where(notInArray(schoolClasses.id, classIds)).orderBy(asc(schoolClasses.id)), before.classes);
    assert.deepEqual(await db.select().from(students).where(notInArray(students.id, studentIds)).orderBy(asc(students.id)), before.students);
    assert.deepEqual(await db.select().from(dailyStudentRecords).where(notInArray(dailyStudentRecords.studentId, studentIds)).orderBy(asc(dailyStudentRecords.id)), before.records);
    console.log("Daily Care integration passed: first action, concurrency, arrival retry, all checks, eligibility, local day, rendered reads and historical/unrelated-record preservation. Test fixtures retained.");
  } finally { await db.$client.end(); }
}
run().catch(() => { console.error("Daily Care integration failed (database details suppressed)."); process.exitCode = 1; });
