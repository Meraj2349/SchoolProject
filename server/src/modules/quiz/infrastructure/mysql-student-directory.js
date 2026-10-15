import db from "../../../../config/db.config.js";

// Looks up students for the quiz: by the identity they type in, or by the id
// in their quiz token. Returns the student with their current class.

const SELECT_STUDENT = `
  SELECT s.StudentID, s.FirstName, s.LastName, s.RollNumber, s.branch_id, c.ClassName, c.Section
    FROM Students s
    JOIN Classes c ON c.ClassID = s.ClassID`;

const toStudent = (row) => ({
  studentId: row.StudentID,
  firstName: row.FirstName,
  lastName: row.LastName,
  rollNumber: row.RollNumber,
  className: row.ClassName,
  section: row.Section,
  branchId: row.branch_id,
});

export const mysqlStudentDirectory = {
  async verify({ branchId, firstName, lastName, className, section, rollNumber }) {
    const [rows] = await db.query(
      `${SELECT_STUDENT}
        WHERE s.branch_id = ? AND s.FirstName = ? AND s.LastName = ?
          AND c.ClassName = ? AND c.Section = ? AND s.RollNumber = ?
        LIMIT 1`,
      [branchId, firstName, lastName, className, section, rollNumber],
    );
    return rows[0] ? toStudent(rows[0]) : null;
  },

  async findById(studentId) {
    const [rows] = await db.query(`${SELECT_STUDENT} WHERE s.StudentID = ?`, [studentId]);
    return rows[0] ? toStudent(rows[0]) : null;
  },
};
