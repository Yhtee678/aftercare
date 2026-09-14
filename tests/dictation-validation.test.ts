import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createDictationSchema, changeDictationStatusSchema, canChangeDictationStatus, dictationTypes, type DictationStatus } from "../lib/validation/dictation";
import { getCareDate } from "../lib/care-date";
import { dictationDueLabel, nextCalendarDate } from "../lib/dictation-due";

const input = { submissionId: randomUUID(), schoolClassId: randomUUID(), type: "SPELLING", source: "SCHOOL", description: " Test spelling ", assignedDate: "2026-09-14", scheduledDate: "2026-09-15" };
test("Dictation validates supported types/sources, trims description and ignores workflow fields", () => {
  for (const type of dictationTypes) for (const source of ["SCHOOL", "TUITION"]) assert.equal(createDictationSchema.safeParse({ ...input, type, source }).success, true);
  const result = createDictationSchema.parse({ ...input, status: "COMPLETED", verifiedAt: "2026-09-14" });
  assert.equal(result.description, "Test spelling");
  assert.ok(!("status" in result) && !("verifiedAt" in result));
  for (const change of [{ schoolClassId: "bad" }, { submissionId: "bad" }, { source: "OTHER" }, { type: "OTHER" }, { description: " " }, { description: "x".repeat(5001) }, { assignedDate: "2026-02-30" }, { scheduledDate: "2026-09-13" }]) assert.equal(createDictationSchema.safeParse({ ...input, ...change }).success, false);
});
test("Only intended status transitions are allowed", () => {
  const states: DictationStatus[] = ["PENDING", "NEEDS_PRACTICE", "COMPLETED"];
  const allowed = ["PENDING:COMPLETED", "PENDING:NEEDS_PRACTICE", "NEEDS_PRACTICE:COMPLETED"];
  for (const from of states) for (const to of states) assert.equal(canChangeDictationStatus(from, to), allowed.includes(`${from}:${to}`));
  assert.equal(changeDictationStatusSchema.safeParse({ id: "bad", status: "COMPLETED" }).success, false);
  assert.equal(changeDictationStatusSchema.safeParse({ id: randomUUID(), status: "PENDING" }).success, false);
});
test("Due labels use Malaysia calendar dates and retain overdue unresolved tasks", () => {
  const today = getCareDate(new Date("2026-09-13T16:00:00Z"));
  assert.equal(today, "2026-09-14");
  assert.equal(nextCalendarDate("2026-12-31"), "2027-01-01");
  assert.equal(nextCalendarDate("2028-02-28"), "2028-02-29");
  assert.equal(dictationDueLabel("2026-09-13", today, true), "已逾期，尚未完成");
  assert.equal(dictationDueLabel(today, today, true), "今日听写，尚未完成");
  assert.equal(dictationDueLabel("2026-09-15", today, true), "明日听写，尚未完成");
  assert.equal(dictationDueLabel("2026-09-16", today, true), "听写日期：2026-09-16");
  assert.equal(dictationDueLabel("2026-09-13", today, false), "已完成");
});
