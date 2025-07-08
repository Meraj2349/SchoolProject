import db from "../config/db.config.js";
// // CREATE TABLE Students (
//     StudentID INT PRIMARY KEY AUTO_INCREMENT, 
//     FirstName VARCHAR(50) NOT NULL,           
//     LastName VARCHAR(50) NOT NULL,            
//     RollNumber VARCHAR(20) NOT NULL,          
//     DateOfBirth DATE NOT NULL,               
//     Gender ENUM('Male', 'Female') NOT NULL,
//     ClassID INT NOT NULL,                     
//     AdmissionDate DATE NOT NULL,              
//     Address TEXT,                           
//     ParentContact VARCHAR(15),                
//     FOREIGN KEY (ClassID) REFERENCES Classes(ClassID) 
// );
// CREATE TABLE
//     Classes (
//         ClassID INT PRIMARY KEY AUTO_INCREMENT,
//         ClassName VARCHAR(20),
//         Section VARCHAR(10),
//         TeacherID INT,
//         UNIQUE(className, Section),
//         FOREIGN KEY (TeacherID) REFERENCES Teachers (TeacherID)
//     );
//upgraded my sql query besed on the new table structure
const getAllStudents = async () => {
  try {
    const [rows] = await db.query(`
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
        c.ClassName,
        c.Section
      FROM Students s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      ORDER BY s.StudentID DESC
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching students: " + err.message);
  }
};

// Helper function to find or create a class
const findOrCreateClass = async (className, section) => {
  try {
    // First, try to find existing class
    const [existingClass] = await db.query(
      "SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ?",
      [className, section]
    );
    
    if (existingClass.length > 0) {
      return existingClass[0].ClassID;
    }
    
    // If not found, create new class
    const [result] = await db.query(
      "INSERT INTO Classes (ClassName, Section) VALUES (?, ?)",
      [className, section]
    );
    
    return result.insertId;
  } catch (err) {
    throw new Error("Error finding or creating class: " + err.message);
  }
};

const addStudent = async (studentData) => {
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
    ParentContact
  } = studentData;

  try {
    // Get or create ClassID
    const classId = await findOrCreateClass(Class, Section);
    
    const sql =
      "INSERT INTO Students (FirstName, LastName, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, RollNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    const [result] = await db.query(sql, [
      FirstName,
      LastName,
      DateOfBirth,
      Gender,
      classId,
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
  
  try {
    // Get or create ClassID
    const classId = await findOrCreateClass(Class, Section);
    
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

    const [result] = await db.query(sql, [
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
    ]);

    return { message: `Student with ID ${studentID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating student: " + error.message);
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
  const sql = `
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
      c.ClassName,
      c.Section
    FROM Students s
    LEFT JOIN Classes c ON s.ClassID = c.ClassID
    WHERE s.StudentID = ?
  `;

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

const getStudentsByClass = async (classID) => {
  const sql = `
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
      c.ClassName,
      c.Section
    FROM Students s
    LEFT JOIN Classes c ON s.ClassID = c.ClassID
    WHERE s.ClassID = ? 
    ORDER BY s.RollNumber
  `;

  try {
    const [rows] = await db.query(sql, [classID]);
    return rows;
  } catch (error) {
    throw new Error("Error fetching students by class: " + error.message);
  }
};
const checkRollNumberExists = async (rollNumber, className, section, excludeStudentID = null) => {
  try {
    // First get the ClassID for the given class and section
    const [classResult] = await db.query(
      "SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ?",
      [className, section]
    );
    
    if (classResult.length === 0) {
      return false; // Class doesn't exist, so roll number is available
    }
    
    const classID = classResult[0].ClassID;
    
    let sql = "SELECT StudentID FROM Students WHERE RollNumber = ? AND ClassID = ?";
    const params = [rollNumber, classID];

    if (excludeStudentID) {
      sql += " AND StudentID != ?";
      params.push(excludeStudentID);
    }

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
const searchStudents = async (filters) => {
  const { FirstName, LastName, RollNumber, Class, Section } = filters;

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
      c.ClassName,
      c.Section
    FROM Students s 
    LEFT JOIN Classes c ON s.ClassID = c.ClassID 
    WHERE 1=1
  `;
  const params = [];

  if (FirstName) {
    query += " AND s.FirstName LIKE ?";
    params.push(`%${FirstName}%`);
  }
  if (LastName) {
    query += " AND s.LastName LIKE ?";
    params.push(`%${LastName}%`);
  }
  if (RollNumber) {
    query += " AND s.RollNumber = ?";
    params.push(RollNumber);
  }
  if (Class) {
    query += " AND c.ClassName = ?";
    params.push(Class);
  }
  if (Section) {
    query += " AND c.Section = ?";
    params.push(Section);
  }

  query += " ORDER BY s.StudentID DESC";

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw new Error("Error searching students: " + error.message);
  }
};

// Add function to get all classes
const getAllClasses = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM Classes ORDER BY ClassName, Section");
    return rows;
  } catch (err) {
    throw new Error("Error fetching classes: " + err.message);
  }
};

export {
    addStudent, checkRollNumberExists, deleteStudent, findOrCreateClass, getAllClasses, getAllStudents, getStudentById, getStudentCount, getStudentsByClass, getStudentsByClassAndSection, searchStudents, updateStudent
};
