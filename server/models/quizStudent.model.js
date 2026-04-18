import jwt from "jsonwebtoken";
import db from "../config/db.config.js";

const TOKEN_EXPIRY = "30m";

export const verifyStudentIdentity = async ({
  branchId,
  firstName,
  lastName,
  className,
  section,
  rollNumber,
}) => {
  const [rows] = await db.query(
    `SELECT s.StudentID, s.FirstName, s.LastName, s.RollNumber, s.branch_id,
            c.ClassName, c.Section
       FROM Students s
       JOIN Classes c ON c.ClassID = s.ClassID
      WHERE s.branch_id = ?
        AND s.FirstName = ?
        AND s.LastName = ?
        AND c.ClassName = ?
        AND c.Section = ?
        AND s.RollNumber = ?
      LIMIT 1`,
    [branchId, firstName, lastName, className, section, rollNumber],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    studentId: r.StudentID,
    firstName: r.FirstName,
    lastName: r.LastName,
    rollNumber: r.RollNumber,
    className: r.ClassName,
    section: r.Section,
    branchId: r.branch_id,
  };
};

export const generateQuizToken = (studentId, branchId) =>
  jwt.sign(
    { studentId, branch_id: branchId, userType: "quiz" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: TOKEN_EXPIRY },
  );
