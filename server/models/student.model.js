// server/models/student.model.js
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
  } = studentData;
  const sql =
    "INSERT INTO Students (FirstName, LastName, DateOfBirth, Gender, Class, Section, AdmissionDate, Address, ParentContact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

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
    ]);
    return { message: "Student added successfully", studentID: result.insertId };
  } catch (err) {
    throw new Error("Error adding student: " + err.message);
  }
};

const deleteStudent = async (studentID) => {
  const sql = "DELETE FROM Students WHERE StudentID= ?";

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
  } = studentData;

  const sql = `UPDATE Students SET FirstName = ?, LastName = ?, DateOfBirth = ?, Gender = ?, Class = ?, Section = ?, AdmissionDate = ?, Address = ?, ParentContact = ? WHERE StudentID = ?`;
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
  const { FirstName, Class, Section } = filters;

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

export {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  searchStudents,
  getStudentCount,
  getStudentById,
};


