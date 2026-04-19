import db from "../config/db.config.js";

// ClassTeacherAssignments — per-branch teacher-to-class mapping.
// Branch admin can CRUD within their own branch. Super admin can CRUD any
// branch (must supply branch_id in the request).

export const getAssignment = async (classId, branchId) => {
  const [rows] = await db.query(
    `SELECT cta.id, cta.ClassID, cta.branch_id, cta.TeacherID,
            t.FirstName, t.LastName, t.Subject
     FROM ClassTeacherAssignments cta
     LEFT JOIN Teachers t ON t.TeacherID = cta.TeacherID
     WHERE cta.ClassID = ? AND cta.branch_id = ?`,
    [classId, branchId],
  );
  return rows[0] || null;
};

// Upsert — one teacher per (classId, branchId). Replaces any existing row.
export const assignTeacher = async (classId, branchId, teacherId) => {
  const [result] = await db.query(
    `INSERT INTO ClassTeacherAssignments (ClassID, branch_id, TeacherID)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE TeacherID = VALUES(TeacherID)`,
    [classId, branchId, teacherId],
  );
  return { success: true, id: result.insertId };
};

export const unassignTeacher = async (classId, branchId) => {
  const [result] = await db.query(
    `DELETE FROM ClassTeacherAssignments WHERE ClassID = ? AND branch_id = ?`,
    [classId, branchId],
  );
  return { success: result.affectedRows > 0 };
};
