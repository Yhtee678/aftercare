import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { getCareDate, formatCareTime } from "../lib/care-date";
import { careActionSchema } from "../lib/validation/care";

test("Care follows Malaysia midnight, not UTC midnight", () => {
  for (const [instant, expected] of [
    ["2026-09-13T15:59:59.999Z", "2026-09-13"], ["2026-09-13T16:00:00.000Z", "2026-09-14"],
    ["2026-09-13T23:59:59.999Z", "2026-09-14"], ["2026-09-14T00:00:00.000Z", "2026-09-14"],
    ["2026-12-31T16:00:00.000Z", "2027-01-01"], ["2028-02-28T16:00:00.000Z", "2028-02-29"],
  ]) assert.equal(getCareDate(new Date(instant)), expected);
  assert.match(formatCareTime("2026-09-13T05:30:00Z"), /13:30/);
});
test("Care validates IDs, dates and the five completion-only actions", () => {
  const input = { studentId: randomUUID(), schoolClassId: randomUUID(), recordDate: "2026-09-13", action: "arrival" };
  for (const action of ["arrival", "mealCompleted", "showerCompleted", "bagChecked", "finalCheckCompleted"]) {
    assert.equal(careActionSchema.safeParse({ ...input, action }).success, true);
  }
  for (const invalid of [{ studentId: "bad" }, { schoolClassId: "bad" }, { recordDate: "2026-02-30" }, { action: "reset" }, { action: "remark" }, { action: false }]) {
    assert.equal(careActionSchema.safeParse({ ...input, ...invalid }).success, false);
  }
  const parsed = careActionSchema.parse({ ...input, arrivalTime: "2000-01-01", mealCompleted: false, status: "INACTIVE" });
  assert.deepEqual(parsed, input);
});
