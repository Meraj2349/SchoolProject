import db from "../config/db.config.js";

const getAllClasses = async () => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, CONCAT(t.FirstName, ' ', t.LastName) AS TeacherName 
      FROM Classes c
      LEFT JOIN Teachers t ON c.TeacherID = t.TeacherID
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching classes: " + err.message);
  }
};

const addClass = async (classData) => {
  const { ClassName, Section, TeacherID } = classData;
  
  const sql = "INSERT INTO Classes (ClassName, Section, TeacherID) VALUES (?, ?, ?)";

  try {
    const [result] = await db.query(sql, [ClassName, Section, TeacherID]);
    return { message: "Class added successfully", classID: result.insertId };
  } catch (err) {
    throw new Error("Error adding class: " + err.message);
  }
};

const deleteClass = async (classID) => {
  const sql = "DELETE FROM Classes WHERE ClassID = ?";

  try {
    const [result] = await db.query(sql, [classID]);

    if (result.affectedRows === 0) {
      throw new Error("Class not found");
    }
    return { message: "Class deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting class: " + error.message);
  }
};

const updateClass = async (classID, classData) => {
  const { ClassName, Section, TeacherID } = classData;

  const sql = `UPDATE Classes SET ClassName = ?, Section = ?, TeacherID = ? WHERE ClassID = ?`;
  
  try {
    const [result] = await db.query(sql, [ClassName, Section, TeacherID, classID]);

    if (result.affectedRows === 0) {
      throw new Error("Class not found");
    }

    return { message: `Class with ID ${classID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating class: " + error.message);
  }
};

const searchClasses = async (filters) => {
  const { ClassName, Section, TeacherID } = filters;

  let query = `
    SELECT c.*, CONCAT(t.FirstName, ' ', t.LastName) AS TeacherName 
    FROM Classes c
    LEFT JOIN Teachers t ON c.TeacherID = t.TeacherID
    WHERE 1=1
  `;
  const params = [];

  if (ClassName) {
    query += " AND c.ClassName LIKE ?";
    params.push(`%${ClassName}%`);
  }
  if (Section) {
    query += " AND c.Section = ?";
    params.push(Section);
  }
  if (TeacherID) {
    query += " AND c.TeacherID = ?";
    params.push(TeacherID);
  }

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw new Error("Error searching classes: " + error.message);
  }
};

const getClassById = async (classID) => {
  const sql = `
    SELECT c.*, CONCAT(t.FirstName, ' ', t.LastName) AS TeacherName 
    FROM Classes c
    LEFT JOIN Teachers t ON c.TeacherID = t.TeacherID
    WHERE c.ClassID = ?
  `;

  try {
    const [results] = await db.query(sql, [classID]);

    if (results.length === 0) {
      throw new Error("Class not found");
    }

    return results[0];
  } catch (error) {
    throw new Error("Error fetching class: " + error.message);
  }
};

const getStudentsByClass = async (classID) => {
  const sql = `
    SELECT * FROM Students 
    WHERE Class = (SELECT ClassName FROM Classes WHERE ClassID = ?) 
    ORDER BY LastName, FirstName
  `;

  try {
    const [results] = await db.query(sql, [classID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching students for class: " + error.message);
  }
};

export {
  getAllClasses,
  addClass,
  deleteClass,
  updateClass,
  searchClasses,
  getClassById,
  getStudentsByClass
};