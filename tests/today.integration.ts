// Local production server on port 3100. Retains fictional Test fixtures; no deletes.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { asc, eq, notInArray, sql } from "drizzle-orm";
import { schools, schoolClasses, students, homeworkTasks, studentHomework, dailyStudentRecords } from "../db/schema";
import { getCareDate } from "../lib/care-date";

config({ path: ".env.local", quiet: true });
async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Development test only.");
  const base = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as { node: Record<string, { exportedName: string }> };
  const invoke = async (name: string, input: unknown) => {
    const id = Object.entries(manifest.node).find(([, item]) => item.exportedName === name)?.[0];
    assert.ok(id);
    const response = await fetch(`${base}/today`, { method: "POST", headers: { "Next-Action": id, "Content-Type": "text/plain;charset=UTF-8", Origin: base }, body: JSON.stringify([input]) });
    assert.equal(response.status, 200);
    for (const line of (await response.text()).split("\n")) {
      const match = line.match(/^\w+:(\{.*\})$/);
      if (match) { const result = JSON.parse(match[1]); if (typeof result.success === "boolean") return result.success; }
    }
    throw new Error("Missing action response.");
  };
  const html = async () => (await Promise.all([1, 2].map(async (grade) => (await (await fetch(`${base}/today/grades/${grade}`)).text()).replace(/<!--[\s\S]*?-->/g, "")))).join("\n");
  const { db } = await import("../db/connection");
  try {
    const originalHomework = await db.select().from(studentHomework).orderBy(asc(studentHomework.id));
    const originalCare = await db.select().from(dailyStudentRecords).orderBy(asc(dailyStudentRecords.id));
    const [clock] = await db.execute<{ now: string }>(sql`select now()::text as now`);
    const today = getCareDate(new Date(clock.now));
    const yesterday = getCareDate(new Date(new Date(clock.now).getTime() - 86400000));
    assert.equal(getCareDate(new Date("2026-09-13T16:00:00Z")), "2026-09-14");
    const schoolId = randomUUID();
    const classIds = [randomUUID(), randomUUID()];
    const studentIds = Array.from({ length: 4 }, () => randomUUID());
    const taskIds = Array.from({ length: 3 }, () => randomUUID());
    const assignmentIds: string[] = Array.from({ length: 4 }, () => randomUUID());
    const dailyIds: string[] = Array.from({ length: 5 }, () => randomUUID());
    await db.transaction(async (tx) => {
      await tx.insert(schools).values({ id: schoolId, name: `Test Today School ${schoolId.slice(0, 8)}` });
      await tx.insert(schoolClasses).values(classIds.map((id, i) => ({ id, schoolId, className: `Test Today ${i}`, grade: i + 1, academicYear: 2026 })));
      await tx.insert(students).values(studentIds.map((id, i) => ({ id, name: `Test Today Student ${i}`, schoolClassId: i === 3 ? classIds[1] : classIds[0] })));
      await tx.insert(homeworkTasks).values(taskIds.map((id, i) => ({ id, scope: "CLASS" as const, schoolClassId: i === 1 ? classIds[1] : classIds[0],
        subject: "Test Today Math", description: `Test Today Task ${i}`, taskDate: i === 1 ? yesterday : today })));
      await tx.insert(studentHomework).values([
        { id: assignmentIds[0], studentId: studentIds[0], homeworkTaskId: taskIds[0], status: "CORRECTION_REQUIRED" },
        { id: assignmentIds[1], studentId: studentIds[3], homeworkTaskId: taskIds[1], status: "CORRECTION_REQUIRED" },
        { id: assignmentIds[2], studentId: studentIds[1], homeworkTaskId: taskIds[0], status: "COMPLETED" },
        { id: assignmentIds[3], studentId: studentIds[2], homeworkTaskId: taskIds[2], status: "PENDING" },
      ]);
      await tx.insert(dailyStudentRecords).values(dailyIds.map((id, i) => ({ id, studentId: studentIds[i === 4 ? 0 : i], recordDate: i === 4 ? yesterday : today,
        schoolClassId: i === 3 ? classIds[1] : classIds[0], schoolName: "Test Today School", className: `Test Today ${i === 3 ? 1 : 0}`, grade: i === 3 ? 2 : 1, academicYear: 2026,
        arrivalTime: i === 2 ? null : new Date(clock.now), bagChecked: i === 1,
      })));
    });
    let page = await html();
    assert.ok(page.includes(today));
    const attentionIds = (content: string) => [...content.matchAll(/data-attention-id="([^"]+)"/g)].map((match) => match[1]);
    const expected = [assignmentIds[0], dailyIds[0], assignmentIds[1], dailyIds[3]];
    assert.deepEqual(attentionIds(page).filter((id) => assignmentIds.includes(id) || dailyIds.includes(id)), expected);
    assert.deepEqual(attentionIds(await html()), attentionIds(page));
    assert.ok(page.includes(`/homework/${taskIds[1]}`) && page.includes(`/care/classes/${classIds[0]}`));
    const summary = (content: string, id: string) => content.match(new RegExp(`<li[^>]*data-class-id="${id}"[^>]*>([\\s\\S]*?)</li>`))?.[1] ?? "";
    assert.match(summary(page, classIds[0]), /3 名启用学生 · 2 人已到班 · 1 人已检查书包/);
    assert.match(summary(page, classIds[0]), /功课： 1 \/ 3 已完成/);
    assert.match(summary(page, classIds[0]), /2 项需要注意/);
    assert.match(summary(page, classIds[1]), /1 名启用学生 · 1 人已到班 · 0 人已检查书包/);
    assert.ok(!summary(page, classIds[1]).includes("功课：")); // Yesterday's task is attention only.
    assert.equal(await invoke("changeHomeworkStatus", { id: assignmentIds[0], status: "COMPLETED" }), true);
    assert.equal(await invoke("completeCareAction", { studentId: studentIds[0], schoolClassId: classIds[0], recordDate: today, action: "bagChecked" }), true);
    page = await html();
    assert.ok(!attentionIds(page).includes(assignmentIds[0]) && !attentionIds(page).includes(dailyIds[0]));
    assert.match(summary(page, classIds[0]), /功课： 2 \/ 3 已完成/);
    assert.match(summary(page, classIds[0]), /3 名启用学生 · 2 人已到班 · 2 人已检查书包/);
    assert.match(summary(page, classIds[0]), /0 项需要注意/);
    assert.ok(attentionIds(page).includes(assignmentIds[1]) && attentionIds(page).includes(dailyIds[3]));
    assert.deepEqual(await db.select().from(studentHomework).where(notInArray(studentHomework.id, assignmentIds)).orderBy(asc(studentHomework.id)), originalHomework);
    assert.deepEqual(await db.select().from(dailyStudentRecords).where(notInArray(dailyStudentRecords.id, dailyIds)).orderBy(asc(dailyStudentRecords.id)), originalCare);
    assert.equal((await db.select().from(studentHomework).where(eq(studentHomework.id, assignmentIds[3])))[0].status, "PENDING");
    console.log("Today integration passed: derived sources, resolution through source actions, exclusion, deterministic ordering, class counts, local date and unrelated-data preservation. Test fixtures retained.");
  } finally { await db.$client.end(); }
}
run().catch(() => { console.error("Today integration failed (database details suppressed)."); process.exitCode = 1; });
