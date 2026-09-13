// Explicit development integration test: leaves one fictional Test student.
// Run against a local production server after `npm run build`:
// npx tsx tests/student-creation.integration.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { schoolClasses, schools, students } from "../db/schema";

config({ path: ".env.local", quiet: true });

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Development test only.");
  const baseUrl = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as {
    node: Record<string, { exportedName: string }>;
  };
  const actionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === "createStudent")?.[0];
  assert.ok(actionId);

  const invoke = async (input: unknown) => {
    const response = await fetch(`${baseUrl}/students/new`, {
      method: "POST",
      headers: { "Next-Action": actionId, "Content-Type": "text/plain;charset=UTF-8", Origin: baseUrl },
      body: JSON.stringify([input]),
    });
    assert.equal(response.status, 200);
    const text = await response.text();
    for (const line of text.split("\n")) {
      const match = line.match(/^\w+:(\{.*\})$/);
      if (!match) continue;
      const value = JSON.parse(match[1]);
      if (typeof value.success === "boolean") return value as { success: boolean; id?: string; message?: string };
    }
    throw new Error("No action result received.");
  };

  const { db } = await import("../db/connection");
  try {
    const [activeClass] = await db.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE")))
      .orderBy(asc(schoolClasses.id)).limit(1);
    assert.ok(activeClass);
    const list = await (await fetch(`${baseUrl}/students`)).text();
    assert.ok(list.includes("Test Amy Tan") && list.includes("Add Student"));
    const form = await (await fetch(`${baseUrl}/students/new`)).text();
    for (const field of ["name", "schoolClassId", "parentName", "parentPhone", "notes"]) {
      assert.ok(form.includes(`name="${field}"`));
    }
    assert.ok(form.includes("2026") && form.includes("1H") && form.includes("2M"));
    console.log("PASS: existing student read and database class options render.");

    const submissionId = randomUUID();
    const invalidId = randomUUID();
    const unavailableId = randomUUID();
    const testName = `Test M3A Creation ${submissionId.slice(0, 8)}`;
    const input = { submissionId, name: ` ${testName} `, schoolClassId: activeClass.id, parentName: "", parentPhone: "", notes: "M3A fictional creation test" };
    assert.equal((await invoke({ ...input, submissionId: invalidId, name: "  " })).success, false);
    assert.equal((await invoke({ ...input, submissionId: unavailableId, schoolClassId: randomUUID() })).success, false);
    const [invalidCount] = await db.select({ count: count() }).from(students).where(inArray(students.id, [invalidId, unavailableId]));
    assert.equal(invalidCount.count, 0);
    console.log("PASS: invalid input and unavailable class rejected without insertion.");

    const results = await Promise.all([invoke(input), invoke(input)]);
    assert.ok(results.every((result) => result.success && result.id === submissionId));
    assert.equal((await invoke(input)).success, true);
    const [insertCount] = await db.select({ count: count() }).from(students).where(eq(students.name, testName));
    assert.equal(insertCount.count, 1);
    const [saved] = await db.select({ name: students.name, status: students.status, parentName: students.parentName, parentPhone: students.parentPhone }).from(students).where(eq(students.id, submissionId));
    assert.equal(saved.name, testName);
    assert.equal(saved.status, "ACTIVE");
    assert.equal(saved.parentName, null);
    assert.equal(saved.parentPhone, null);
    assert.equal((await invoke({ ...input, name: "Test Changed Replay" })).success, false);
    console.log("PASS: valid creation plus concurrent/repeated submissions produce exactly one ACTIVE row; changed replay rejected.");

    const resultPage = await (await fetch(`${baseUrl}/students?created=${submissionId}`)).text();
    assert.ok(resultPage.includes(testName));
    assert.ok(resultPage.includes("Student added successfully."));
    assert.ok(resultPage.includes('aria-current="page"'));
    console.log("PASS: Students view includes the persisted student, success message, and active navigation.");
  } finally {
    await db.$client.end({ timeout: 5 });
  }
}

run().catch(() => {
  console.error("Student creation integration check failed. Raw errors withheld to protect database details.");
  process.exitCode = 1;
});
