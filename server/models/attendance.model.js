import db from "../config/db.config.js";
import { branchFilter } from "../utils/branchFilter.js";

// Get one attendance by ID (branch-scoped via student join)
export const getAttendanceByID = async (id, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE a.AttendanceID = ? ${clause}`,
      [id, ...branchParams],
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error("Error fetching attendance by ID: " + error.message);
  }
};

// Get attendance by student ID (branch-scoped)
export const getAttendanceByStudentId = async (studentID, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE s.StudentID = ? ${clause}
      ORDER BY a.ClassDate DESC`,
      [studentID, ...branchParams],
    );
    return rows;
  } catch (error) {
    throw new Error(
      "Error fetching attendance by Student ID: " + error.message,
    );
  }
};

// Get all attendance with student & class info (branch-scoped)
export const getAllAttendance = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE 1=1 ${clause}
      ORDER BY a.ClassDate DESC, s.FirstName ASC
    `, branchParams);
    return rows;
  } catch (error) {
    throw new Error("Error fetching all attendance: " + error.message);
  }
};

// Create a new attendance record
export const createAttendance = async (attendanceData, branchId = null) => {
  const { studentID, classID, classDate, status } = attendanceData;

  try {
    let sql, values;
    if (branchId != null) {
      sql = `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES (?, ?, ?, ?, ?)`;
      values = [studentID, classID, classDate, status, branchId];
    } else {
      sql = `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status) VALUES (?, ?, ?, ?)`;
      values = [studentID, classID, classDate, status];
    }
    const [result] = await db.query(sql, values);
    return result.insertId;
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
      [status, id],
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error updating attendance: " + error.message);
  }
};

// Delete an attendance record
export const deleteAttendance = async (id) => {
  try {
    const [result] = await db.query(
      `DELETE FROM Attendance WHERE AttendanceID = ?`,
      [id],
    );
    return result.affectedRows;
  } catch (error) {
    throw new Error("Error deleting attendance: " + error.message);
  }
};

// Get attendance by class ID (branch-scoped)
export const getAttendanceByClassID = async (classID, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE a.ClassID = ? ${clause}
      ORDER BY a.ClassDate DESC, s.FirstName ASC`,
      [classID, ...branchParams],
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by classID: " + error.message);
  }
};

// Get attendance by date (branch-scoped)
export const getAttendanceByDate = async (date, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE a.ClassDate = ? ${clause}
      ORDER BY c.ClassName ASC, c.Section ASC, s.FirstName ASC`,
      [date, ...branchParams],
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by date: " + error.message);
  }
};

// Get attendance summary by student (branch-scoped)
export const getAttendanceSummaryByStudent = async (studentID, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE a.StudentID = ? ${clause}
      GROUP BY s.StudentID, s.FirstName, s.LastName, s.RollNumber, c.ClassName, c.Section`,
      [studentID, ...branchParams],
    );
    return result[0] || null;
  } catch (error) {
    throw new Error(
      "Error getting attendance summary by student: " + error.message,
    );
  }
};

// Get class attendance summary by class and date
export const getClassAttendanceSummaryByClassAndDate = async (
  classId,
  date,
) => {
  try {
    const [rows] = await db.query(
      `SELECT
        a.Status,
        COUNT(*) as Count
       FROM Attendance a
       WHERE a.ClassID = ? AND a.ClassDate = ?
       GROUP BY a.Status`,
      [classId, date],
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching class summary: " + error.message);
  }
};

// Get attendance by class and section (branch-scoped)
export const getAttendanceByClassAndSection = async (className, section, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE c.ClassName = ? AND c.Section = ? ${clause}
      ORDER BY a.ClassDate DESC, s.FirstName ASC`,
      [className, section, ...branchParams],
    );
    return rows;
  } catch (error) {
    throw new Error(
      "Error getting attendance by class and section: " + error.message,
    );
  }
};

// Get attendance by name, roll, class, and section (branch-scoped)
export const getAttendanceByNameRollClassSection = async (
  firstName,
  roll,
  className,
  section,
  branchId = null,
) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE s.FirstName LIKE ? AND s.RollNumber LIKE ? AND c.ClassName = ? AND c.Section = ? ${clause}
      ORDER BY a.ClassDate DESC`,
      [`%${firstName}%`, `%${roll}%`, className, section, ...branchParams],
    );
    return rows;
  } catch (error) {
    throw new Error(
      "Error getting attendance by name, roll, class and section: " +
        error.message,
    );
  }
};

// Get attendance by date range (branch-scoped)
export const getAttendanceByDateRange = async (startDate, endDate, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
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
      WHERE a.ClassDate BETWEEN ? AND ? ${clause}
      ORDER BY a.ClassDate DESC, c.ClassName ASC, c.Section ASC, s.FirstName ASC`,
      [startDate, endDate, ...branchParams],
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting attendance by date range: " + error.message);
  }
};

// Get attendance count (branch-scoped)
export const getAttendanceCount = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
  try {
    const [result] = await db.query(
      `SELECT COUNT(*) as count
       FROM Attendance a
       JOIN Students s ON a.StudentID = s.StudentID
       WHERE 1=1 ${clause}`,
      branchParams,
    );
    return result[0].count;
  } catch (error) {
    throw new Error("Error getting attendance count: " + error.message);
  }
};

// Bulk create attendance records
export const bulkCreateAttendance = async (attendanceRecords, branchId = null) => {
  try {
    let values;
    if (branchId != null) {
      values = attendanceRecords.map((record) => [
        record.studentID,
        record.classID,
        record.classDate,
        record.status,
        branchId,
      ]);
      const [result] = await db.query(
        `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES ?`,
        [values],
      );
      return result.affectedRows;
    } else {
      values = attendanceRecords.map((record) => [
        record.studentID,
        record.classID,
        record.classDate,
        record.status,
      ]);
      const [result] = await db.query(
        `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status) VALUES ?`,
        [values],
      );
      return result.affectedRows;
    }
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
      [studentID, classID, classDate],
    );
    return rows;
  } catch (error) {
    throw new Error("Error checking attendance existence: " + error.message);
  }
};

// Get attendance grid data: all records for a class+section within a date range (branch-scoped)
// Returns rows: { StudentID, FirstName, LastName, RollNumber, ClassDate, Status }
export const getAttendanceGrid = async (className, section, startDate, endDate, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
  try {
    const [rows] = await db.query(
      `SELECT
        s.StudentID,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        a.ClassDate,
        a.Status
      FROM Students s
      JOIN Classes c ON s.ClassID = c.ClassID
      LEFT JOIN Attendance a ON a.StudentID = s.StudentID
        AND a.ClassID = c.ClassID
        AND a.ClassDate BETWEEN ? AND ?
      WHERE c.ClassName = ? AND c.Section = ? ${clause}
      ORDER BY s.RollNumber ASC, a.ClassDate ASC`,
      [startDate, endDate, className, section, ...branchParams],
    );
    return rows;
  } catch (error) {
    throw new Error("Error fetching attendance grid: " + error.message);
  }
};

// Upsert (create or update) a single attendance cell
export const upsertAttendance = async (studentID, classID, classDate, status, branchId = null) => {
  try {
    const [existing] = await db.query(
      `SELECT AttendanceID FROM Attendance WHERE StudentID = ? AND ClassID = ? AND ClassDate = ?`,
      [studentID, classID, classDate],
    );
    if (existing.length > 0) {
      await db.query(
        `UPDATE Attendance SET Status = ? WHERE AttendanceID = ?`,
        [status, existing[0].AttendanceID],
      );
      return { action: "updated", attendanceID: existing[0].AttendanceID };
    } else {
      let sql, values;
      if (branchId != null) {
        sql = `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES (?, ?, ?, ?, ?)`;
        values = [studentID, classID, classDate, status, branchId];
      } else {
        sql = `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status) VALUES (?, ?, ?, ?)`;
        values = [studentID, classID, classDate, status];
      }
      const [result] = await db.query(sql, values);
      return { action: "created", attendanceID: result.insertId };
    }
  } catch (error) {
    throw new Error("Error upserting attendance: " + error.message);
  }
};

// Get attendance statistics (branch-scoped)
export const getAttendanceStatistics = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "s");
  try {
    const [rows] = await db.query(
      `SELECT
        COUNT(*) as TotalRecords,
        SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) as TotalPresent,
        SUM(CASE WHEN a.Status = 'Absent' THEN 1 ELSE 0 END) as TotalAbsent,
        ROUND((SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as OverallAttendancePercentage
      FROM Attendance a
      JOIN Students s ON a.StudentID = s.StudentID
      WHERE 1=1 ${clause}`,
      branchParams,
    );
    return rows[0];
  } catch (error) {
    throw new Error("Error getting attendance statistics: " + error.message);
  }
};
