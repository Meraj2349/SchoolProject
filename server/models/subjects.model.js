import db from "../config/db.config.js";

// Helper function to find or create a class (using only className)
const findOrCreateClass = async (className) => {
  try {
    // First, try to find any class with this className
    const [existingClass] = await db.query(
      "SELECT ClassID FROM Classes WHERE ClassName = ? LIMIT 1",
      [className]
    );

    if (existingClass.length > 0) {
      return existingClass[0].ClassID;
    }

    // If not found, create a new class with default section 'A'
    const [result] = await db.query(
      "INSERT INTO Classes (ClassName, Section) VALUES (?, 'A')",
      [className]
    );
    return result.insertId;
  } catch (error) {
    throw new Error("Error finding or creating class: " + error.message);
  }
};

// Add a new subject
export const addSubject = async ({ subjectName, className }) => {
  try {
    // Get or create ClassID
    const classId = await findOrCreateClass(className);
    
    const sql = `
      INSERT INTO Subjects (SubjectName, ClassID)
      VALUES (?, ?)
    `;
    
    console.log("Inserting into database:", { subjectName, className, classId }); // Debugging log
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

// Get all subjects with unique class names
export const getSubjects = async () => {
  const sql = `
    SELECT s.SubjectID, s.SubjectName, s.ClassID, c.ClassName
    FROM Subjects s
    LEFT JOIN Classes c ON s.ClassID = c.ClassID
    GROUP BY s.SubjectID, s.SubjectName, c.ClassName
    ORDER BY c.ClassName, s.SubjectName
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
export const editSubject = async (subjectId, { subjectName, className }) => {
  try {
    // Get or create ClassID
    const classId = await findOrCreateClass(className);
    
    const sql = `
      UPDATE Subjects
      SET SubjectName = ?, ClassID = ?
      WHERE SubjectID = ?
    `;
    
    console.log("Updating subject in database:", { subjectId, subjectName, className, classId }); // Debugging log
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

// Get all classes (unique class names)
export const getAllClasses = async () => {
  try {
    const [rows] = await db.query("SELECT DISTINCT ClassName FROM Classes ORDER BY ClassName");
    return rows;
  } catch (err) {
    throw new Error("Error fetching classes: " + err.message);
  }
};