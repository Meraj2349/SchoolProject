import db from "../config/db.config.js";

// Add a new class
export const addClass = async ({ className, section, teacherId }) => {
  const sql = `
    INSERT INTO Classes (ClassName, Section, TeacherID)
    VALUES (?, ?, ?)
  `;
  try {
    const [result] = await db.query(sql, [className, section, teacherId]);
    return { ClassID: result.insertId };
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

// Delete a class by ID
export const deleteClass = async (classId) => {
  const sql = `
    DELETE FROM Classes WHERE ClassID = ?
  `;
  try {
    const [result] = await db.query(sql, [classId]);
    if (result.affectedRows === 0) {
      throw new Error("No class found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

// Get all classes
export const getClasses = async () => {
  const sql = `
    SELECT c.ClassID, c.ClassName, c.Section, t.FirstName AS TeacherFirstName, t.LastName AS TeacherLastName
    FROM Classes c
    LEFT JOIN Teachers t ON c.TeacherID = t.TeacherID
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Edit a class by ID
export const editClass = async (classId, { className, section, teacherId }) => {
  const sql = `
    UPDATE Classes
    SET ClassName = ?, Section = ?, TeacherID = ?
    WHERE ClassID = ?
  `;
  try {
    const [result] = await db.query(sql, [className, section, teacherId, classId]);
    if (result.affectedRows === 0) {
      throw new Error("No class found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error editing class:", error);
    throw error;
  }
};