// server/models/teacher.model.js
import db from "../src/shared/db/index.js";
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
    values = [FirstName, LastName, Subject, ContactNumber, Email, emptyToNull(JoiningDate), Address, branchId];
  } else {
    sql = `
      INSERT INTO Teachers (FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    values = [FirstName, LastName, Subject, ContactNumber, Email, emptyToNull(JoiningDate), Address];
  }
  const TeacherID = await db.insert(sql, values, "TeacherID");
  return { TeacherID };
};

// Columns anyone may read: never the attendance app's sign-in details.
const PUBLIC_COLUMNS = "TeacherID, FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address, branch_id";

// Get all teachers (branch-scoped)
const getAllTeachers = async (branchId = null) => {
  const { clause, params } = branchFilter(branchId);
  const { rows } = await db.query(
    `SELECT ${PUBLIC_COLUMNS} FROM Teachers WHERE 1=1 ${clause} ORDER BY TeacherID`,
    params,
  );
  return rows;
};

// Columns a client may change. Anything else in the request body (branch_id,
// TeacherID, or a crafted key) is ignored — keys are never put into SQL.
const EDITABLE_COLUMNS = [
  "FirstName",
  "LastName",
  "Subject",
  "ContactNumber",
  "Email",
  "JoiningDate",
  "Address",
];

// Empty form fields become NULL (MySQL rejects '' for a DATE column).
const emptyToNull = (value) => (value === "" ? null : value);

// Update a teacher (branch-scoped)
const updateTeacher = async (teacherID, updateData, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  const columns = EDITABLE_COLUMNS.filter((column) => updateData[column] !== undefined);
  if (columns.length === 0) return { affectedRows: 0, noFields: true };

  const sql = `UPDATE Teachers SET ${columns.map((c) => `${c} = ?`).join(", ")}
    WHERE TeacherID = ? ${clause}`;
  const params = [...columns.map((c) => emptyToNull(updateData[c])), teacherID, ...branchParams];

  const { rowCount } = await db.query(sql, params);
  return { affectedRows: rowCount };
};

// Delete a teacher (branch-scoped)
const deleteTeacher = async (teacherID, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  const sql = `DELETE FROM Teachers WHERE TeacherID = ? ${clause}`;
  const { rowCount } = await db.query(sql, [teacherID, ...branchParams]);
  return { affectedRows: rowCount };
};

const checkDuplicateTeacher = async (email, contactNumber, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId);
  const sql = `
    SELECT COUNT(*) as count FROM Teachers
    WHERE (Email = ? OR ContactNumber = ?) ${clause}
  `;
  const { rows } = await db.query(sql, [email, contactNumber, ...branchParams]);
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
    const { rows } = await db.query(sql, [className, like, like, like, ...branchParams]);
    return rows;
  }
  const sql = `
    SELECT t.TeacherID, t.FirstName, t.LastName, t.Subject, t.Email
    FROM Teachers t
    WHERE (t.FirstName LIKE ? OR t.LastName LIKE ? OR CONCAT(t.FirstName, ' ', t.LastName) LIKE ?) ${clause}
    ORDER BY t.FirstName, t.LastName
    LIMIT 10
  `;
  const { rows } = await db.query(sql, [like, like, like, ...branchParams]);
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
