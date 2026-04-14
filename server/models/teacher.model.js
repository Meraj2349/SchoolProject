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

// Search teachers by name (first or last) for autocomplete
const searchTeachers = async (query, className = "") => {
  const like = `%${query}%`;
  if (className) {
    // Return teachers already assigned to any section of the given class first,
    // then fall back to all name-matching teachers so the list is never empty.
    const sql = `
      SELECT DISTINCT t.TeacherID, t.FirstName, t.LastName, t.Subject, t.Email,
             (c.ClassID IS NOT NULL) AS assignedToClass
      FROM Teachers t
      LEFT JOIN Classes c ON c.TeacherID = t.TeacherID AND c.ClassName = ?
      WHERE t.FirstName LIKE ? OR t.LastName LIKE ? OR CONCAT(t.FirstName, ' ', t.LastName) LIKE ?
      ORDER BY assignedToClass DESC, t.FirstName, t.LastName
      LIMIT 10
    `;
    const [rows] = await db.query(sql, [className, like, like, like]);
    return rows;
  }
  const sql = `
    SELECT TeacherID, FirstName, LastName, Subject, Email
    FROM Teachers
    WHERE FirstName LIKE ? OR LastName LIKE ? OR CONCAT(FirstName, ' ', LastName) LIKE ?
    ORDER BY FirstName, LastName
    LIMIT 10
  `;
  const [rows] = await db.query(sql, [like, like, like]);
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
