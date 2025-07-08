import db from "../config/db.config.js";

// Get one attendance by ID
export const getAttendanceByID = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.AttendanceID,
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a
      JOIN Students s ON a.StudentID = s.StudentID
      JOIN Classes c ON a.ClassID = c.ClassID
      WHERE a.AttendanceID = ?`,
      [id]
    );
    return rows[0] || null; // Return the first row or null if not found
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
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a 
      JOIN Students s ON a.StudentID = s.StudentID 
      JOIN Classes c ON a.ClassID = c.ClassID 
      WHERE s.StudentID = ?
      ORDER BY a.ClassDate DESC`,
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
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a
      JOIN Students s ON a.StudentID = s.StudentID
      JOIN Classes c ON a.ClassID = c.ClassID
      ORDER BY a.ClassDate DESC, s.FirstName ASC
    `);
    return rows; // Return all attendance records
  } catch (error) {
    throw new Error("Error fetching all attendance: " + error.message);
  }
};

// Create a new attendance record
export const createAttendance = async (attendanceData) => {
  const { studentID, classID, classDate, status } = attendanceData;
  
  try {
    const [result] = await db.query(
      `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status) 
       VALUES (?, ?, ?, ?)`,
      [studentID, classID, classDate, status]
    );
    return result.insertId; // Return the ID of the newly created record
  } catch (error) {
    throw new Error("Error creating attendance record: " + error.message);
  }
};

// Update an attendance record
export const updateAttendance = async (id, attendanceData) => {
  const { status } = attendanceData;
  
  try {
    const [result] = await db.query(
      `UPDATE Attendance
       SET Status = ?
       WHERE AttendanceID = ?`,
      [status, id]
    );
    return result.affectedRows; // Return the number of affected rows
  } catch (error) {
    throw new Error("Error updating attendance: " + error.message);
  }
};

// Delete an attendance record
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

// Get attendance by class ID
export const getAttendanceByClassID = async (classID) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.AttendanceID,
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE a.ClassID = ?
      ORDER BY a.ClassDate DESC, s.FirstName ASC`,
      [classID]
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by classID: " + error.message);
  }
};

// Get attendance by date
export const getAttendanceByDate = async (date) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.AttendanceID,
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE a.ClassDate = ?
      ORDER BY c.ClassName ASC, c.Section ASC, s.FirstName ASC`,
      [date]
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by date: " + error.message);
  }
};

// Get attendance summary by student
export const getAttendanceSummaryByStudent = async (studentID) => {
  try {
    const [result] = await db.query(
      `SELECT
        s.StudentID,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section,
        SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) AS TotalPresent,
        SUM(CASE WHEN a.Status = 'Absent' THEN 1 ELSE 0 END) AS TotalAbsent,
        COUNT(*) AS TotalDays,
        ROUND((SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS AttendancePercentage
      FROM Attendance a
      JOIN Students s ON a.StudentID = s.StudentID
      JOIN Classes c ON a.ClassID = c.ClassID
      WHERE a.StudentID = ?
      GROUP BY s.StudentID, s.FirstName, s.LastName, s.RollNumber, c.ClassName, c.Section`,
      [studentID]
    );
    return result[0] || null; // Return the summary object for the student
  } catch (error) {
    throw new Error(
      "Error getting attendance summary by student: " + error.message
    );
  }
};

// Get class attendance summary by class and date
export const getClassAttendanceSummaryByClassAndDate = async (classId, date) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.Status, 
        COUNT(*) as Count 
       FROM Attendance a
       WHERE a.ClassID = ? AND a.ClassDate = ?
       GROUP BY a.Status`,
      [classId, date]
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching class summary: " + error.message);
  }
};

// Get attendance by class and section
export const getAttendanceByClassAndSection = async (className, section) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.AttendanceID,
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE c.ClassName = ? AND c.Section = ?
      ORDER BY a.ClassDate DESC, s.FirstName ASC`,
      [className, section]
    );
    return rows;
  } catch (error) {
    throw new Error(
      "Error getting attendance by class and section: " + error.message
    );
  }
};

// Get attendance by name, roll, class, and section
export const getAttendanceByNameRollClassSection = async (
  firstName,
  roll,
  className,
  section
) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.AttendanceID,
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE s.FirstName LIKE ? AND s.RollNumber LIKE ? AND c.ClassName = ? AND c.Section = ?
      ORDER BY a.ClassDate DESC`,
      [`%${firstName}%`, `%${roll}%`, className, section]
    );
    return rows;
  } catch (error) {
    throw new Error(
      "Error getting attendance by name, roll, class and section: " + error.message
    );
  }
};

// Get attendance by date range
export const getAttendanceByDateRange = async (startDate, endDate) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.AttendanceID,
        a.StudentID,
        a.ClassID,
        a.ClassDate,
        a.Status,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        c.ClassName,
        c.Section
      FROM Attendance a
      JOIN Classes c ON a.ClassID = c.ClassID
      JOIN Students s ON a.StudentID = s.StudentID 
      WHERE a.ClassDate BETWEEN ? AND ?
      ORDER BY a.ClassDate DESC, c.ClassName ASC, c.Section ASC, s.FirstName ASC`,
      [startDate, endDate]
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by date range: " + error.message);
  }
};

// Get attendance count
export const getAttendanceCount = async () => {
  try {
    const [result] = await db.query(
      `SELECT COUNT(*) as count FROM Attendance`
    );
    return result[0].count;
  } catch (error) {
    throw new Error("Error getting attendance count: " + error.message);
  }
};

// Bulk create attendance records
export const bulkCreateAttendance = async (attendanceRecords) => {
  try {
    const values = attendanceRecords.map(record => [
      record.studentID,
      record.classID,
      record.classDate,
      record.status
    ]);

    const [result] = await db.query(
      `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status) VALUES ?`,
      [values]
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error bulk creating attendance records: " + error.message);
  }
};

// Check if attendance exists and return the record
export const checkAttendanceExists = async (studentID, classID, classDate) => {
  try {
    const [rows] = await db.query(
      `SELECT AttendanceID, Status FROM Attendance 
       WHERE StudentID = ? AND ClassID = ? AND ClassDate = ?`,
      [studentID, classID, classDate]
    );
    return rows; // Return the actual rows, not just a boolean
  } catch (error) {
    throw new Error("Error checking attendance existence: " + error.message);
  }
};

// Get attendance statistics
export const getAttendanceStatistics = async () => {
  try {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as TotalRecords,
        SUM(CASE WHEN Status = 'Present' THEN 1 ELSE 0 END) as TotalPresent,
        SUM(CASE WHEN Status = 'Absent' THEN 1 ELSE 0 END) as TotalAbsent,
        ROUND((SUM(CASE WHEN Status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as OverallAttendancePercentage
      FROM Attendance`
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error getting attendance statistics: " + error.message);
  }
};