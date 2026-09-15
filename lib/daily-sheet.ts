import { homeworkTitle } from "./homework-title";
import { dictationTypeLabels, type DictationStatus } from "./validation/dictation";
import { completionState, type DailyProgress } from "./workflow-display";
import { formatCareTime } from "./care-date";

export const dailySheetColumns = ["No.", "姓名", "学校", "班级", "到班", "吃饭", "书包", "冲凉", "听写", "补做功课", "需订正X", "听写（学）", "听写（补）", "all done", "功课", "备注"];
type PrintStudent = DailyProgress & {
  name: string;
  mealCompleted: boolean; showerCompleted: boolean; remark?: string | null;
  homework: { subject: string; taskType: string | null }[];
  dictation: { source: "SCHOOL" | "TUITION"; type: keyof typeof dictationTypeLabels; status: DictationStatus }[];
};
export function dailySheetCells(student: PrintStudent, index: number, school: string, schoolClass: string) {
  const list = (names: string[]) => names.length ? names.join("、") : "-";
  return [String(index + 1), student.name, school, schoolClass,
    student.arrivalTime ? formatCareTime(student.arrivalTime) : "—",
    student.mealCompleted ? "✓" : "", student.bagChecked ? "✓" : "", student.showerCompleted ? "✓" : "",
    student.dictation.length > 0 && student.dictation.every(item=>item.status === "COMPLETED") ? "✓" : "", "—", student.corrections ? String(student.corrections) : "",
    list(student.dictation.filter(item=>item.source === "SCHOOL").map(item=>dictationTypeLabels[item.type])),
    list(student.dictation.filter(item=>item.source === "TUITION").map(item=>dictationTypeLabels[item.type])),
    completionState(student) === "complete" ? "✓" : "",
    list(student.homework.map(item=>homeworkTitle(item.subject,item.taskType))), student.remark ?? ""];
}
