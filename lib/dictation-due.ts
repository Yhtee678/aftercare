/** Calendar dates are supplied by the shared Malaysian operational clock. */
export function nextCalendarDate(today: string) {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
export function dictationDueLabel(scheduled: string, today: string, unresolved: boolean) {
  if (!unresolved) return "Completed";
  if (scheduled < today) return "Overdue";
  if (scheduled === today) return "Due today";
  if (scheduled === nextCalendarDate(today)) return "Due tomorrow";
  return `Due ${scheduled}`;
}
