import db from "../config/db.config.js";

// Add a new subject (classId is the integer ClassID from the Classes table)
export const addSubject = async ({ subjectName, classId }) => {
  try {
    const [result] = await db.query(
      "INSERT INTO Subjects (SubjectName, ClassID) VALUES (?, ?)",
      [subjectName, classId],
    );
    return { SubjectID: result.insertId };
  } catch (error) {
    throw new Error("Error adding subject: " + error.message);
  }
};

// Delete a subject by ID
export const deleteSubject = async (subjectId) => {
  try {
    const [result] = await db.query(
      "DELETE FROM Subjects WHERE SubjectID = ?",
      [subjectId],
    );
    if (result.affectedRows === 0) {
      throw new Error("No subject found with that ID");
    }
    return { success: true };
  } catch (error) {
    throw new Error("Error deleting subject: " + error.message);
  }
};

// Get all subjects with class name and section
export const getSubjects = async () => {
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
      ORDER BY c.ClassName, c.Section, s.SubjectName
    `);
    return rows;
  } catch (error) {
    throw new Error("Error fetching subjects: " + error.message);
  }
};

// Edit a subject by ID
export const editSubject = async (subjectId, { subjectName, classId }) => {
  try {
    const [result] = await db.query(
      "UPDATE Subjects SET SubjectName = ?, ClassID = ? WHERE SubjectID = ?",
      [subjectName, classId, subjectId],
    );
    if (result.affectedRows === 0) {
      throw new Error("No subject found with that ID");
    }
    return { success: true };
  } catch (error) {
    throw new Error("Error updating subject: " + error.message);
  }
};
