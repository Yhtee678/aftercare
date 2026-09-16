export type AssignmentClass = { id: string; grade: number; className: string; schoolName: string; academicYear: number };
export type AssignmentStudent = { id: string; name: string; schoolClassId: string };

export function classesForGrade(classes: AssignmentClass[], grade: number | null) {
  return grade === null ? [] : classes.filter((item) => item.grade === grade);
}

export function studentsForClass(students: AssignmentStudent[], classId: string, search = "") {
  const term = search.trim().toLocaleLowerCase();
  return students.filter((item) => item.schoolClassId === classId &&
    (!term || item.name.toLocaleLowerCase().includes(term) || item.id.toLowerCase().includes(term)));
}

export function selectVisible(selected: string[], visible: AssignmentStudent[]) {
  return [...new Set([...selected, ...visible.map((item) => item.id)])];
}
