import assert from "node:assert/strict";
import test from "node:test";
import { createStudentSchema, editStudentSchema, deactivateStudentSchema } from "../lib/validation/student";

const validInput = {
  submissionId: "a3a00000-0000-4000-8000-000000000001",
  name: "  Test Student  ",
  schoolClassId: "a2c00000-0000-4000-8000-000000000101",
};

test("deactivation requires a UUID and explicit confirmation and excludes other fields", () => {
  const input = { id: validInput.submissionId, confirmed: true };
  assert.deepEqual(deactivateStudentSchema.parse({ ...input, name: "Ignored", status: "ACTIVE", notes: "Ignored", updatedAt: "fake" }), input);
  for (const invalid of [null, {}, { ...input, id: "invalid" }, { id: input.id }, { ...input, confirmed: false }, { ...input, confirmed: "true" }]) {
    assert.equal(deactivateStudentSchema.safeParse(invalid).success, false);
  }
});

test("trims names and stores absent or blank optional values as null", () => {
  const value = createStudentSchema.parse({ ...validInput, parentName: "  ", notes: "" });
  assert.equal(value.name, "Test Student");
  assert.equal(value.parentName, null);
  assert.equal(value.parentPhone, null);
  assert.equal(value.notes, null);
});

test("preserves international phone formatting and Unicode names", () => {
  const value = createStudentSchema.parse({ ...validInput, name: "Test 陈小明", parentPhone: " +60 (12) 345-6789 " });
  assert.equal(value.name, "Test 陈小明");
  assert.equal(value.parentPhone, "+60 (12) 345-6789");
});

test("rejects empty names, invalid class/submission IDs, non-text values and oversized fields", () => {
  for (const invalid of [
    { name: " \n " }, { name: 123 }, { schoolClassId: "" },
    { schoolClassId: "not-a-uuid" }, { submissionId: "not-a-uuid" },
    { name: "a".repeat(201) }, { parentName: "a".repeat(201) },
    { parentPhone: "1".repeat(51) }, { notes: "a".repeat(2001) },
    { parentPhone: 123 },
  ]) assert.equal(createStudentSchema.safeParse({ ...validInput, ...invalid }).success, false);
  assert.equal(createStudentSchema.safeParse(null).success, false);
});

test("does not accept client-supplied status or extra database fields", () => {
  const value = createStudentSchema.parse({ ...validInput, status: "INACTIVE", createdAt: "fake" });
  assert.equal("status" in value, false);
  assert.equal("createdAt" in value, false);
});

test("edit reuses field validation, requires a student UUID and excludes status/audit fields", () => {
  const input = { ...validInput, id: validInput.submissionId, parentName: " ", status: "INACTIVE", updatedAt: "fake" };
  const value = editStudentSchema.parse(input);
  assert.equal(value.name, "Test Student");
  assert.equal(value.parentName, null);
  assert.equal("status" in value, false);
  assert.equal("updatedAt" in value, false);
  assert.equal("submissionId" in value, false);
  for (const invalid of [{ id: "invalid" }, { name: " " }, { schoolClassId: "" }, { notes: "a".repeat(2001) }]) {
    assert.equal(editStudentSchema.safeParse({ ...input, ...invalid }).success, false);
  }
});
