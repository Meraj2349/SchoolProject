// server/models/teacher.model.js
import db from "../config/db.config.js";

// Add a new teacher
const addTeacher = async ({
  FirstName,
  LastName,
  Subject,
  ContactNumber,
  Email,
  JoiningDate,
  Address,
}) => {
  const sql = `
    INSERT INTO Teachers (FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [
    FirstName,
    LastName,
    Subject,
    ContactNumber,
    Email,
    JoiningDate,
    Address,
  ]);
  return { TeacherID: result.insertId };
};

// Get all teachers
const getAllTeachers = async () => {
  const [rows] = await db.query("SELECT * FROM Teachers");
  return rows;
};

// Update a teacher
const updateTeacher = async (teacherID, updateData) => {
  let sql = "UPDATE Teachers SET ";
  const params = [];

  Object.keys(updateData).forEach((key) => {
    sql += `${key} = ?, `;
    params.push(updateData[key]);
  });

  sql = sql.slice(0, -2); // Remove the last comma
  sql += " WHERE TeacherID = ?";
  params.push(teacherID);

  const [result] = await db.query(sql, params);
  return result;
};

// Delete a teacher
const deleteTeacher = async (teacherID) => {
  const sql = "DELETE FROM Teachers WHERE TeacherID = ?";
  const [result] = await db.query(sql, [teacherID]);
  return result;
};

const checkDuplicateTeacher = async (email, contactNumber) => {
  const sql = `
    SELECT COUNT(*) as count FROM Teachers
    WHERE Email = ? OR ContactNumber = ?
  `;
  const [rows] = await db.query(sql, [email, contactNumber]);
  return { duplicate: rows[0].count > 0 }; // If count > 0, duplicate exists
};

export {
  addTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  checkDuplicateTeacher,
};
