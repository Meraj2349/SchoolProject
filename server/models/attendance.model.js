import db from "../config/db.config.js";

// Get one attendance by ID
export const getAttendanceByID = async (id) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Attendance WHERE AttendanceID = ?",
      [id]
    );
    return rows[0]; // Return the first row (single attendance record)
  } catch (error) {
    throw new Error("Error fetching attendance by ID: " + error.message);
  }
};

// Get attendance by student ID
export const getAttendanceByStudentId = async (studentID) => {
  try {
    const [rows] = await db.query(
      `SELECT
        a.AttendanceID,
        s.StudentID,
        c.ClassID
      FROM Attendance a 
        JOIN Students s ON a.StudentID = s.StudentID 
        JOIN Classes c ON a.ClassID = c.ClassID 
        WHERE s.StudentID = ?`,
      [studentID]
    );
    return rows; // Return all matching rows
  } catch (error) {
    throw new Error(
      "Error fetching attendance by Student ID: " + error.message
    );
  }
};

// Get all attendance with student & class info
export const getAllAttendance = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.AttendanceID,
        s.FirstName, s.LastName, s.RollNumber,
        c.ClassName, c.Section,
        a.ClassDate, a.Status
      FROM Attendance a
      JOIN Students s ON a.StudentID = s.StudentID
      JOIN Classes c ON a.ClassID = c.ClassID
      ORDER BY a.ClassDate DESC
    `);
    return rows; // Return all attendance records
  } catch (error) {
    throw new Error("Error fetching all attendance: " + error.message);
  }
};

// Create a new attendance record
export const createAttendance = async (
  studentID,
  classID,
  classDate,
  status
) => {
  try {
    const [result] = await db.query(
      `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status) VALUES (?, ?, ?, ?)`,
      [studentID, classID, classDate, status]
    );
    return result.insertId; // Return the ID of the newly created record
  } catch (error) {
    throw new Error("Error inserting attendance record: " + error.message);
  }
};

// Update an attendance record
export const updateAttendance = async (
  id,
  studentID,
  classID,
  classDate,
  status
) => {
  try {
    const [result] = await db.query(
      `UPDATE Attendance
       SET StudentID = ?,
           ClassID = ?,
           ClassDate = ?,
           Status = ?
       WHERE AttendanceID = ?`,
      [studentID, classID, classDate, status, id]
    );
    return result.affectedRows; // Return the number of affected rows
  } catch (error) {
    throw new Error("Error updating attendance: " + error.message);
  }
};

export const deleteAttendance = async (id) => {
  try {
    const [result] = await db.query(
      `DELETE FROM Attendance WHERE AttendanceID = ?`,
      [id]
    );
    return result.affectedRows; // Return number of deleted rows
  } catch (error) {
    throw new Error("Error deleting attendance: " + error.message);
  }
};

export const getAttendanceByClassID = async (classID) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.*,
        c.ClassID,
        s.StudentID
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE a.ClassID = ?`,
      [classID]
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by classID: " + error.message);
  }
};
export const getAttendanceByDate = async (date) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.*,
        c.ClassID,
        s.StudentID
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE a.ClassDate = ?`,
      [date]
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by date: " + error.message);
  }
};

export const getAttendanceSummaryByStudent = async (studentID) => {
  try {
    const [result] = await db.query(
      `
      SELECT
        s.StudentID,
        s.FirstName,
        s.LastName,
        SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) AS TotalPresent,
        SUM(CASE WHEN a.Status = 'Absent' THEN 1 ELSE 0 END) AS TotalAbsent,
        COUNT(*) AS totalDays
      FROM Attendance a
      JOIN Students s ON a.StudentID = s.StudentID
      WHERE a.StudentID = ?
      GROUP BY s.StudentID, s.FirstName, s.LastName
      `,
      [studentID]
    );
    return result[0]; // Return the summary object for the student
  } catch (error) {
    throw new Error(
      "Error getting attendance summary by student: " + error.message
    );
  }
};

export const getClassAttendanceSummaryByClassAndDate = async (
  classId,
  date
) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.Status, COUNT(*) as Count 
       FROM Attendance a
       WHERE a.ClassID = ? AND a.ClassDate = ?
       GROUP BY a.Status`,
      [classId, date]
    );
    return rows;
  } catch (err) {
    throw new Error("Error fetching class summary: " + err.message);
  }
};

//class and section model
export const getAttendanceByClassAndSection = async (className, section) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.*,
        c.ClassID,
        s.StudentID
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE c.ClassName = ? AND c.Section = ?`,
      [className, section]
    );
    return rows;
  } catch (error) {
    throw new Error(
      "Error getting attendance by class and section: " + error.message
    );
  }
};
//name ,roll, class, section model
export const  getAttendanceByNameRollClassSection = async (
  firstName,
  roll,
  className,
  section
) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.*,
        c.ClassID,
        s.StudentID
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE s.FirstName LIKE ? AND s.RollNumber LIKE ? AND c.ClassName = ? AND c.Section = ?`,
      [`%${firstName}%`, `%${roll}%`, className, section]
    );
    return rows;
  } catch (error) {
    throw new Error(
      "Error getting attendance by name, roll, class and section (skip last name): " +
        error.message
    );
  }
};
