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

export { addTeacher, getAllTeachers, updateTeacher, deleteTeacher };