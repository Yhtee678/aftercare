export const homeworkSubjects = ["华文", "国文", "英文", "数学", "科学", "历史", "道德", "美术", "设计与工艺"] as const;
export const homeworkMaterials = ["作业", "簿子", "活动本", "3M报", "纸"] as const;
export function resolveOption(choice: string, custom: string) { return (choice === "其他" ? custom : choice).trim(); }
export function contentLines(text: string) { return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean); }
export function matchesStudent(student: { name: string; schoolName: string; className: string }, search: string) {
  const normalize = (text: string) => text.normalize("NFKC").toLocaleLowerCase();
  const haystack = normalize(`${student.name} ${student.schoolName} ${student.className}`);
  return normalize(search).trim().split(/\s+/).every((part) => haystack.includes(part));
}
export type DailyProgress = { arrivalTime: string | null; finalCheckCompleted: boolean; bagChecked: boolean; homeworkTotal: number; homeworkCompleted: number; corrections: number; dictationTotal: number; dictationCompleted: number; practice: number };
export function completionState(value: DailyProgress) {
  if (value.corrections || value.practice || value.dictationCompleted < value.dictationTotal) return "attention";
  if (!value.arrivalTime) return "not-arrived";
  if (!value.bagChecked) return "attention";
  return value.finalCheckCompleted && value.homeworkCompleted === value.homeworkTotal && value.dictationCompleted === value.dictationTotal ? "complete" : "progress";
}
export const completionStyles = { attention: "border-red-300 bg-red-50", "not-arrived": "border-slate-200 bg-slate-50", complete: "border-green-300 bg-green-50", progress: "border-amber-200 bg-amber-50" };
export const completionLabels = { attention: "需要注意", "not-arrived": "未到班", complete: "全部完成", progress: "进行中" };
export function gradeSummaries<T extends { grade: number; activeStudents: number; arrived: number; bagsChecked: number; homeworkTotal: number; homeworkCompleted: number }>(classes: T[], attention: { grade: number }[]) {
  return [1, 2, 3, 4, 5, 6].map((grade) => ({ grade, ...classes.filter((item) => item.grade === grade).reduce((sum, item) => ({ students: sum.students + item.activeStudents, arrived: sum.arrived + item.arrived, bags: sum.bags + item.bagsChecked, homeworkTotal: sum.homeworkTotal + item.homeworkTotal, homeworkCompleted: sum.homeworkCompleted + item.homeworkCompleted }), { students: 0, arrived: 0, bags: 0, homeworkTotal: 0, homeworkCompleted: 0 }), attention: attention.filter((item) => item.grade === grade).length }));
}
