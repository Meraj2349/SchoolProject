import db from "../config/db.config.js";
import { branchFilter } from "../utils/branchFilter.js";

// Add a new subject (classId is the integer ClassID from the Classes table)
export const addSubject = async ({ subjectName, classId }, branchId = null) => {
  try {
    let sql, values;
    if (branchId != null) {
      sql = "INSERT INTO Subjects (SubjectName, ClassID, branch_id) VALUES (?, ?, ?)";
      values = [subjectName, classId, branchId];
    } else {
      sql = "INSERT INTO Subjects (SubjectName, ClassID) VALUES (?, ?)";
      values = [subjectName, classId];
    }
    const [result] = await db.query(sql, values);
    return { SubjectID: result.insertId };
  } catch (error) {
    throw new Error("Error adding subject: " + error.message);
  }
};

// Delete a subject by ID (branch-scoped)
export const deleteSubject = async (subjectId, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  try {
    const [result] = await db.query(
      `DELETE FROM Subjects WHERE SubjectID = ? ${clause}`,
      [subjectId, ...branchParams],
    );
    if (result.affectedRows === 0) {
      throw new Error("No subject found with that ID");
    }
    return { success: true };
  } catch (error) {
    throw new Error("Error deleting subject: " + error.message);
  }
};

// Get all subjects with class name and section (branch-scoped via Classes join)
export const getSubjects = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "c");
  try {
    const [rows] = await db.query(`
      SELECT
        s.SubjectID,
        s.SubjectName,
        s.ClassID,
        c.ClassName,
        c.Section
      FROM Subjects s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE 1=1 ${clause}
      ORDER BY c.ClassName, c.Section, s.SubjectName
    `, branchParams);
    return rows;
  } catch (error) {
    throw new Error("Error fetching subjects: " + error.message);
  }
};

// Edit a subject by ID (branch-scoped)
export const editSubject = async (subjectId, { subjectName, classId }, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  try {
    const [result] = await db.query(
      `UPDATE Subjects SET SubjectName = ?, ClassID = ? WHERE SubjectID = ? ${clause}`,
      [subjectName, classId, subjectId, ...branchParams],
    );
    if (result.affectedRows === 0) {
      throw new Error("No subject found with that ID");
    }
    return { success: true };
  } catch (error) {
    throw new Error("Error updating subject: " + error.message);
  }
};
