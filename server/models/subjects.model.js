import db from "../config/db.config.js";

// Add a new subject

export const addSubject = async ({ subjectName, classId }) => {
  const sql = `
    INSERT INTO Subjects (SubjectName, ClassID)
    VALUES (?, ?)
  `;
  try {
    console.log("Inserting into database:", { subjectName, classId }); // Debugging log
    const [result] = await db.query(sql, [subjectName, classId]);
    return { SubjectID: result.insertId };
  } catch (error) {
    console.error("Error adding subject to database:", error); // Log the error
    throw error;
  }
};

// Delete a subject by ID
export const deleteSubject = async (subjectId) => {
  const sql = `
    DELETE FROM Subjects WHERE SubjectID = ?
  `;
  try {
    const [result] = await db.query(sql, [subjectId]);
    if (result.affectedRows === 0) {
      throw new Error("No subject found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
};

// Get all subjects
export const getSubjects = async () => {
  const sql = `
    SELECT s.SubjectID, s.SubjectName, c.ClassName, c.Section
    FROM Subjects s
    LEFT JOIN Classes c ON s.ClassID = c.ClassID
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

// Edit a subject by ID
export const editSubject = async (subjectId, { subjectName, classId }) => {
    const sql = `
      UPDATE Subjects
      SET SubjectName = ?, ClassID = ?
      WHERE SubjectID = ?
    `;
    try {
      console.log("Updating subject in database:", { subjectId, subjectName, classId }); // Debugging log
      const [result] = await db.query(sql, [subjectName, classId, subjectId]);
      if (result.affectedRows === 0) {
        throw new Error("No subject found with that ID");
      }
      return { success: true };
    } catch (error) {
      console.error("Error updating subject in database:", error); // Log the error
      throw error;
    }
  };