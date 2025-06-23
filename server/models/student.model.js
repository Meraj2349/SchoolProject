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
    Class,
    Section,
    AdmissionDate,
    Address,
    ParentContact,
    RollNumber,
  } = studentData;

  // Check if roll number already exists in the same class and section
  const rollNumberExists = await checkRollNumberExists(RollNumber, Class, Section);
  if (rollNumberExists) {
    throw new Error(`Roll number ${RollNumber} already exists in Class ${Class}, Section ${Section}`);
  }
  
  const sql =
    "INSERT INTO Students (FirstName, LastName, DateOfBirth, Gender, Class, Section, AdmissionDate, Address, ParentContact, RollNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    const [result] = await db.query(sql, [
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
    Class,
    Section,
    AdmissionDate,
    Address,
    ParentContact,
    RollNumber,
  } = studentData;

  // Check if roll number already exists in the same class and section (excluding current student)
  if (RollNumber) {
    const rollNumberExists = await checkRollNumberExists(RollNumber, Class, Section, studentID);
    if (rollNumberExists) {
      throw new Error(`Roll number ${RollNumber} already exists in Class ${Class}, Section ${Section}`);
    }
  }

  const sql = `UPDATE Students SET 
    FirstName = ?, 
    LastName = ?, 
    DateOfBirth = ?, 
    Gender = ?, 
    Class = ?, 
    Section = ?, 
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
      Class,
      Section,
      AdmissionDate,
      Address,
      ParentContact,
      RollNumber,
      studentID,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Student not found");
    }

    return { message: `Student with ID ${studentID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating student: " + error.message);
  }
};

const searchStudents = async (filters) => {
  const { FirstName, Class, Section, RollNumber } = filters; // Fixed: changed roll_number to RollNumber

  let query = "SELECT * FROM Students WHERE 1=1";
  const params = [];

  if (FirstName) {
    query += " AND FirstName LIKE ?";
    params.push(`%${FirstName}%`);
  }
  if (Class) {
    query += " AND Class = ?";
    params.push(Class);
  }
  if (Section) {
    query += " AND Section = ?";
    params.push(Section);
  }
  if (RollNumber) {
    query += " AND RollNumber = ?"; // Fixed: changed roll_number to RollNumber
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
const getStudentsByClass = async (className) => {
  const sql = "SELECT * FROM Students WHERE Class = ? ORDER BY RollNumber";

  try {
    const [rows] = await db.query(sql, [className]);
    return rows;
  } catch (error) {
    throw new Error("Error fetching students by class: " + error.message);
  }
};

const getStudentsByClassAndSection = async (className, section) => {
  const sql = "SELECT * FROM Students WHERE Class = ? AND Section = ? ORDER BY RollNumber";

  try {
    const [rows] = await db.query(sql, [className, section]);
    return rows;
  } catch (error) {
    throw new Error("Error fetching students by class and section: " + error.message);
  }
};

const checkRollNumberExists = async (rollNumber, classValue, section, excludeStudentID = null) => {
  let sql = "SELECT StudentID FROM Students WHERE RollNumber = ? AND Class = ? AND Section = ?";
  const params = [rollNumber, classValue, section];

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

export {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  searchStudents,
  getStudentCount,
  getStudentById,
  getStudentsByClass,
  getStudentsByClassAndSection,
  checkRollNumberExists,
  // updateStudentProfileImage, // Commented out since no image routes
};