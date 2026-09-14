// Explicit development integration test: leaves one fictional Test student.
// Run against a local production server after `npm run build`:
// npx tsx tests/student-creation.integration.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { and, asc, count, eq, inArray, ne } from "drizzle-orm";
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
  const editActionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === "editStudent")?.[0];
  assert.ok(editActionId);
  const deactivateActionId = Object.entries(manifest.node).find(([, entry]) => entry.exportedName === "deactivateStudent")?.[0];
  assert.ok(deactivateActionId);

  const invoke = async (input: unknown, editingId?: string, deactivating = false) => {
    const response = await fetch(`${baseUrl}${editingId ? `/students/${editingId}${deactivating ? "" : "/edit"}` : "/students/new"}`, {
      method: "POST",
      headers: { "Next-Action": deactivating ? deactivateActionId : editingId ? editActionId : actionId, "Content-Type": "text/plain;charset=UTF-8", Origin: baseUrl },
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
    assert.ok(list.includes("Test Amy Tan") && list.includes("添加学生"));
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
    assert.ok(resultPage.includes("学生已添加。"));
    assert.ok(resultPage.includes('aria-current="page"'));
    console.log("PASS: Students view includes the persisted student, success message, and active navigation.");

    const detail = await (await fetch(`${baseUrl}/students/${submissionId}`)).text();
    assert.ok(detail.includes(testName) && detail.includes("编辑学生") && detail.includes("未填写"));
    assert.ok(resultPage.includes(`href="/students/${submissionId}"`));
    const editForm = await (await fetch(`${baseUrl}/students/${submissionId}/edit`)).text();
    assert.ok(editForm.includes(`value="${testName}"`) && editForm.includes("保存更改"));
    assert.ok(!editForm.includes('name="status"'));
    for (const id of ["invalid-id", randomUUID()]) {
      for (const suffix of ["", "/edit"]) {
        const missing = await (await fetch(`${baseUrl}/students/${id}${suffix}`)).text();
        assert.ok(missing.includes("找不到学生"));
      }
    }
    console.log("PASS: detail, prefilled edit form, list links and invalid/missing route IDs.");

    const readTarget = async () => (await db.select().from(students).where(eq(students.id, submissionId)))[0];
    const before = await readTarget();
    const otherRows = await db.select().from(students).where(ne(students.id, submissionId)).orderBy(asc(students.id));
    const [otherClass] = await db.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(ne(schoolClasses.id, activeClass.id), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE"))).limit(1);
    assert.ok(otherClass);
    const editInput = { ...input, id: submissionId, schoolClassId: otherClass.id, name: `Test M3B Edited ${submissionId.slice(0, 8)}`, parentName: "Test Parent", parentPhone: "+60 12 000 0000", notes: "M3B fictional edit test", status: "INACTIVE" };
    assert.equal((await invoke({ ...editInput, name: " " }, submissionId)).success, false);
    assert.equal((await invoke({ ...editInput, schoolClassId: randomUUID() }, submissionId)).success, false);
    assert.equal((await invoke({ ...editInput, id: randomUUID() }, submissionId)).success, false);
    assert.deepEqual(await readTarget(), before);
    console.log("PASS: invalid edit, unavailable class and missing student rejected without updating.");

    const edits = await Promise.all([invoke(editInput, submissionId), invoke(editInput, submissionId)]);
    assert.ok(edits.every((result) => result.success && result.id === submissionId));
    const after = await readTarget();
    assert.equal(after.name, editInput.name);
    assert.equal(after.schoolClassId, otherClass.id);
    assert.equal(after.parentName, editInput.parentName);
    assert.equal(after.parentPhone, editInput.parentPhone);
    assert.equal(after.notes, editInput.notes);
    assert.equal(after.status, before.status);
    assert.equal(after.createdAt.getTime(), before.createdAt.getTime());
    assert.ok(after.updatedAt.getTime() > before.updatedAt.getTime());
    assert.equal((await invoke(editInput, submissionId)).success, true);
    assert.deepEqual(await readTarget(), after);
    assert.deepEqual(await db.select().from(students).where(ne(students.id, submissionId)).orderBy(asc(students.id)), otherRows);
    const updatedDetail = await (await fetch(`${baseUrl}/students/${submissionId}?updated=1`)).text();
    assert.ok(updatedDetail.includes(editInput.name) && updatedDetail.includes("学生资料已更新。") && updatedDetail.includes("Test Parent"));
    assert.ok((await (await fetch(`${baseUrl}/students`)).text()).includes(editInput.name));
    console.log("PASS: edit changes exactly the intended row, preserves status/created_at, advances updated_at, makes retries a no-op, and refreshes detail/list.");

    assert.ok(updatedDetail.includes("停用学生") && updatedDetail.includes("确认停用"));
    assert.ok(updatedDetail.includes("This marks the student as inactive.") && updatedDetail.includes(editInput.name));
    const deactivateInput = { id: submissionId, confirmed: true };
    for (const invalid of [{ id: submissionId }, { ...deactivateInput, confirmed: false }, { ...deactivateInput, id: "invalid" }, { ...deactivateInput, id: randomUUID() }]) {
      assert.equal((await invoke(invalid, submissionId, true)).success, false);
    }
    assert.deepEqual(await readTarget(), after);
    const deactivations = await Promise.all([invoke(deactivateInput, submissionId, true), invoke(deactivateInput, submissionId, true)]);
    assert.ok(deactivations.every((result) => result.success && result.id === submissionId));
    const inactive = await readTarget();
    assert.equal(inactive.status, "INACTIVE");
    assert.ok(inactive.updatedAt.getTime() > after.updatedAt.getTime());
    assert.deepEqual(inactive, { ...after, status: "INACTIVE", updatedAt: inactive.updatedAt });
    assert.equal((await invoke({ ...deactivateInput, name: "Test Unwanted Change", status: "ACTIVE", notes: "Unwanted" }, submissionId, true)).success, true);
    assert.deepEqual(await readTarget(), inactive);
    assert.deepEqual(await db.select().from(students).where(ne(students.id, submissionId)).orderBy(asc(students.id)), otherRows);
    console.log("PASS: confirmation/ID validation, concurrent ACTIVE to INACTIVE transition, unchanged other rows/fields and idempotent inactive retries.");

    const inactiveDetail = await (await fetch(`${baseUrl}/students/${submissionId}?deactivated=1`)).text();
    assert.ok(inactiveDetail.includes("学生已停用。") && inactiveDetail.includes(">Inactive</"));
    assert.ok(!inactiveDetail.includes(">Deactivate Student</summary>"));
    const inactiveList = await (await fetch(`${baseUrl}/students`)).text();
    const card = inactiveList.match(new RegExp(`<a[^>]*href="/students/${submissionId}"[^>]*>[\\s\\S]*?</a>`))?.[0];
    assert.ok(card?.includes("已停用") && card.includes(editInput.name));
    const inactiveEdit = { ...editInput, notes: "M3C fictional inactive edit test", status: "ACTIVE" };
    assert.equal((await invoke(inactiveEdit, submissionId)).success, true);
    const editedInactive = await readTarget();
    assert.equal(editedInactive.status, "INACTIVE");
    assert.equal(editedInactive.notes, inactiveEdit.notes);
    assert.equal((await invoke(deactivateInput, submissionId, true)).success, true);
    assert.deepEqual(await readTarget(), editedInactive);
    assert.deepEqual(await db.select().from(students).where(ne(students.id, submissionId)).orderBy(asc(students.id)), otherRows);
    console.log("PASS: inactive detail/list badges, success notice, hidden deactivation action and editing without reactivation.");
  } finally {
    await db.$client.end({ timeout: 5 });
  }
}

run().catch(() => {
  console.error("Student creation integration check failed. Raw errors withheld to protect database details.");
  process.exitCode = 1;
});
