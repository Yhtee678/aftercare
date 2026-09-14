import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesAssignment } from "../lib/assignment-search";

test("assignment search matches names and exact display numbers", () => {
  for (const search of ["", "陈", "12", "12.", "１２", "陈 12", "TEST"]) assert.equal(matchesAssignment("Test 陈小明", 12, search), true);
  for (const search of ["李", "2", "112", "陈 13"]) assert.equal(matchesAssignment("Test 陈小明", 12, search), false);
});
test("filtering keeps full-list sequence numbers and order", () => {
  const full = Array.from({ length: 15 }, (_, index) => ({ number: index + 1, name: index === 11 ? "Test 陈小明" : "Test 李" }));
  const before = structuredClone(full);
  for (const search of ["陈", "12"]) assert.deepEqual(full.filter((item) => matchesAssignment(item.name, item.number, search)), [full[11]]);
  assert.deepEqual(full, before);
  assert.deepEqual(full.filter((item) => matchesAssignment(item.name, item.number, "")), before);
});
