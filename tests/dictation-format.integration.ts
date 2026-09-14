// Uses the existing production build on port 3100. Retains isolated Test fixtures.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { asc, eq, notInArray, sql } from "drizzle-orm";
import { dictationTasks, studentDictation, schools, schoolClasses, students } from "../db/schema";
import { getCareDate } from "../lib/care-date";

config({ path: ".env.local", quiet: true });
async function run() {
  const { db } = await import("../db/connection");
  const base = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as { node: Record<string, { exportedName: string }> };
  const actionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === "createDictation")?.[0];
  assert.ok(actionId);
  const invoke = async (input: unknown) => {
    const response = await fetch(`${base}/dictation/new`, { method: "POST", headers: { "Next-Action": actionId, "Content-Type": "text/plain;charset=UTF-8", Origin: base }, body: JSON.stringify([input]) });
    assert.equal(response.status, 200);
    for (const line of (await response.text()).split("\n")) {
      const match = line.match(/^\w+:(\{.*\})$/);
      if (match) { const result = JSON.parse(match[1]); if (typeof result.success === "boolean") return result as { success: boolean; id?: string }; }
    }
    throw new Error("Missing action result");
  };
  const page = async (id: string) => {
    const response = await fetch(`${base}/dictation/${id}`);
    assert.equal(response.status, 200);
    const text = (await response.text()).replace(/<!--[\s\S]*?-->/g, "");
    assert.ok(!text.includes("暂时无法加载"));
    return text;
  };
  try {
    const [column] = await db.execute<{ is_nullable: string; column_default: string }>(sql`select is_nullable, column_default from information_schema.columns where table_schema = 'public' and table_name = 'dictation_tasks' and column_name = 'content_format'`);
    assert.equal(column.is_nullable, "NO"); assert.ok(column.column_default.includes("PLAIN"));
    const constraints = await db.execute(sql`select 1 from pg_constraint where conname = 'dictation_tasks_content_format_check'`);
    assert.equal(constraints.length, 1);
    const before = {
      tasks: await db.select().from(dictationTasks).orderBy(asc(dictationTasks.id)),
      assignments: await db.select().from(studentDictation).orderBy(asc(studentDictation.id)),
      schools: await db.select().from(schools).orderBy(asc(schools.id)),
      classes: await db.select().from(schoolClasses).orderBy(asc(schoolClasses.id)),
      students: await db.select().from(students).orderBy(asc(students.id)),
    };
    const old = before.tasks.find((task) => task.contentFormat === "PLAIN");
    assert.ok(old, "An existing old dictation is required");
    assert.ok((await page(old.id)).includes('class="whitespace-pre-wrap break-words"'));
    const schoolId = randomUUID(), classId = randomUUID(), studentId = randomUUID();
    const taskIds = [randomUUID(), randomUUID()];
    const [clock] = await db.execute<{ now: string }>(sql`select now()::text as now`);
    const today = getCareDate(new Date(clock.now));
    await db.transaction(async (tx) => {
      await tx.insert(schools).values({ id: schoolId, name: `Test Format School ${schoolId.slice(0, 8)}` });
      await tx.insert(schoolClasses).values({ id: classId, schoolId, grade: 1, academicYear: Number(today.slice(0, 4)), className: "Test Format Class" });
      await tx.insert(students).values({ id: studentId, schoolClassId: classId, name: "Test Dictation Format Student" });
    });
    for (const [index, contentFormat] of (["NUMBERED", "PLAIN"] as const).entries()) {
      const description = contentFormat === "NUMBERED" ? "Test Apple\nTest School" : "Test paragraph one.\nTest paragraph two.";
      const input = { submissionId: taskIds[index], schoolClassId: classId, type: "DICTATION", source: "SCHOOL", description, contentFormat, assignedDate: today, scheduledDate: today };
      assert.equal((await invoke(input)).success, true);
      assert.equal((await invoke(input)).success, true); // Same-form retry creates no additional rows.
      const [saved] = await db.select().from(dictationTasks).where(eq(dictationTasks.id, input.submissionId));
      assert.equal(saved.contentFormat, contentFormat); assert.equal(saved.description, description);
      const assignments = await db.select().from(studentDictation).where(eq(studentDictation.dictationTaskId, saved.id));
      assert.equal(assignments.length, 1); assert.equal(assignments[0].studentId, studentId); assert.equal(assignments[0].status, "PENDING");
      for (let reload = 0; reload < 2; reload++) {
        const html = await page(saved.id);
        assert.ok(html.includes(contentFormat === "NUMBERED" ? '<li>Test Apple</li><li>Test School</li>' : 'Test paragraph one.\nTest paragraph two.'));
      }
    }
    assert.deepEqual(await db.select().from(dictationTasks).where(notInArray(dictationTasks.id, taskIds)).orderBy(asc(dictationTasks.id)), before.tasks);
    assert.deepEqual(await db.select().from(studentDictation).where(notInArray(studentDictation.dictationTaskId, taskIds)).orderBy(asc(studentDictation.id)), before.assignments);
    assert.deepEqual(await db.select().from(schools).where(notInArray(schools.id, [schoolId])).orderBy(asc(schools.id)), before.schools);
    assert.deepEqual(await db.select().from(schoolClasses).where(notInArray(schoolClasses.id, [classId])).orderBy(asc(schoolClasses.id)), before.classes);
    assert.deepEqual(await db.select().from(students).where(notInArray(students.id, [studentId])).orderBy(asc(students.id)), before.students);
    console.log("PASS: migration column/default/CHECK; old PLAIN page; NUMBERED and PLAIN Server Action persistence and reload; idempotent retries; unrelated records unchanged. Retained: 1 Test school/class/student, 2 tasks and 2 assignments.");
  } finally { await db.$client.end(); }
}
run().catch(() => { console.error("Dictation format persistence check failed; database details suppressed."); process.exitCode = 1; });
