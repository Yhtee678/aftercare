// Development-only: retains three Test schools, two Test classes and one Test student.
// Build/start on port 3100, then: node --import tsx tests/school-class-management.integration.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { asc, eq, notInArray, ne } from "drizzle-orm";
import { schools, schoolClasses, students } from "../db/schema";

config({ path: ".env.local", quiet: true });

async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Development test only.");
  const baseUrl = "http://localhost:3100";
  const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8")) as { node: Record<string, { exportedName: string }> };
  const invoke = async (name: string, path: string, input: unknown) => {
    const actionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === name)?.[0];
    assert.ok(actionId);
    const response = await fetch(`${baseUrl}${path}`, {
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
    const originalSchools = await db.select().from(schools).orderBy(asc(schools.id));
    const originalClasses = await db.select().from(schoolClasses).orderBy(asc(schoolClasses.id));
    const originalStudents = await db.select().from(students).orderBy(asc(students.id));
    const schoolIds = [randomUUID(), randomUUID(), randomUUID()];
    for (const schoolId of schoolIds) assert.equal((await invoke("createSchool", "/more/schools/new", { submissionId: schoolId, name: `Test M4B School ${schoolId.slice(0, 8)}` })).success, true);
    const [schoolA, schoolB, inactiveSchool] = schoolIds;
    assert.equal((await invoke("deactivateSchool", `/more/schools/${inactiveSchool}`, { id: inactiveSchool, confirmed: true })).success, true);
    assert.ok((await html("/more")).includes('href="/more/classes"'));
    const newForm = await html("/more/classes/new");
    for (const field of ["schoolId", "academicYear", "grade", "className"]) assert.ok(newForm.includes(`name="${field}"`));
    assert.ok(!newForm.includes(`value="${inactiveSchool}"`) && newForm.includes(`value="${schoolA}"`));
    for (const id of ["invalid", randomUUID()]) for (const suffix of ["", "/edit"]) assert.ok((await html(`/more/classes/${id}${suffix}`)).includes("找不到班级"));

    const id = randomUUID();
    const route = `/more/classes/${id}`;
    const readClass = async () => (await db.select().from(schoolClasses).where(eq(schoolClasses.id, id)))[0];
    const input = { submissionId: id, schoolId: schoolA, academicYear: "2026", grade: "1", className: " Test M4B Class ", status: "INACTIVE" };
    for (const invalid of [{ className: " " }, { grade: 0 }, { academicYear: "" }, { schoolId: inactiveSchool }]) {
      assert.equal((await invoke("createSchoolClass", "/more/classes/new", { ...input, ...invalid })).success, false);
    }
    assert.equal(await readClass(), undefined);
    const createdResults = await Promise.all([invoke("createSchoolClass", "/more/classes/new", input), invoke("createSchoolClass", "/more/classes/new", input)]);
    assert.ok(createdResults.every((result) => result.success && result.id === id));
    const created = await readClass();
    assert.equal(created.className, "Test M4B Class");
    assert.equal(created.status, "ACTIVE");
    const duplicateId = randomUUID();
    const duplicate = await invoke("createSchoolClass", "/more/classes/new", { ...input, submissionId: duplicateId });
    assert.equal(duplicate.success, false);
    assert.equal(duplicate.message, "同一学校、学年、年级和名称的班级已存在。");
    assert.equal((await db.select().from(schoolClasses).where(eq(schoolClasses.id, duplicateId))).length, 0);
    const secondId = randomUUID();
    assert.equal((await invoke("createSchoolClass", "/more/classes/new", { ...input, submissionId: secondId, schoolId: schoolB })).success, true);
    const [secondClass] = await db.select().from(schoolClasses).where(eq(schoolClasses.id, secondId));
    const editInput = { id, schoolId: schoolB, academicYear: 2027, grade: 2, className: "Test M4B Edited", status: "INACTIVE" };
    const conflictingEdit = await invoke("editSchoolClass", `${route}/edit`, { ...input, id, schoolId: schoolB });
    assert.equal(conflictingEdit.success, false);
    assert.equal(conflictingEdit.message, duplicate.message);
    assert.equal((await invoke("editSchoolClass", `${route}/edit`, { ...editInput, schoolId: inactiveSchool })).success, false);
    assert.deepEqual(await readClass(), created);
    assert.equal((await invoke("editSchoolClass", `${route}/edit`, editInput)).success, true);
    const edited = await readClass();
    assert.deepEqual(edited, { ...created, schoolId: schoolB, academicYear: 2027, grade: 2, className: editInput.className, updatedAt: edited.updatedAt });
    assert.ok(edited.updatedAt.getTime() > created.updatedAt.getTime());
    assert.equal((await invoke("editSchoolClass", `${route}/edit`, editInput)).success, true);
    assert.deepEqual(await readClass(), edited);
    assert.deepEqual((await db.select().from(schoolClasses).where(eq(schoolClasses.id, secondId)))[0], secondClass);
    assert.ok((await html(`${route}/edit`)).includes('value="Test M4B Edited"'));
    const detail = await html(`${route}?updated=1`);
    assert.ok(detail.includes("班级资料已更新。") && detail.includes("2027") && detail.includes("Grade 2") && detail.includes("确认停用"));
    assert.ok((await html("/more/classes")).includes(editInput.className));
    console.log("PASS: real list/detail/forms, safe IDs, active-school creation, same-name cross-school classes, duplicate create/edit errors and isolated no-op edits.");

    const studentId = randomUUID();
    const studentInput = { submissionId: studentId, name: `Test M4B Student ${studentId.slice(0, 8)}`, schoolClassId: id };
    assert.equal((await invoke("createStudent", "/students/new", studentInput)).success, true);
    const [linkedStudent] = await db.select().from(students).where(eq(students.id, studentId));
    const deactivateInput = { id, confirmed: true };
    assert.equal((await invoke("deactivateSchoolClass", route, { id })).success, false);
    const deactivations = await Promise.all([invoke("deactivateSchoolClass", route, deactivateInput), invoke("deactivateSchoolClass", route, deactivateInput)]);
    assert.ok(deactivations.every((result) => result.success && result.id === id));
    const inactive = await readClass();
    assert.deepEqual(inactive, { ...edited, status: "INACTIVE", updatedAt: inactive.updatedAt });
    assert.ok(inactive.updatedAt.getTime() > edited.updatedAt.getTime());
    assert.equal((await invoke("deactivateSchoolClass", route, { ...deactivateInput, className: "Test Unwanted", status: "ACTIVE" })).success, true);
    assert.deepEqual(await readClass(), inactive);
    assert.deepEqual((await db.select().from(students).where(eq(students.id, studentId)))[0], linkedStudent);
    assert.equal((await invoke("editSchoolClass", `${route}/edit`, { ...editInput, className: "Test M4B Inactive", status: "ACTIVE" })).success, true);
    assert.equal((await readClass()).status, "INACTIVE");
    const inactiveDetail = await html(`${route}?deactivated=1`);
    assert.ok(inactiveDetail.includes("班级已停用。") && inactiveDetail.includes(">Inactive</"));
    assert.ok(!inactiveDetail.includes(">Deactivate School Class</summary>"));
    assert.equal((await invoke("deactivateSchool", `/more/schools/${schoolB}`, { id: schoolB, confirmed: true })).success, true);
    const studentForm = await html("/students/new");
    const studentEditForm = await html(`/students/${studentId}/edit`);
    for (const classId of [id, secondId]) {
      assert.ok(!studentForm.includes(`value="${classId}"`) && !studentEditForm.includes(`value="${classId}"`));
      assert.equal((await invoke("createStudent", "/students/new", { ...studentInput, submissionId: randomUUID(), schoolClassId: classId })).success, false);
      assert.equal((await invoke("editStudent", `/students/${studentId}/edit`, { id: studentId, name: "Test Rejected", schoolClassId: classId })).success, false);
    }
    assert.ok((await html(`/more/classes/${secondId}/edit`)).includes("The current school is inactive."));
    assert.ok((await html(`/more/classes/${secondId}`)).includes("学校已停用"));
    assert.ok((await html(`/students/${studentId}`)).includes(linkedStudent.name));
    assert.deepEqual((await db.select().from(students).where(eq(students.id, studentId)))[0], linkedStudent);
    assert.deepEqual(await db.select().from(schools).where(notInArray(schools.id, schoolIds)).orderBy(asc(schools.id)), originalSchools);
    assert.deepEqual(await db.select().from(schoolClasses).where(notInArray(schoolClasses.id, [id, secondId])).orderBy(asc(schoolClasses.id)), originalClasses);
    assert.deepEqual(await db.select().from(students).where(ne(students.id, studentId)).orderBy(asc(students.id)), originalStudents);
    console.log("PASS: confirmed/idempotent deactivation, linked students preserved, no reactivation, inactive class/school selection excluded and rejected server-side; unrelated records unchanged.");
  } finally {
    await db.$client.end({ timeout: 5 });
  }
}
run().catch((error: unknown) => {
  if (error instanceof assert.AssertionError) console.error(error.stack?.split("\n").filter((line) => line.includes("at ") && line.includes("school-class-management.integration.ts")).join("\n"));
  console.error("Class integration check failed. Raw errors withheld to protect database details.");
  process.exitCode = 1;
});
