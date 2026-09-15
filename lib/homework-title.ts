export function homeworkTitle(subject: string, taskType?: string | null) {
  return `${subject.trim()}${taskType?.trim() ?? ""}`;
}
