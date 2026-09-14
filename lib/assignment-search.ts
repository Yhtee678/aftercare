import { matchesStudent } from "./workflow-display";

export function matchesAssignment(studentName: string, number: number, search: string) {
  return search.normalize("NFKC").trim().split(/\s+/).every((term) =>
    term.replace(/\.$/, "") === String(number)
    || matchesStudent({ name: studentName, schoolName: "", className: "" }, term));
}
