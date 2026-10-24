import db from "../../../shared/db/index.js";
import { STANDARD_SECTIONS } from "../../../../models/classes.model.js";
import { addStudent } from "../../../../models/student.model.js";

// Students admitted from an application start in the general section.
const ADMISSION_SECTION = STANDARD_SECTIONS.includes("General") ? "General" : STANDARD_SECTIONS[0];

/** Enrols a student through the (legacy) students code, with the next roll number in their class. */
export const studentEnrolment = {
  async enrol(student, branchId) {
    const { maxRoll } = await db.one(
      `SELECT MAX(CAST(s.RollNumber AS UNSIGNED)) AS maxRoll
         FROM Students s JOIN Classes c ON c.ClassID = s.ClassID
        WHERE c.ClassName = ? AND c.Section = ? AND c.branch_id = ?`,
      [student.Class, ADMISSION_SECTION, branchId],
    );
    const { studentID } = await addStudent(
      {
        ...student,
        Section: ADMISSION_SECTION,
        AdmissionDate: new Date().toISOString().split("T")[0],
        RollNumber: String((maxRoll || 0) + 1),
      },
      branchId,
    );
    return studentID;
  },
};
