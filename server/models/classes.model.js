import db from "../config/db.config.js";

// ─────────────────────────────────────────────────────────────
// Classes are GLOBAL (shared across all branches).
// Teacher assignments live in ClassTeacherAssignments (per-branch).
// StudentCount in getClasses is branch-scoped when branchId is provided.
// ─────────────────────────────────────────────────────────────

export const addClass = async ({ className, section }) => {
  try {
    const [result] = await db.query(
      `INSERT INTO Classes (ClassName, Section) VALUES (?, ?)`,
      [className, section],
    );
    return { ClassID: result.insertId };
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

export const editClass = async (classId, { className, section }) => {
  try {
    const [result] = await db.query(
      `UPDATE Classes SET ClassName = ?, Section = ? WHERE ClassID = ?`,
      [className, section, classId],
    );
    if (result.affectedRows === 0) {
      throw new Error("No class found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error editing class:", error);
    throw error;
  }
};

// Hard-delete removes the class row entirely. FK cascades in
// ClassTeacherAssignments; Students.ClassID is ON DELETE RESTRICT so this
// will fail if any students still reference it.
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

// Returns all global classes. StudentCount and teacher info are branch-scoped
// when branchId is given. When null (super_admin, no filter), the teacher
// columns are null and StudentCount is total across every branch.
export const getClasses = async (branchId = null) => {
  const studentJoin =
    branchId != null
      ? "LEFT JOIN Students s ON s.ClassID = c.ClassID AND s.branch_id = ?"
      : "LEFT JOIN Students s ON s.ClassID = c.ClassID";
  const teacherJoin =
    branchId != null
      ? `LEFT JOIN ClassTeacherAssignments cta ON cta.ClassID = c.ClassID AND cta.branch_id = ?
         LEFT JOIN Teachers t ON t.TeacherID = cta.TeacherID`
      : `LEFT JOIN ClassTeacherAssignments cta ON 1 = 0
         LEFT JOIN Teachers t ON t.TeacherID = cta.TeacherID`;

  const sql = `
    SELECT c.ClassID, c.ClassName, c.Section,
           cta.TeacherID,
           t.FirstName AS TeacherFirstName, t.LastName AS TeacherLastName,
           t.Subject AS TeacherSubject,
           COUNT(s.StudentID) AS StudentCount
    FROM Classes c
    ${studentJoin}
    ${teacherJoin}
    GROUP BY c.ClassID, c.ClassName, c.Section,
             cta.TeacherID, t.FirstName, t.LastName, t.Subject
    ORDER BY
      CASE WHEN c.ClassName REGEXP '^[0-9]+$' THEN 0 ELSE 1 END,
      CASE WHEN c.ClassName REGEXP '^[0-9]+$' THEN CAST(c.ClassName AS UNSIGNED) ELSE 0 END,
      c.ClassName, c.Section
  `;
  const params = branchId != null ? [branchId, branchId] : [];
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Classwise student count (branch-scoped when branchId provided).
export const getClasswiseStudentCount = async (branchId = null) => {
  const studentJoin =
    branchId != null
      ? "LEFT JOIN Students s ON c.ClassID = s.ClassID AND s.branch_id = ?"
      : "LEFT JOIN Students s ON c.ClassID = s.ClassID";
  const sql = `
    SELECT c.ClassName, c.Section, COUNT(s.StudentID) AS StudentCount
    FROM Classes c
    ${studentJoin}
    GROUP BY c.ClassID
  `;
  const params = branchId != null ? [branchId] : [];
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching classwise student count:", error);
    throw error;
  }
};

// Distinct class names (global — no branch filter needed anymore).
export const getDistinctClassNames = async () => {
  const sql = `
    SELECT DISTINCT ClassName
    FROM Classes
    WHERE ClassName IS NOT NULL AND ClassName <> ''
    ORDER BY
      CASE WHEN ClassName REGEXP '^[0-9]+$' THEN 0 ELSE 1 END,
      CASE WHEN ClassName REGEXP '^[0-9]+$' THEN CAST(ClassName AS UNSIGNED) ELSE 0 END,
      ClassName
  `;
  try {
    const [rows] = await db.query(sql);
    return rows.map((r) => r.ClassName);
  } catch (error) {
    console.error("Error fetching distinct class names:", error);
    throw error;
  }
};

const LEGACY_SECTIONS = ["Better", "Good", "General"];
export const getDistinctSections = async () => {
  const sql = `
    SELECT DISTINCT Section
    FROM Classes
    WHERE Section IS NOT NULL AND Section <> ''
    ORDER BY Section
  `;
  try {
    const [rows] = await db.query(sql);
    const sections = rows.map((r) => r.Section);
    return sections.length > 0 ? sections : LEGACY_SECTIONS;
  } catch (error) {
    console.error("Error fetching distinct sections:", error);
    throw error;
  }
};

export const STANDARD_SECTIONS = LEGACY_SECTIONS;

export const getDistinctClassesWithSections = async () => {
  const sql = `
    SELECT DISTINCT ClassName, Section
    FROM Classes
    ORDER BY ClassName, Section
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching distinct classes:", error);
    throw error;
  }
};

// Total students in a class by name (branch-scoped when provided).
export const getTotalStudentsInClassByName = async (className, branchId = null) => {
  const branchClause = branchId != null ? "AND s.branch_id = ?" : "";
  const params = branchId != null ? [className, branchId] : [className];
  const sql = `
    SELECT COUNT(s.StudentID) AS TotalStudents
    FROM Students s
    JOIN Classes c ON s.ClassID = c.ClassID
    WHERE c.ClassName = ? ${branchClause}
  `;
  try {
    const [rows] = await db.query(sql, params);
    return rows[0] ? rows[0].TotalStudents : 0;
  } catch (error) {
    console.error("Error fetching total students in class:", error);
    throw error;
  }
};
