import db from "../config/db.config.js";

const getAllStudents = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM Students");
    return rows;
  } catch (err) {
    throw new Error("Error fetching students: " + err.message);
  }
};

const addStudent = async (studentData) => {
  const {
    FirstName,
    LastName,
    DateOfBirth,
    Gender,
    ClassID,
    AdmissionDate,
    Address,
    ParentContact,
    RollNumber,
  } = studentData;

  // Check if roll number already exists in the same class
  const rollNumberExists = await checkRollNumberExists(RollNumber, ClassID);
  if (rollNumberExists) {
    throw new Error(`Roll number ${RollNumber} already exists in ClassID ${ClassID}`);
  }
  
  const sql =
    "INSERT INTO Students (FirstName, LastName, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, RollNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    const [result] = await db.query(sql, [
      FirstName,
      LastName,
      DateOfBirth,
      Gender,
      ClassID,
      AdmissionDate,
      Address,
      ParentContact,
      RollNumber,
    ]);
    return {
      message: "Student added successfully",
      studentID: result.insertId,
      roll_number: RollNumber,
    };
  } catch (err) {
    throw new Error("Error adding student: " + err.message);
  }
};

const deleteStudent = async (studentID) => {
  const sql = "DELETE FROM Students WHERE StudentID = ?";

  try {
    const [result] = await db.query(sql, [studentID]);

    if (result.affectedRows === 0) {
      throw new Error("Student not found");
    }
    return { message: "Student deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting student: " + error.message);
  }
};

const updateStudent = async (studentID, studentData) => {
  const {
    FirstName,
    LastName,
    DateOfBirth,
    Gender,
    ClassID,
    AdmissionDate,
    Address,
    ParentContact,
    RollNumber,
  } = studentData;
  if (RollNumber) {
    const rollNumberExists = await checkRollNumberExists(RollNumber, ClassID, null, studentID);
    if (rollNumberExists) {
      throw new Error(`Roll number ${RollNumber} already exists in ClassID ${ClassID}`);
    }
  }

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
    WHERE StudentID = ?`;

  try {
    const [result] = await db.query(sql, [
      FirstName,
      LastName,
      DateOfBirth,
      Gender,
      ClassID,
      AdmissionDate,
      Address,
      ParentContact,
      RollNumber,
      studentID,
    ]);

    return { message: `Student with ID ${studentID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating student: " + error.message);
  }
};

const searchStudents = async (filters) => {
  const { FirstName, ClassID, RollNumber } = filters;

  let query = "SELECT * FROM Students WHERE 1=1";
  const params = [];

  if (FirstName) {
    query += " AND FirstName LIKE ?";
    params.push(`%${FirstName}%`);
  }
  if (ClassID) {
    query += " AND ClassID = ?";
    params.push(ClassID);
  }
  if (RollNumber) {
    query += " AND RollNumber = ?";
    params.push(RollNumber);
  }

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw new Error("Error searching students: " + error.message);
  }
};

const getStudentCount = async () => {
  const sql = "SELECT COUNT(*) AS totalStudents FROM Students";
  try {
    const [result] = await db.query(sql);
    return { totalStudents: result[0].totalStudents };
  } catch (error) {
    throw new Error("Error fetching student count: " + error.message);
  }
};

const getStudentById = async (studentID) => {
  // Removed image join since you don't have image routes
  const sql = "SELECT * FROM Students WHERE StudentID = ?";

  try {
    const [results] = await db.query(sql, [studentID]);

    if (results.length === 0) {
      throw new Error("Student not found");
    }

    return results[0];
  } catch (error) {
    throw new Error("Error fetching student: " + error.message);
  }
};

// Added new utility functions for better functionality
const getStudentsByClass = async (classID) => {
  const sql = "SELECT * FROM Students WHERE ClassID = ? ORDER BY RollNumber";

  try {
    const [rows] = await db.query(sql, [classID]);
    return rows;
  } catch (error) {
    throw new Error("Error fetching students by class: " + error.message);
  }
};
const checkRollNumberExists = async (rollNumber, classID, _unused = null, excludeStudentID = null) => {
  let sql = "SELECT StudentID FROM Students WHERE RollNumber = ? AND ClassID = ?";
  const params = [rollNumber, classID];

  if (excludeStudentID) {
    sql += " AND StudentID != ?";
    params.push(excludeStudentID);
  }

  try {
    const [rows] = await db.query(sql, params);
    return rows.length > 0;
  } catch (error) {
    throw new Error("Error checking roll number: " + error.message);
  }
};
const getStudentsByClassAndSection = async (className, section) => {
  const sql = `
    SELECT s.*, c.ClassName, c.Section
    FROM Students s
    JOIN Classes c ON s.ClassID = c.ClassID
    WHERE c.ClassName = ? AND c.Section = ?
    ORDER BY s.RollNumber
  `;
  try {
    const [rows] = await db.query(sql, [className, section]);
    return rows;
  } catch (error) {
    throw new Error("Error fetching students by class and section: " + error.message);
  }
};
export {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  searchStudents,
  getStudentCount,
  getStudentById,
  getStudentsByClass,
  checkRollNumberExists,
  getStudentsByClassAndSection, // Added this function to handle class and section queries
  // updateStudentProfileImage, // Commented out since no image routes
};