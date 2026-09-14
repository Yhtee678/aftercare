/** Calendar dates are supplied by the shared Malaysian operational clock. */
export function nextCalendarDate(today: string) {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
export function dictationDueLabel(scheduled: string, today: string, unresolved: boolean) {
  if (!unresolved) return "已完成";
  if (scheduled < today) return "已逾期，尚未完成";
  if (scheduled === today) return "今日听写，尚未完成";
  if (scheduled === nextCalendarDate(today)) return "明日听写，尚未完成";
  return `听写日期：${scheduled}`;
}
