import db from "../config/db.config.js";
import { branchFilter } from "../utils/branchFilter.js";

// Get all students (scoped to branch when branchId provided)
const getAllStudents = async (branchId = null) => {
  try {
    const { clause, params } = branchFilter(branchId, "s");
    const [rows] = await db.query(
      `SELECT
        s.StudentID,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        s.DateOfBirth,
        s.Gender,
        s.ClassID,
        s.AdmissionDate,
        s.Address,
        s.ParentContact,
        s.branch_id,
        c.ClassName,
        c.Section
      FROM Students s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE 1=1 ${clause}
      ORDER BY s.StudentID DESC`,
      params,
    );
    return rows;
  } catch (err) {
    throw new Error("Error fetching students: " + err.message);
  }
};

// Classes are global — no branch_id. Look up by (ClassName, Section).
// Throws if not found; super_admin must create the class first.
const findClass = async (className, section) => {
  try {
    const [rows] = await db.query(
      `SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ?`,
      [className, section],
    );
    if (rows.length === 0) {
      throw new Error(
        `Class "${className} - ${section}" does not exist. Ask super admin to create it first.`,
      );
    }
    return rows[0].ClassID;
  } catch (err) {
    throw new Error("Error finding class: " + err.message);
  }
};

const addStudent = async (studentData, branchId = null) => {
  const {
    FirstName,
    LastName,
    RollNumber,
    DateOfBirth,
    Gender,
    Class,
    Section,
    AdmissionDate,
    Address,
    ParentContact,
  } = studentData;

  try {
    const classId = await findClass(Class, Section);

    let sql, values;
    if (branchId != null) {
      sql =
        "INSERT INTO Students (FirstName, LastName, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, RollNumber, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      values = [FirstName, LastName, DateOfBirth, Gender, classId, AdmissionDate, Address, ParentContact, RollNumber, branchId];
    } else {
      sql =
        "INSERT INTO Students (FirstName, LastName, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, RollNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      values = [FirstName, LastName, DateOfBirth, Gender, classId, AdmissionDate, Address, ParentContact, RollNumber];
    }

    const [result] = await db.query(sql, values);

    return {
      message: "Student added successfully",
      studentID: result.insertId,
      roll_number: RollNumber,
    };
  } catch (err) {
    throw new Error("Error adding student: " + err.message);
  }
};

const deleteStudent = async (studentID, branchId = null) => {
  try {
    const { clause, params } = branchFilter(branchId);

    // Remove child records first (FK constraints, no CASCADE)
    await db.query("DELETE FROM Attendance WHERE StudentID = ?", [studentID]);
    await db.query("DELETE FROM Results WHERE StudentID = ?", [studentID]);

    const [result] = await db.query(
      `DELETE FROM Students WHERE StudentID = ? ${clause}`,
      [studentID, ...params],
    );

    if (result.affectedRows === 0) {
      throw new Error("Student not found");
    }
    return { message: "Student deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting student: " + error.message);
  }
};

const updateStudent = async (studentID, studentData, branchId = null) => {
  const {
    FirstName,
    LastName,
    DateOfBirth,
    Gender,
    Class,
    Section,
    AdmissionDate,
    Address,
    ParentContact,
    RollNumber,
  } = studentData;

  try {
    const classId = await findClass(Class, Section);
    const { clause, params } = branchFilter(branchId);

    const sql = `UPDATE Students SET
      FirstName = ?,
      LastName = ?,
      DateOfBirth = ?,
      Gender = ?,
      ClassID = ?,
      AdmissionDate = ?,
      Address = ?,
      ParentContact = ?,
      RollNumber = ?
      WHERE StudentID = ? ${clause}`;

    await db.query(sql, [
      FirstName,
      LastName,
      DateOfBirth,
      Gender,
      classId,
      AdmissionDate,
      Address,
      ParentContact,
      RollNumber,
      studentID,
      ...params,
    ]);

    return { message: `Student with ID ${studentID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating student: " + error.message);
  }
};

const getStudentCount = async (branchId = null) => {
  const { clause, params } = branchFilter(branchId);
  try {
    const [result] = await db.query(
      `SELECT COUNT(*) AS totalStudents FROM Students WHERE 1=1 ${clause}`,
      params,
    );
    return { totalStudents: result[0].totalStudents };
  } catch (error) {
    throw new Error("Error fetching student count: " + error.message);
  }
};

const getStudentById = async (studentID, branchId = null) => {
  const { clause, params } = branchFilter(branchId, "s");
  try {
    const [results] = await db.query(
      `SELECT
        s.StudentID,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        s.DateOfBirth,
        s.Gender,
        s.ClassID,
        s.AdmissionDate,
        s.Address,
        s.ParentContact,
        s.branch_id,
        c.ClassName,
        c.Section
      FROM Students s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE s.StudentID = ? ${clause}`,
      [studentID, ...params],
    );

    if (results.length === 0) {
      throw new Error("Student not found");
    }

    return results[0];
  } catch (error) {
    throw new Error("Error fetching student: " + error.message);
  }
};

const getStudentsByClass = async (classID, branchId = null) => {
  const { clause, params } = branchFilter(branchId, "s");
  try {
    const [rows] = await db.query(
      `SELECT
        s.StudentID,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        s.DateOfBirth,
        s.Gender,
        s.ClassID,
        s.AdmissionDate,
        s.Address,
        s.ParentContact,
        s.branch_id,
        c.ClassName,
        c.Section
      FROM Students s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE s.ClassID = ? ${clause}
      ORDER BY s.RollNumber`,
      [classID, ...params],
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching students by class: " + error.message);
  }
};

// Roll-number uniqueness is scoped per (ClassID, branch_id) — same roll can
// exist for the same class in different branches.
const checkRollNumberExists = async (
  rollNumber,
  className,
  section,
  excludeStudentID = null,
  branchId = null,
) => {
  try {
    const [classResult] = await db.query(
      `SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ?`,
      [className, section],
    );

    if (classResult.length === 0) return false;

    const classID = classResult[0].ClassID;

    let sql = "SELECT StudentID FROM Students WHERE RollNumber = ? AND ClassID = ?";
    const paramArr = [rollNumber, classID];

    if (branchId != null) {
      sql += " AND branch_id = ?";
      paramArr.push(branchId);
    }
    if (excludeStudentID) {
      sql += " AND StudentID != ?";
      paramArr.push(excludeStudentID);
    }

    const [rows] = await db.query(sql, paramArr);
    return rows.length > 0;
  } catch (error) {
    throw new Error("Error checking roll number: " + error.message);
  }
};

const getStudentsByClassAndSection = async (className, section, branchId = null) => {
  const { clause, params } = branchFilter(branchId, "s");
  try {
    const [rows] = await db.query(
      `SELECT s.*, s.branch_id, c.ClassName, c.Section
      FROM Students s
      JOIN Classes c ON s.ClassID = c.ClassID
      WHERE c.ClassName = ? AND c.Section = ? ${clause}
      ORDER BY s.RollNumber`,
      [className, section, ...params],
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching students by class and section: " + error.message);
  }
};

const searchStudents = async (filters, branchId = null) => {
  const { FirstName, LastName, RollNumber, Class, Section } = filters;
  const { clause, params } = branchFilter(branchId, "s");

  let query = `
    SELECT
      s.StudentID,
      s.FirstName,
      s.LastName,
      s.RollNumber,
      s.DateOfBirth,
      s.Gender,
      s.ClassID,
      s.AdmissionDate,
      s.Address,
      s.ParentContact,
      s.branch_id,
      c.ClassName,
      c.Section
    FROM Students s
    LEFT JOIN Classes c ON s.ClassID = c.ClassID
    WHERE 1=1 ${clause}
  `;
  const queryParams = [...params];

  if (FirstName) {
    query += " AND s.FirstName LIKE ?";
    queryParams.push(`%${FirstName}%`);
  }
  if (LastName) {
    query += " AND s.LastName LIKE ?";
    queryParams.push(`%${LastName}%`);
  }
  if (RollNumber) {
    query += " AND s.RollNumber = ?";
    queryParams.push(RollNumber);
  }
  if (Class) {
    query += " AND c.ClassName = ?";
    queryParams.push(Class);
  }
  if (Section) {
    query += " AND c.Section = ?";
    queryParams.push(Section);
  }

  query += " ORDER BY s.StudentID DESC";

  try {
    const [rows] = await db.query(query, queryParams);
    return rows;
  } catch (error) {
    throw new Error("Error searching students: " + error.message);
  }
};

// Classes list (global — no branch filter needed). Returns all rows.
const getAllClasses = async () => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM Classes ORDER BY ClassName, Section`,
    );
    return rows;
  } catch (err) {
    throw new Error("Error fetching classes: " + err.message);
  }
};

export {
  addStudent,
  checkRollNumberExists,
  deleteStudent,
  findClass,
  getAllClasses,
  getAllStudents,
  getStudentById,
  getStudentCount,
  getStudentsByClass,
  getStudentsByClassAndSection,
  searchStudents,
  updateStudent,
};
