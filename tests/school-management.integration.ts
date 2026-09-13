// Explicit development integration test. Retains one Test school, class and student.
// Build/start the app on port 3100, then: node --import tsx tests/school-management.integration.ts
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { asc, eq, ne } from "drizzle-orm";
import { schools, schoolClasses, students } from "../db/schema";

config({ path: ".env.local", quiet: true });

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Development test only.");
  const baseUrl = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as {
    node: Record<string, { exportedName: string }>;
  };
  const invoke = async (name: string, route: string, input: unknown) => {
    const actionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === name)?.[0];
    assert.ok(actionId);
    const response = await fetch(`${baseUrl}${route}`, {
      method: "POST", headers: { "Next-Action": actionId, "Content-Type": "text/plain;charset=UTF-8", Origin: baseUrl },
      body: JSON.stringify([input]),
    });
    assert.equal(response.status, 200);
    for (const line of (await response.text()).split("\n")) {
      const match = line.match(/^\w+:(\{.*\})$/);
      if (!match) continue;
      const value = JSON.parse(match[1]);
      if (typeof value.success === "boolean") return value as { success: boolean; id?: string };
    }
    throw new Error("No action result received.");
  };
  // React separates adjacent text nodes with comments in streamed HTML.
  const html = async (path: string) => (await (await fetch(`${baseUrl}${path}`)).text()).replace(/<!--[\s\S]*?-->/g, "");
  const { db } = await import("../db/connection");
  try {
    const otherSchools = await db.select().from(schools).orderBy(asc(schools.id));
    const otherClasses = await db.select().from(schoolClasses).orderBy(asc(schoolClasses.id));
    const otherStudents = await db.select().from(students).orderBy(asc(students.id));
    const id = randomUUID();
    const route = `/more/schools/${id}`;
    const readSchool = async () => (await db.select().from(schools).where(eq(schools.id, id)))[0];
    assert.ok((await html("/more")).includes('href="/more/schools"'));
    const list = await html("/more/schools");
    assert.ok(list.includes("Add School"));
    for (const school of otherSchools) assert.ok(list.includes(`/more/schools/${school.id}`));
    assert.ok((await html("/more/schools/new")).includes('name="name"'));
    for (const invalidId of ["invalid", randomUUID()]) {
      for (const suffix of ["", "/edit"]) assert.ok((await html(`/more/schools/${invalidId}${suffix}`)).includes("School not found"));
    }
    for (const name of ["", "  ", 123, "a".repeat(201)]) {
      assert.equal((await invoke("createSchool", "/more/schools/new", { submissionId: id, name })).success, false);
    }
    assert.equal(await readSchool(), undefined);
    const input = { submissionId: id, name: ` Test M4A School ${id.slice(0, 8)} `, status: "INACTIVE" };
    const createdResults = await Promise.all([invoke("createSchool", "/more/schools/new", input), invoke("createSchool", "/more/schools/new", input)]);
    assert.ok(createdResults.every((result) => result.success && result.id === id));
    const created = await readSchool();
    assert.equal(created.name, input.name.trim());
    assert.equal(created.status, "ACTIVE");
    assert.equal((await invoke("createSchool", "/more/schools/new", { ...input, name: "Test Changed Retry" })).success, false);
    const detail = await html(`${route}?created=1`);
    assert.ok(detail.includes(created.name) && detail.includes("School added successfully.") && detail.includes("Created (UTC)"));
    assert.ok((await html(`${route}/edit`)).includes(`value="${created.name}"`));
    console.log("PASS: More link, real school list/detail, missing IDs, name validation, ACTIVE creation and concurrent retry protection.");

    const editInput = { id, name: `Test M4A Renamed ${id.slice(0, 8)}`, status: "INACTIVE" };
    assert.equal((await invoke("editSchool", `${route}/edit`, { ...editInput, name: " " })).success, false);
    assert.deepEqual(await readSchool(), created);
    assert.equal((await invoke("editSchool", `${route}/edit`, editInput)).success, true);
    const edited = await readSchool();
    assert.equal(edited.name, editInput.name);
    assert.equal(edited.status, "ACTIVE");
    assert.ok(edited.updatedAt.getTime() > created.updatedAt.getTime());
    assert.deepEqual(edited, { ...created, name: editInput.name, updatedAt: edited.updatedAt });
    assert.equal((await invoke("editSchool", `${route}/edit`, editInput)).success, true);
    assert.deepEqual(await readSchool(), edited);
    assert.ok((await html(`${route}?updated=1`)).includes("School updated successfully."));

    // Isolated relationship fixtures, never existing classes or students.
    const classId = randomUUID();
    const [testClass] = await db.insert(schoolClasses).values({ id: classId, schoolId: id, grade: 1, academicYear: 2026, className: "Test M4A Class" }).returning();
    const studentId = randomUUID();
    const studentInput = { submissionId: studentId, schoolClassId: classId, name: `Test M4A Student ${studentId.slice(0, 8)}` };
    assert.equal((await invoke("createStudent", "/students/new", studentInput)).success, true);
    const [testStudent] = await db.select().from(students).where(eq(students.id, studentId));
    assert.ok((await html("/students/new")).includes(`value="${classId}"`));
    const deactivateInput = { id, confirmed: true };
    assert.equal((await invoke("deactivateSchool", route, { id })).success, false);
    assert.equal((await invoke("deactivateSchool", route, { ...deactivateInput, id: randomUUID() })).success, false);
    assert.deepEqual(await readSchool(), edited);
    const deactivations = await Promise.all([invoke("deactivateSchool", route, deactivateInput), invoke("deactivateSchool", route, deactivateInput)]);
    assert.ok(deactivations.every((result) => result.success && result.id === id));
    const inactive = await readSchool();
    assert.equal(inactive.status, "INACTIVE");
    assert.ok(inactive.updatedAt.getTime() > edited.updatedAt.getTime());
    assert.deepEqual(inactive, { ...edited, status: "INACTIVE", updatedAt: inactive.updatedAt });
    assert.equal((await invoke("deactivateSchool", route, { ...deactivateInput, name: "Test Unwanted", status: "ACTIVE" })).success, true);
    assert.deepEqual(await readSchool(), inactive);
    assert.deepEqual((await db.select().from(schoolClasses).where(eq(schoolClasses.id, classId)))[0], testClass);
    assert.deepEqual((await db.select().from(students).where(eq(students.id, studentId)))[0], testStudent);
    console.log("PASS: isolated name edit, timestamps, confirmation, ACTIVE to INACTIVE and idempotency; related class/student preserved.");

    const inactiveDetail = await html(`${route}?deactivated=1`);
    assert.ok(inactiveDetail.includes("School deactivated successfully.") && inactiveDetail.includes(">Inactive</"));
    assert.ok(!inactiveDetail.includes(">Deactivate School</summary>"));
    assert.ok(!(await html("/students/new")).includes(`value="${classId}"`));
    const invalidStudentId = randomUUID();
    assert.equal((await invoke("createStudent", "/students/new", { ...studentInput, submissionId: invalidStudentId })).success, false);
    assert.equal((await db.select().from(students).where(eq(students.id, invalidStudentId))).length, 0);
    assert.equal((await invoke("editStudent", `/students/${studentId}/edit`, { id: studentId, name: "Test Rejected", schoolClassId: classId })).success, false);
    assert.ok((await html(`/students/${studentId}`)).includes(testStudent.name));
    assert.ok((await html("/students")).includes(testStudent.name));
    assert.equal((await invoke("editSchool", `${route}/edit`, { ...editInput, name: `${editInput.name} Inactive`, status: "ACTIVE" })).success, true);
    assert.equal((await readSchool()).status, "INACTIVE");
    assert.deepEqual(await db.select().from(schools).where(ne(schools.id, id)).orderBy(asc(schools.id)), otherSchools);
    assert.deepEqual(await db.select().from(schoolClasses).where(ne(schoolClasses.id, classId)).orderBy(asc(schoolClasses.id)), otherClasses);
    assert.deepEqual(await db.select().from(students).where(ne(students.id, studentId)).orderBy(asc(students.id)), otherStudents);
    console.log("PASS: inactive UI, unavailable class selection enforced server-side, student history reads, no reactivation and no unrelated changes.");
  } finally {
    await db.$client.end({ timeout: 5 });
  }
}

run().catch((error: unknown) => {
  if (error instanceof assert.AssertionError) {
    console.error(error.stack?.split("\n").filter((line) => line.includes("at ") && line.includes("school-management.integration.ts")).join("\n"));
  }
  console.error("School integration check failed. Raw errors withheld to protect database details.");
  process.exitCode = 1;
});
