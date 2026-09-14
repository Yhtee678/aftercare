export const CARE_TIME_ZONE = "Asia/Kuala_Lumpur";

/** The centre's calendar day, independent of the machine/browser timezone. */
export function getCareDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CARE_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatCareTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: CARE_TIME_ZONE, hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}
