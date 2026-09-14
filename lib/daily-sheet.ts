import { completionState, type DailyProgress } from "./workflow-display";
import { formatCareTime } from "./care-date";
export const dailySheetColumns = ["No.", "姓名", "学校", "班级", "到班", "吃饭", "书包", "冲凉", "听写", "补做功课", "需订正X", "听写（学 | 补）", "all done", "功课", "备注"];
export function dailySheetCells(student: DailyProgress & { name: string; mealCompleted: boolean; showerCompleted: boolean; schoolTotal: number; schoolCompleted: number; tuitionTotal: number; tuitionCompleted: number; remark?: string | null }, index: number, school: string, schoolClass: string) {
  const progress = (done: number, total: number) => total ? `${done}/${total}` : "—";
  return [String(index + 1), student.name, school, schoolClass, student.arrivalTime ? formatCareTime(student.arrivalTime) : "—", student.mealCompleted ? "✓" : "", student.bagChecked ? "✓" : "", student.showerCompleted ? "✓" : "", progress(student.dictationCompleted, student.dictationTotal), "—", student.corrections ? String(student.corrections) : "", `${progress(student.schoolCompleted, student.schoolTotal)} | ${progress(student.tuitionCompleted, student.tuitionTotal)}`, completionState(student) === "complete" ? "✓" : "", progress(student.homeworkCompleted, student.homeworkTotal), student.remark ?? ""];
}
