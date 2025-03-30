import db from "../config/db.config.js";

const getAllSubjects = async () => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, c.ClassName, c.Section 
      FROM Subjects s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching subjects: " + err.message);
  }
};

const addSubject = async (subjectData) => {
  const { SubjectName, ClassID } = subjectData;
  
  const sql = "INSERT INTO Subjects (SubjectName, ClassID) VALUES (?, ?)";

  try {
    const [result] = await db.query(sql, [SubjectName, ClassID]);
    return { message: "Subject added successfully", subjectID: result.insertId };
  } catch (err) {
    throw new Error("Error adding subject: " + err.message);
  }
};

const deleteSubject = async (subjectID) => {
  const sql = "DELETE FROM Subjects WHERE SubjectID = ?";

  try {
    const [result] = await db.query(sql, [subjectID]);

    if (result.affectedRows === 0) {
      throw new Error("Subject not found");
    }
    return { message: "Subject deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting subject: " + error.message);
  }
};

const updateSubject = async (subjectID, subjectData) => {
  const { SubjectName, ClassID } = subjectData;

  const sql = `UPDATE Subjects SET SubjectName = ?, ClassID = ? WHERE SubjectID = ?`;
  
  try {
    const [result] = await db.query(sql, [SubjectName, ClassID, subjectID]);

    if (result.affectedRows === 0) {
      throw new Error("Subject not found");
    }

    return { message: `Subject with ID ${subjectID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating subject: " + error.message);
  }
};

const searchSubjects = async (filters) => {
  const { SubjectName, ClassID } = filters;

  let query = `
    SELECT s.*, c.ClassName, c.Section 
    FROM Subjects s
    LEFT JOIN Classes c ON s.ClassID = c.ClassID
    WHERE 1=1
  `;
  const params = [];

  if (SubjectName) {
    query += " AND s.SubjectName LIKE ?";
    params.push(`%${SubjectName}%`);
  }
  if (ClassID) {
    query += " AND s.ClassID = ?";
    params.push(ClassID);
  }

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw new Error("Error searching subjects: " + error.message);
  }
};

const getSubjectById = async (subjectID) => {
  const sql = `
    SELECT s.*, c.ClassName, c.Section 
    FROM Subjects s
    LEFT JOIN Classes c ON s.ClassID = c.ClassID
    WHERE s.SubjectID = ?
  `;

  try {
    const [results] = await db.query(sql, [subjectID]);

    if (results.length === 0) {
      throw new Error("Subject not found");
    }

    return results[0];
  } catch (error) {
    throw new Error("Error fetching subject: " + error.message);
  }
};

const getSubjectsByClass = async (classID) => {
  const sql = "SELECT * FROM Subjects WHERE ClassID = ?";

  try {
    const [results] = await db.query(sql, [classID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching subjects for class: " + error.message);
  }
};

export {
  getAllSubjects,
  addSubject,
  deleteSubject,
  updateSubject,
  searchSubjects,
  getSubjectById,
  getSubjectsByClass
};