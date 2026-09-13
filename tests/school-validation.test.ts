import assert from "node:assert/strict";
import test from "node:test";
import { createSchoolSchema, editSchoolSchema, deactivateSchoolSchema, schoolFormSchema } from "../lib/validation/school";

const id = "a4a00000-0000-4000-8000-000000000001";

test("school names are trimmed and Unicode is preserved", () => {
  assert.deepEqual(schoolFormSchema.parse({ name: "  Test 学校  " }), { name: "Test 学校" });
  assert.equal(schoolFormSchema.safeParse({ name: "a".repeat(200) }).success, true);
});

test("school forms reject missing, blank, non-text and oversized names", () => {
  for (const name of [undefined, null, "", " \n ", 123, {}, "a".repeat(201)]) {
    assert.equal(createSchoolSchema.safeParse({ submissionId: id, name }).success, false);
    assert.equal(editSchoolSchema.safeParse({ id, name }).success, false);
  }
});

test("school mutations validate IDs and exclude client status/audit fields", () => {
  assert.deepEqual(createSchoolSchema.parse({ submissionId: id, name: "Test", status: "INACTIVE" }), { submissionId: id, name: "Test" });
  assert.deepEqual(editSchoolSchema.parse({ id, name: "Test", status: "ACTIVE", updatedAt: "fake" }), { id, name: "Test" });
  for (const invalidId of [undefined, "", "not-a-uuid", 123]) {
    assert.equal(createSchoolSchema.safeParse({ submissionId: invalidId, name: "Test" }).success, false);
    assert.equal(editSchoolSchema.safeParse({ id: invalidId, name: "Test" }).success, false);
    assert.equal(deactivateSchoolSchema.safeParse({ id: invalidId, confirmed: true }).success, false);
  }
});

test("school deactivation requires explicit confirmation and accepts no editable fields", () => {
  for (const confirmed of [undefined, false, "true", 1]) {
    assert.equal(deactivateSchoolSchema.safeParse({ id, confirmed }).success, false);
  }
  assert.deepEqual(deactivateSchoolSchema.parse({ id, confirmed: true, name: "Ignored", status: "ACTIVE" }), { id, confirmed: true });
});
