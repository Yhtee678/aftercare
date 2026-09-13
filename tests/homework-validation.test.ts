import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { canChangeHomeworkStatus, createHomeworkSchema, changeHomeworkStatusSchema, type HomeworkStatus } from "../lib/validation/homework";

const input = { submissionId: randomUUID(), schoolClassId: randomUUID(), subject: " Test Math ", description: " Test exercise ", taskType: "", pageFrom: "20", pageTo: "22", taskDate: "2026-09-13" };
test("creation trims text, parses pages and strips client workflow state", () => {
  const result = createHomeworkSchema.parse({ ...input, scope: "INDIVIDUAL", status: "COMPLETED" });
  assert.equal(result.subject, "Test Math");
  assert.equal(result.description, "Test exercise");
  assert.equal(result.taskType, null);
  assert.equal(result.pageFrom, 20);
  assert.ok(!("status" in result) && !("scope" in result));
  assert.equal(createHomeworkSchema.parse({ ...input, pageFrom: "", pageTo: "" }).pageFrom, null);
});
test("rejects invalid references, text, dates and page ranges", () => {
  for (const invalid of [
    { submissionId: "bad" }, { schoolClassId: "bad" }, { subject: " " }, { description: " " },
    { subject: "x".repeat(201) }, { description: "x".repeat(5001) }, { taskType: "x".repeat(201) },
    { taskDate: "2026-02-30" }, { pageFrom: "0" }, { pageFrom: true }, { pageFrom: "1.5" },
    { pageFrom: "2147483648" }, { pageFrom: "", pageTo: "2" }, { pageTo: "19" },
  ]) assert.equal(createHomeworkSchema.safeParse({ ...input, ...invalid }).success, false);
});
test("only the three teacher checking transitions are allowed", () => {
  const statuses: HomeworkStatus[] = ["PENDING", "CORRECTION_REQUIRED", "COMPLETED"];
  const allowed = new Set(["PENDING:COMPLETED", "PENDING:CORRECTION_REQUIRED", "CORRECTION_REQUIRED:COMPLETED"]);
  for (const from of statuses) for (const to of statuses) assert.equal(canChangeHomeworkStatus(from, to), allowed.has(`${from}:${to}`));
  assert.equal(changeHomeworkStatusSchema.safeParse({ id: randomUUID(), status: "PENDING" }).success, false);
  assert.equal(changeHomeworkStatusSchema.safeParse({ id: "bad", status: "COMPLETED" }).success, false);
});
