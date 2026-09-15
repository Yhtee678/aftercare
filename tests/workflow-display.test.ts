import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import { completionState, contentLines, gradeSummaries, matchesStudent, homeworkSubjects, homeworkMaterials } from "../lib/workflow-display";
import { homeworkOptionsSchema } from "../lib/validation/homework-options";
import { createDictationSchema } from "../lib/validation/dictation";
import { dailySheetCells, dailySheetColumns } from "../lib/daily-sheet";
import { optimisticCare } from "../lib/care-optimistic";

test("six grade summaries combine schools without leaking counts between grades", () => {
  const base = { activeStudents: 2, arrived: 1, bagsChecked: 1, homeworkTotal: 3, homeworkCompleted: 2 };
  const classes = [{ ...base, grade: 1 }, { ...base, grade: 1 }, { ...base, grade: 2 }];
  const copy = structuredClone(classes);
  const grades = gradeSummaries(classes, [{ grade: 1 }, { grade: 1 }, { grade: 6 }]);
  assert.equal(grades.length, 6);
  assert.deepEqual(grades[0], { grade: 1, students: 4, arrived: 2, bags: 2, homeworkTotal: 6, homeworkCompleted: 4, attention: 2 });
  assert.equal(grades[1].students, 2);
  assert.equal(grades[5].attention, 1); // Historical attention survives even without an active roster.
  assert.deepEqual(classes, copy);
});
test("student search supports Chinese, school/class, case and full-width input", () => {
  const student = { name: "Test 陈小明", schoolName: "中化三小", className: "1B" };
  for (const search of ["", "陈", "中化三小", "1b", "１Ｂ", "陈 1B"]) assert.equal(matchesStudent(student, search), true);
  assert.equal(matchesStudent(student, "陈 2B"), false);
});
test("homework options preserve meaningful text; Other must have a value", () => {
  const input = { subjectChoice: "华文", customSubject: "", typeChoice: "", customType: "" };
  for (const subjectChoice of homeworkSubjects) for (const typeChoice of ["", ...homeworkMaterials]) {
    assert.deepEqual(homeworkOptionsSchema.parse({ ...input, subjectChoice, typeChoice }), { subject: subjectChoice, taskType: typeChoice });
  }
  assert.deepEqual(homeworkOptionsSchema.parse({ subjectChoice: "其他", customSubject: "  Test 科目  ", typeChoice: "其他", customType: "  Test 材料 " }), { subject: "Test 科目", taskType: "Test 材料" });
  for (const change of [{ subjectChoice: "" }, { subjectChoice: "其他" }, { typeChoice: "其他" }, { customSubject: "x".repeat(201) }]) assert.equal(homeworkOptionsSchema.safeParse({ ...input, ...change }).success, false);
});
test("dictation formatting preserves paragraphs and validates persisted format", () => {
  assert.deepEqual(contentLines(" 苹果\r\n\r\n学校\n 老师 "), ["苹果", "学校", "老师"]);
  const input = { submissionId: randomUUID(), schoolClassId: randomUUID(), type: "DICTATION", source: "SCHOOL", description: "春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。", assignedDate: "2026-09-14", scheduledDate: "2026-09-14" };
  assert.equal(createDictationSchema.parse(input).contentFormat, "PLAIN");
  for (const contentFormat of ["PLAIN", "NUMBERED"]) assert.equal(createDictationSchema.parse({ ...input, contentFormat }).description, input.description);
  assert.equal(createDictationSchema.safeParse({ ...input, contentFormat: "HTML" }).success, false);
});
const complete = { arrivalTime: "2026-09-14T05:30:00Z", mealCompleted: true, showerCompleted: true, bagChecked: true, finalCheckCompleted: true, homeworkTotal: 2, homeworkCompleted: 2, corrections: 0, dictationTotal: 1, dictationCompleted: 1, practice: 0 };
test("completion colors derive from academic work, bag and final check", () => {
  assert.equal(completionState(complete), "complete");
  assert.equal(completionState({ ...complete, finalCheckCompleted: false }), "progress");
  assert.equal(completionState({ ...complete, homeworkCompleted: 1 }), "progress");
  assert.equal(completionState({ ...complete, corrections: 1 }), "attention");
  assert.equal(completionState({ ...complete, dictationCompleted: 0 }), "attention");
  assert.equal(completionState({ ...complete, bagChecked: false }), "attention");
  assert.equal(completionState({ ...complete, arrivalTime: null }), "not-arrived");
});
test("optimistic patches do not mutate confirmed state; retries retain arrival and other flags", () => {
  const confirmed = { ...complete, mealCompleted: false };
  const preview = optimisticCare(confirmed, "mealCompleted", "2099-01-01T00:00:00Z");
  assert.equal(preview.mealCompleted, true);
  assert.equal(confirmed.mealCompleted, false); // This remains the rollback baseline on failure.
  assert.deepEqual(optimisticCare(preview, "mealCompleted", "2099-01-01T00:00:00Z"), preview);
  assert.equal(optimisticCare(confirmed, "arrival", "2099-01-01T00:00:00Z").arrivalTime, complete.arrivalTime);
  const absent = { ...confirmed, arrivalTime: null };
  assert.deepEqual(optimisticCare(absent, "mealCompleted", "2099-01-01T00:00:00Z"), absent);
});
test("print lists all homework and groups dictation by source, never status", () => {
  const row = { ...complete, remark: "Test 备注", name: "Test 陈小明", homework: [
    { subject: "数学", taskType: "作业", status: "COMPLETED" },
    { subject: "华文", taskType: "习字", status: "PENDING" },
    { subject: "科学", taskType: "作业", status: "COMPLETED" },
  ], dictation: [
    { source: "SCHOOL" as const, type: "DICTATION" as const, status: "COMPLETED" as const },
    { source: "SCHOOL" as const, type: "EJAAN" as const, status: "NEEDS_PRACTICE" as const },
    { source: "TUITION" as const, type: "SPELLING" as const, status: "PENDING" as const },
  ] };
  assert.deepEqual(dailySheetColumns, ["No.", "姓名", "学校", "班级", "到班", "吃饭", "书包", "冲凉", "听写", "补做功课", "需订正X", "听写（学）", "听写（补）", "all done", "功课", "备注"]);
  assert.deepEqual(dailySheetCells(row, 11, "Test 学校", "1B"), ["12", row.name, "Test 学校", "1B", "13:30", "✓", "✓", "✓", "", "—", "", "听写、Ejaan", "Spelling", "✓", "数学作业、华文习字、科学作业", "Test 备注"]);
  const empty = dailySheetCells({ ...row, homework: [], dictation: [] }, 0, "Test 学校", "1B");
  assert.equal(empty[8], "");
  for (const column of [11, 12, 14]) assert.equal(empty[column], "-");
  const completedCells = dailySheetCells({ ...row, dictation: row.dictation.map(item=>({...item,status:"COMPLETED" as const})) }, 0, "Test 学校", "1B");
  const expected = dailySheetCells(row, 0, "Test 学校", "1B");
  expected[8] = "✓";
  assert.deepEqual(completedCells, expected);
  for (const status of ["PENDING", "NEEDS_PRACTICE"] as const) {
    assert.equal(dailySheetCells({ ...row, dictation: [{ ...row.dictation[0], status }] }, 0, "Test 学校", "1B")[8], "");
  }
});
