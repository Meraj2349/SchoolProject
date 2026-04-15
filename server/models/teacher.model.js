// server/models/teacher.model.js
import db from "../config/db.config.js";
import { branchFilter } from "../utils/branchFilter.js";

// Add a new teacher
const addTeacher = async ({
  FirstName,
  LastName,
  Subject,
  ContactNumber,
  Email,
  JoiningDate,
  Address,
}, branchId = null) => {
  let sql, values;
  if (branchId != null) {
    sql = `
      INSERT INTO Teachers (FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    values = [FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address, branchId];
  } else {
    sql = `
      INSERT INTO Teachers (FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    values = [FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address];
  }
  const [result] = await db.query(sql, values);
  return { TeacherID: result.insertId };
};

// Get all teachers (branch-scoped)
const getAllTeachers = async (branchId = null) => {
  const { clause, params } = branchFilter(branchId);
  const [rows] = await db.query(
    `SELECT * FROM Teachers WHERE 1=1 ${clause} ORDER BY TeacherID`,
    params,
  );
  return rows;
};

// Update a teacher (branch-scoped)
const updateTeacher = async (teacherID, updateData, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  let sql = "UPDATE Teachers SET ";
  const params = [];

  Object.keys(updateData).forEach((key) => {
    sql += `${key} = ?, `;
    params.push(updateData[key]);
  });

  sql = sql.slice(0, -2); // Remove the last comma
  sql += ` WHERE TeacherID = ? ${clause}`;
  params.push(teacherID, ...branchParams);

  const [result] = await db.query(sql, params);
  return result;
};

// Delete a teacher (branch-scoped)
const deleteTeacher = async (teacherID, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  const sql = `DELETE FROM Teachers WHERE TeacherID = ? ${clause}`;
  const [result] = await db.query(sql, [teacherID, ...branchParams]);
  return result;
};

const checkDuplicateTeacher = async (email, contactNumber, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  const sql = `
    SELECT COUNT(*) as count FROM Teachers
    WHERE (Email = ? OR ContactNumber = ?) ${clause}
  `;
  const [rows] = await db.query(sql, [email, contactNumber, ...branchParams]);
  return { duplicate: rows[0].count > 0 };
};

// Search teachers by name (first or last) for autocomplete (branch-scoped)
const searchTeachers = async (query, className = "", branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "t");
  const like = `%${query}%`;
  if (className) {
    const sql = `
      SELECT DISTINCT t.TeacherID, t.FirstName, t.LastName, t.Subject, t.Email,
             (c.ClassID IS NOT NULL) AS assignedToClass
      FROM Teachers t
      LEFT JOIN Classes c ON c.TeacherID = t.TeacherID AND c.ClassName = ?
      WHERE (t.FirstName LIKE ? OR t.LastName LIKE ? OR CONCAT(t.FirstName, ' ', t.LastName) LIKE ?) ${clause}
      ORDER BY assignedToClass DESC, t.FirstName, t.LastName
      LIMIT 10
    `;
    const [rows] = await db.query(sql, [className, like, like, like, ...branchParams]);
    return rows;
  }
  const sql = `
    SELECT t.TeacherID, t.FirstName, t.LastName, t.Subject, t.Email
    FROM Teachers t
    WHERE (t.FirstName LIKE ? OR t.LastName LIKE ? OR CONCAT(t.FirstName, ' ', t.LastName) LIKE ?) ${clause}
    ORDER BY t.FirstName, t.LastName
    LIMIT 10
  `;
  const [rows] = await db.query(sql, [like, like, like, ...branchParams]);
  return rows;
};

export {
  addTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  checkDuplicateTeacher,
  searchTeachers,
};
