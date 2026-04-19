import db from "../config/db.config.js";
import { branchFilter } from "../utils/branchFilter.js";

// Add a new class (branch-scoped)
export const addClass = async ({ className, section, teacherId }, branchId = null) => {
  let sql, values;
  if (branchId != null) {
    sql = `INSERT INTO Classes (ClassName, Section, TeacherID, branch_id) VALUES (?, ?, ?, ?)`;
    values = [className, section, teacherId, branchId];
  } else {
    sql = `INSERT INTO Classes (ClassName, Section, TeacherID) VALUES (?, ?, ?)`;
    values = [className, section, teacherId];
  }
  try {
    const [result] = await db.query(sql, values);
    return { ClassID: result.insertId };
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

// "Delete" on the Class Teacher Management page means unassign the teacher —
// set TeacherID = NULL. The class row itself is preserved so that Students,
// Subjects, Attendance, Exams, and Results (all FK-referenced to ClassID)
// remain intact.
export const deleteClass = async (classId, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  try {
    const [result] = await db.query(
      `UPDATE Classes SET TeacherID = NULL WHERE ClassID = ? ${clause}`,
      [classId, ...branchParams],
    );
    if (result.affectedRows === 0) {
      throw new Error("No class found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error unassigning teacher from class:", error);
    throw error;
  }
};

// Get all classes (branch-scoped)
export const getClasses = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "c");
  const sql = `
    SELECT c.ClassID, c.ClassName, c.Section, c.TeacherID, c.branch_id,
           t.FirstName AS TeacherFirstName, t.LastName AS TeacherLastName,
           t.Subject AS TeacherSubject,
           COUNT(s.StudentID) AS StudentCount
    FROM Classes c
    LEFT JOIN Teachers t ON c.TeacherID = t.TeacherID
    LEFT JOIN Students s ON s.ClassID = c.ClassID
    WHERE 1=1 ${clause}
    GROUP BY c.ClassID, c.ClassName, c.Section, c.TeacherID, c.branch_id,
             t.FirstName, t.LastName, t.Subject
  `;
  try {
    const [rows] = await db.query(sql, branchParams);
    return rows;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Edit a class by ID (branch-scoped)
export const editClass = async (classId, { className, section, teacherId }, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  const sql = `
    UPDATE Classes
    SET ClassName = ?, Section = ?, TeacherID = ?
    WHERE ClassID = ? ${clause}
  `;
  try {
    const [result] = await db.query(sql, [className, section, teacherId, classId, ...branchParams]);
    if (result.affectedRows === 0) {
      throw new Error("No class found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error editing class:", error);
    throw error;
  }
};

// Classwise student count (branch-scoped)
export const getClasswiseStudentCount = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "c");
  const sql = `
    SELECT c.ClassName, c.Section, COUNT(s.StudentID) AS StudentCount
    FROM Classes c
    LEFT JOIN Students s ON c.ClassID = s.ClassID
    WHERE 1=1 ${clause}
    GROUP BY c.ClassID
  `;
  try {
    const [rows] = await db.query(sql, branchParams);
    return rows;
  } catch (error) {
    console.error("Error fetching classwise student count:", error);
    throw error;
  }
};

// Hard-delete a class row entirely — super_admin only (irreversible)
export const hardDeleteClass = async (classId) => {
  try {
    const [result] = await db.query(
      `DELETE FROM Classes WHERE ClassID = ?`,
      [classId],
    );
    if (result.affectedRows === 0) {
      throw new Error("No class found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error hard-deleting class:", error);
    throw error;
  }
};

// Distinct class names actually in use — pulls from the live Classes table so
// any class an admin adds shows up immediately in public dropdowns.
// Branch-scoped: visitor on a branch sees only that branch's class names.
export const getDistinctClassNames = async (branchId = null) => {
  const { clause, params } = branchFilter(branchId);
  const sql = `
    SELECT DISTINCT ClassName
    FROM Classes
    WHERE ClassName IS NOT NULL AND ClassName <> '' ${clause}
    ORDER BY
      CASE WHEN ClassName REGEXP '^[0-9]+$' THEN 0 ELSE 1 END,
      CASE WHEN ClassName REGEXP '^[0-9]+$' THEN CAST(ClassName AS UNSIGNED) ELSE 0 END,
      ClassName
  `;
  try {
    const [rows] = await db.query(sql, params);
    return rows.map((r) => r.ClassName);
  } catch (error) {
    console.error("Error fetching distinct class names:", error);
    throw error;
  }
};

// Distinct section names actually in use — branch-scoped, live from Classes.
// Fallback to the three legacy sections if the branch has nothing yet so
// dropdowns are never empty for a brand-new branch.
const LEGACY_SECTIONS = ["Better", "Good", "General"];
export const getDistinctSections = async (branchId = null) => {
  const { clause, params } = branchFilter(branchId);
  const sql = `
    SELECT DISTINCT Section
    FROM Classes
    WHERE Section IS NOT NULL AND Section <> '' ${clause}
    ORDER BY Section
  `;
  try {
    const [rows] = await db.query(sql, params);
    const sections = rows.map((r) => r.Section);
    return sections.length > 0 ? sections : LEGACY_SECTIONS;
  } catch (error) {
    console.error("Error fetching distinct sections:", error);
    throw error;
  }
};

// Kept as the legacy default; new code should call getDistinctSections.
export const STANDARD_SECTIONS = LEGACY_SECTIONS;

// Get distinct class names with their sections (branch-scoped for dropdowns)
export const getDistinctClassesWithSections = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  const sql = `
    SELECT DISTINCT ClassName, Section
    FROM Classes
    WHERE 1=1 ${clause}
    ORDER BY ClassName, Section
  `;
  try {
    const [rows] = await db.query(sql, branchParams);
    return rows;
  } catch (error) {
    console.error("Error fetching distinct classes:", error);
    throw error;
  }
};

// Get total students in a class by class name (branch-scoped)
export const getTotalStudentsInClassByName = async (className, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "c");
  const sql = `
    SELECT COUNT(s.StudentID) AS TotalStudents
    FROM Students s
    JOIN Classes c ON s.ClassID = c.ClassID
    WHERE c.ClassName = ? ${clause}
  `;
  try {
    const [rows] = await db.query(sql, [className, ...branchParams]);
    return rows[0] ? rows[0].TotalStudents : 0;
  } catch (error) {
    console.error("Error fetching total students in class:", error);
    throw error;
  }
};
