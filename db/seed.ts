import { config } from "dotenv";
import { schoolClasses, schools, students } from "./schema";

config({ path: ".env.local", quiet: true });

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Development seed is disabled in production.");
  }

  // Load the shared Node-only connection after environment initialization.
  const { db } = await import("./connection");
  try {
    const inserted = await db.transaction(async (tx) => {
      const schoolId = "a2c00000-0000-4000-8000-000000000001";
      const classOneId = "a2c00000-0000-4000-8000-000000000101";
      const classTwoId = "a2c00000-0000-4000-8000-000000000102";

      const addedSchools = await tx.insert(schools).values({
        id: schoolId,
        name: "Taman Ceria Primary (Test School)",
      }).onConflictDoNothing({ target: schools.id }).returning({ id: schools.id });

      const addedClasses = await tx.insert(schoolClasses).values([
        { id: classOneId, schoolId, grade: 1, className: "1H", academicYear: 2026 },
        { id: classTwoId, schoolId, grade: 2, className: "2M", academicYear: 2026 },
      ]).onConflictDoNothing({ target: schoolClasses.id }).returning({ id: schoolClasses.id });

      const addedStudents = await tx.insert(students).values([
        { id: "a2c00000-0000-4000-8000-000000000201", name: "Test Amy Tan", schoolClassId: classOneId },
        { id: "a2c00000-0000-4000-8000-000000000202", name: "Test Ben Lim", schoolClassId: classOneId },
        { id: "a2c00000-0000-4000-8000-000000000203", name: "Test Chloe Lee", schoolClassId: classOneId },
        { id: "a2c00000-0000-4000-8000-000000000204", name: "Test Daniel Wong", schoolClassId: classTwoId },
        { id: "a2c00000-0000-4000-8000-000000000205", name: "Test Ella Ng", schoolClassId: classTwoId },
        { id: "a2c00000-0000-4000-8000-000000000206", name: "Test Finn Chan", schoolClassId: classTwoId, status: "INACTIVE" },
      ]).onConflictDoNothing({ target: students.id }).returning({ id: students.id });

      return { schools: addedSchools.length, classes: addedClasses.length, students: addedStudents.length };
    });
    console.log(`Seed inserted: ${inserted.schools} school(s), ${inserted.classes} class(es), ${inserted.students} student(s). Existing rows preserved.`);
  } finally {
    await db.$client.end({ timeout: 5 });
  }
}

seed().catch((error: unknown) => {
  // Driver errors can contain SQL parameters and credentials. Never print them.
  const cause = error instanceof Error ? error.cause : undefined;
  const code = cause && typeof cause === "object" && "code" in cause ? cause.code : undefined;
  console.error("Development seed failed. Check database connectivity and that the M2B migration is applied.");
  if (typeof code === "string" && /^[A-Z0-9]{5}$/.test(code)) {
    console.error(`Database error code: ${code}`);
  }
  process.exitCode = 1;
});
