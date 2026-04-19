import db from "../config/db.config.js";

// Subjects are GLOBAL (shared across branches), tied to a ClassID.

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

export const deleteSubject = async (subjectId) => {
  try {
    const [result] = await db.query(
      `DELETE FROM Subjects WHERE SubjectID = ?`,
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

export const getSubjectsByClassId = async (classId) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        s.SubjectID,
        s.SubjectName,
        s.ClassID,
        c.ClassName,
        c.Section
      FROM Subjects s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE s.ClassID = ?
      ORDER BY s.SubjectName
    `,
      [classId],
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching subjects by class: " + error.message);
  }
};

export const getSubjectsByClassName = async (className) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        s.SubjectID,
        s.SubjectName,
        s.ClassID,
        c.ClassName,
        c.Section
      FROM Subjects s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE c.ClassName = ?
      ORDER BY c.Section, s.SubjectName
    `,
      [className],
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching subjects by class name: " + error.message);
  }
};

export const editSubject = async (subjectId, { subjectName, classId }) => {
  try {
    const [result] = await db.query(
      `UPDATE Subjects SET SubjectName = ?, ClassID = ? WHERE SubjectID = ?`,
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
