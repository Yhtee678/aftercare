/** Display labels only; persisted grade values remain numeric. */
export function formatGrade(grade: number | null): string {
  if (grade === null) return "未指定年级";
  return ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"][grade - 1] ?? `${grade}年级`;
}
