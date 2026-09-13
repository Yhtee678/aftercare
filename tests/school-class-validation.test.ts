import assert from "node:assert/strict";
import test from "node:test";
import { schoolClassFormSchema, createSchoolClassSchema, editSchoolClassSchema, deactivateSchoolClassSchema } from "../lib/validation/school-class";

const id = "a4b00000-0000-4000-8000-000000000001";
const input = { schoolId: id, academicYear: 2026, grade: 1, className: " Test 班级 " };

test("class form trims names and accepts integer form strings", () => {
  assert.deepEqual(schoolClassFormSchema.parse({ ...input, academicYear: "2026", grade: " 1 " }), { ...input, className: "Test 班级" });
});
test("class form rejects blank, fractional, out-of-range and non-numeric values", () => {
  for (const invalid of [
    { academicYear: "" }, { academicYear: null }, { academicYear: true }, { academicYear: "2e3" }, { academicYear: 2026.5 }, { academicYear: 999 }, { academicYear: 10000 },
    { grade: "" }, { grade: null }, { grade: true }, { grade: 0 }, { grade: 7 }, { grade: 1.5 }, { grade: NaN },
    { className: " " }, { className: 12 }, { className: "x".repeat(201) }, { schoolId: "invalid" },
  ]) assert.equal(schoolClassFormSchema.safeParse({ ...input, ...invalid }).success, false);
  assert.equal(schoolClassFormSchema.safeParse(null).success, false);
});
test("class mutation IDs are validated and status/audit fields are excluded", () => {
  assert.equal(createSchoolClassSchema.safeParse({ ...input, submissionId: "bad" }).success, false);
  assert.equal(editSchoolClassSchema.safeParse({ ...input, id: "bad" }).success, false);
  for (const value of [createSchoolClassSchema.parse({ ...input, submissionId: id, status: "INACTIVE" }), editSchoolClassSchema.parse({ ...input, id, status: "ACTIVE", updatedAt: "fake" })]) {
    assert.equal("status" in value, false);
    assert.equal("updatedAt" in value, false);
  }
});
test("class deactivation requires a valid ID and explicit boolean confirmation", () => {
  for (const value of [{ id }, { id, confirmed: false }, { id, confirmed: "true" }, { id: "invalid", confirmed: true }]) {
    assert.equal(deactivateSchoolClassSchema.safeParse(value).success, false);
  }
  assert.deepEqual(deactivateSchoolClassSchema.parse({ id, confirmed: true, className: "Ignored", status: "ACTIVE" }), { id, confirmed: true });
});
