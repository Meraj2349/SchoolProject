import {
  bulkCreateAttendance,
  checkAttendanceExists,
  createAttendance,
  deleteAttendance,
  getAllAttendance,
  getAttendanceByClassAndSection,
  getAttendanceByClassID,
  getAttendanceByDate,
  getAttendanceByDateRange,
  getAttendanceByID,
  getAttendanceByNameRollClassSection,
  getAttendanceByStudentId,
  getAttendanceCount,
  getAttendanceStatistics,
  getAttendanceSummaryByStudent,
  getClassAttendanceSummaryByClassAndDate,
  updateAttendance,
} from "../models/attendance.model.js";

// Utility function for date validation
const validateDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

// Utility function for status validation
const validateStatus = (status) => {
  const validStatuses = ["Present", "Absent"];
  return validStatuses.includes(status);
};

// Get attendance by ID
export const getAttendanceByIDController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid attendance ID is required",
      });
    }

    const attendance = await getAttendanceByID(parseInt(id));

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record retrieved successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving attendance record: " + error.message,
    });
  }
};

// Get attendance by student ID
export const getAttendanceByStudentIdController = async (req, res) => {
  try {
    const { studentID } = req.params;

    if (!studentID || isNaN(studentID)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    const attendance = await getAttendanceByStudentId(parseInt(studentID));

    res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving attendance records: " + error.message,
    });
  }
};

// Get all attendance records
export const getAllAttendanceController = async (req, res) => {
  try {
    const attendance = await getAllAttendance();

    res.status(200).json({
      success: true,
      message: "All attendance records retrieved successfully",
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving all attendance records: " + error.message,
    });
  }
};

// Create a new attendance record
export const createAttendanceController = async (req, res) => {
  try {
    const { studentID, classID, classDate, status } = req.body;

    if (!studentID || !classID || !classDate || !status) {
      return res.status(400).json({
        success: false,
        message: "Required fields: studentID, classID, classDate, status",
      });
    }

    // Validate date format
    if (!validateDate(classDate)) {
      return res.status(400).json({
        success: false,
        message: "ClassDate must be in YYYY-MM-DD format",
      });
    }

    // Validate status
    if (!validateStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Present' or 'Absent'",
      });
    }

    const attendanceData = { studentID, classID, classDate, status };
    const attendanceID = await createAttendance(attendanceData);

    res.status(201).json({
      success: true,
      message: "Attendance record created successfully",
      data: { attendanceID },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating attendance record: " + error.message,
    });
  }
};

// Update an attendance record
export const updateAttendanceController = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentID, classID, classDate, status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid attendance ID is required",
      });
    }

    // Validate date format if provided
    if (classDate && !validateDate(classDate)) {
      return res.status(400).json({
        success: false,
        message: "ClassDate must be in YYYY-MM-DD format",
      });
    }

    // Validate status if provided
    if (status && !validateStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Present' or 'Absent'",
      });
    }

    const attendanceData = { studentID, classID, classDate, status };
    const affectedRows = await updateAttendance(parseInt(id), attendanceData);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating attendance record: " + error.message,
    });
  }
};

// Delete an attendance record
export const deleteAttendanceController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid attendance ID is required",
      });
    }

    const affectedRows = await deleteAttendance(parseInt(id));

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting attendance record: " + error.message,
    });
  }
};

// Get attendance by class ID
export const getAttendanceByClassIDController = async (req, res) => {
  try {
    const { classID } = req.params;

    if (!classID || isNaN(classID)) {
      return res.status(400).json({
        success: false,
        message: "Valid class ID is required",
      });
    }

    const attendance = await getAttendanceByClassID(parseInt(classID));

    res.status(200).json({
      success: true,
      message: "Attendance records for class retrieved successfully",
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error retrieving attendance records by class ID: " + error.message,
    });
  }
};

// Get attendance by date
export const getAttendanceByDateController = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Valid date is required",
      });
    }

    // Validate date format
    if (!validateDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    const attendance = await getAttendanceByDate(date);

    res.status(200).json({
      success: true,
      message: "Attendance records for date retrieved successfully",
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving attendance records by date: " + error.message,
    });
  }
};

// Get attendance summary by student
export const getAttendanceSummaryByStudentController = async (req, res) => {
  try {
    const { studentID } = req.params;

    if (!studentID || isNaN(studentID)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    const summary = await getAttendanceSummaryByStudent(parseInt(studentID));

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found for this student",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance summary for student retrieved successfully",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error retrieving attendance summary by student: " + error.message,
    });
  }
};

// Get class attendance summary by date
export const getClassAttendanceSummaryByClassAndDateController = async (
  req,
  res
) => {
  try {
    const { classID, date } = req.params;

    if (!classID || isNaN(classID) || !date) {
      return res.status(400).json({
        success: false,
        message: "Valid class ID and date are required",
      });
    }

    // Validate date format
    if (!validateDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    const summary = await getClassAttendanceSummaryByClassAndDate(
      parseInt(classID),
      date
    );

    res.status(200).json({
      success: true,
      message: "Class attendance summary for date retrieved successfully",
      data: summary,
      count: summary.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error retrieving class attendance summary by date: " + error.message,
    });
  }
};

// Get attendance by name, roll, class, and section
export const getAttendanceByNameRollClassSectionController = async (
  req,
  res
) => {
  try {
    const { firstName, roll, class: className, section } = req.params;

    if (!firstName || !roll || !className || !section) {
      return res.status(400).json({
        success: false,
        message: "Required fields: firstName, roll, class, section",
      });
    }

    const attendance = await getAttendanceByNameRollClassSection(
      firstName,
      roll,
      className,
      section
    );

    res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error retrieving attendance records by name, roll, class, and section: " +
        error.message,
    });
  }
};

// Get attendance by class and section
export const getAttendanceByClassAndSectionController = async (req, res) => {
  try {
    const { className, section } = req.params;

    if (!className || !section) {
      return res.status(400).json({
        success: false,
        message: "Class name and section are required",
      });
    }

    const attendance = await getAttendanceByClassAndSection(className, section);

    res.status(200).json({
      success: true,
      message: "Attendance records by class and section retrieved successfully",
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Error retrieving attendance records by class and section: " +
        error.message,
    });
  }
};

// Get attendance by date range
export const getAttendanceByDateRangeController = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required",
      });
    }

    // Validate date formats
    if (!validateDate(startDate) || !validateDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Both dates must be in YYYY-MM-DD format",
      });
    }

    const attendance = await getAttendanceByDateRange(startDate, endDate);

    res.status(200).json({
      success: true,
      message: "Attendance records for date range retrieved successfully",
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving attendance records by date range: " + error.message,
    });
  }
};

// Get attendance count
export const getAttendanceCountController = async (req, res) => {
  try {
    const count = await getAttendanceCount();

    res.status(200).json({
      success: true,
      message: "Attendance count retrieved successfully",
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving attendance count: " + error.message,
    });
  }
};

// Bulk create attendance records
export const bulkCreateAttendanceController = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "attendanceRecords array is required and cannot be empty",
      });
    }

    // Validate each record
    for (const record of attendanceRecords) {
      if (!record.studentID || !record.classID || !record.classDate || !record.status) {
        return res.status(400).json({
          success: false,
          message: "Each record must have studentID, classID, classDate, and status",
        });
      }

      if (!validateDate(record.classDate)) {
        return res.status(400).json({
          success: false,
          message: "All classDates must be in YYYY-MM-DD format",
        });
      }

      if (!validateStatus(record.status)) {
        return res.status(400).json({
          success: false,
          message: "All status values must be either 'Present' or 'Absent'",
        });
      }
    }

    const affectedRows = await bulkCreateAttendance(attendanceRecords);

    res.status(201).json({
      success: true,
      message: "Attendance records created successfully",
      data: { recordsCreated: affectedRows },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error bulk creating attendance records: " + error.message,
    });
  }
};

// Check if attendance exists
export const checkAttendanceExistsController = async (req, res) => {
  try {
    const { studentID, classID, classDate } = req.query;

    if (!studentID || !classID || !classDate) {
      return res.status(400).json({
        success: false,
        message: "studentID, classID, and classDate are required",
      });
    }

    if (!validateDate(classDate)) {
      return res.status(400).json({
        success: false,
        message: "classDate must be in YYYY-MM-DD format",
      });
    }

    const exists = await checkAttendanceExists(
      parseInt(studentID),
      parseInt(classID),
      classDate
    );

    res.status(200).json({
      success: true,
      message: "Attendance existence check completed",
      data: { exists },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking attendance existence: " + error.message,
    });
  }
};

// Get attendance statistics
export const getAttendanceStatisticsController = async (req, res) => {
  try {
    const statistics = await getAttendanceStatistics();

    res.status(200).json({
      success: true,
      message: "Attendance statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving attendance statistics: " + error.message,
    });
  }
};

// Mark attendance (upsert - create or update)
export const markAttendanceController = async (req, res) => {
  try {
    const { studentId, classDate, status } = req.body;

    console.log('markAttendanceController received:', { studentId, classDate, status });

    if (!studentId || !classDate || !status) {
      return res.status(400).json({
        success: false,
        message: "Required fields: studentId, classDate, status",
      });
    }

    // Validate date format
    if (!validateDate(classDate)) {
      return res.status(400).json({
        success: false,
        message: "ClassDate must be in YYYY-MM-DD format",
      });
    }

    // Validate status
    if (!validateStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Present' or 'Absent'",
      });
    }

    // Get student information including class details
    const { getStudentById } = await import("../models/student.model.js");
    const student = await getStudentById(parseInt(studentId));
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Use the ClassID directly from the student record
    const classID = student.ClassID;
    
    if (!classID) {
      return res.status(404).json({
        success: false,
        message: "Class information not found for student",
      });
    }

    console.log(`Processing attendance for student: ${student.FirstName} ${student.LastName}, Class: ${student.ClassName}, Section: ${student.Section}, ClassID: ${classID}`);

    // Check if attendance record already exists
    const existingAttendance = await checkAttendanceExists(parseInt(studentId), classID, classDate);
    
    console.log("Existing attendance check result:", existingAttendance);
    
    if (existingAttendance && existingAttendance.length > 0) {
      // Update existing record
      const attendanceId = existingAttendance[0].AttendanceID;
      console.log(`Updating existing attendance record with ID: ${attendanceId}, new status: ${status}`);
      
      const updateResult = await updateAttendance(attendanceId, { status });
      
      if (updateResult > 0) {
        console.log('Attendance record updated successfully');
        res.json({
          success: true,
          message: "Attendance record updated successfully",
          data: { 
            attendanceID: attendanceId, 
            action: 'updated',
            studentName: `${student.FirstName} ${student.LastName}`,
            className: student.ClassName,
            section: student.Section,
            date: classDate,
            status: status
          },
        });
      } else {
        throw new Error('Failed to update attendance record');
      }
    } else {
      // Create new record with proper classID
      console.log("No existing record found, creating new attendance record");
      
      const attendanceData = { 
        studentID: parseInt(studentId), 
        classID: classID,
        classDate, 
        status 
      };
      
      console.log("Creating attendance with data:", attendanceData);
      const attendanceID = await createAttendance(attendanceData);

      if (attendanceID) {
        console.log('New attendance record created successfully with ID:', attendanceID);
        res.status(201).json({
          success: true,
          message: "Attendance record created successfully",
          data: { 
            attendanceID, 
            action: 'created',
            studentName: `${student.FirstName} ${student.LastName}`,
            className: student.ClassName,
            section: student.Section,
            date: classDate,
            status: status
          },
        });
      } else {
        throw new Error('Failed to create attendance record');
      }
    }
  } catch (error) {
    console.error("Error in markAttendanceController:", error);
    res.status(500).json({
      success: false,
      message: "Error marking attendance: " + error.message,
    });
  }
};

// Validate database synchronization
export const validateDatabaseSyncController = async (req, res) => {
  try {
    const { className, section, month, year } = req.body;

    if (!className || !section || month === undefined || !year) {
      return res.status(400).json({
        success: false,
        message: "Required fields: className, section, month, year",
      });
    }

    // Get all students for the class
    const { getAllStudents } = await import("../models/student.model.js");
    const allStudents = await getAllStudents();
    const classStudents = allStudents.filter(
      student => student.ClassName === className && student.Section === section
    );

    if (classStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for the specified class and section",
      });
    }

    // Get attendance records for the specified period
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    const attendanceRecords = await getAttendanceByClassAndSection(className, section);
    
    // Filter records by date range
    const monthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.ClassDate);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });

    // Calculate integrity metrics
    const totalStudents = classStudents.length;
    const daysInMonth = monthEnd.getDate();
    const totalPossibleRecords = totalStudents * daysInMonth;
    const actualRecords = monthRecords.length;
    const integrityPercentage = (actualRecords / totalPossibleRecords) * 100;

    res.json({
      success: true,
      message: "Database sync validation completed",
      data: {
        totalStudents,
        daysInMonth,
        totalPossibleRecords,
        actualRecords,
        integrityPercentage: Math.round(integrityPercentage * 100) / 100,
        lastUpdated: new Date().toISOString(),
        syncStatus: integrityPercentage > 95 ? 'excellent' : 
                   integrityPercentage > 80 ? 'good' : 
                   integrityPercentage > 60 ? 'fair' : 'needs_attention'
      }
    });
  } catch (error) {
    console.error("Error in validateDatabaseSyncController:", error);
    res.status(500).json({
      success: false,
      message: "Error validating database sync: " + error.message,
    });
  }
};

// Force complete data synchronization
export const forceSyncController = async (req, res) => {
  try {
    const { className, section, month, year } = req.body;

    if (!className || !section || month === undefined || !year) {
      return res.status(400).json({
        success: false,
        message: "Required fields: className, section, month, year",
      });
    }

    // Get all students for the class
    const { getAllStudents } = await import("../models/student.model.js");
    const allStudents = await getAllStudents();
    const classStudents = allStudents.filter(
      student => student.ClassName === className && student.Section === section
    );

    if (classStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for the specified class and section",
      });
    }

    // Get fresh attendance data
    const attendanceRecords = await getAttendanceByClassAndSection(className, section);
    
    // Filter by month and year
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    const monthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.ClassDate);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });

    // Transform data for frontend consumption
    const attendanceMap = {};
    monthRecords.forEach(record => {
      const key = `${record.StudentID}-${record.ClassDate}`;
      attendanceMap[key] = record.Status;
    });

    res.json({
      success: true,
      message: "Force sync completed successfully",
      data: {
        attendanceMap,
        totalRecords: monthRecords.length,
        totalStudents: classStudents.length,
        syncTimestamp: new Date().toISOString(),
        period: `${months[month]} ${year}`,
        className,
        section
      }
    });
  } catch (error) {
    console.error("Error in forceSyncController:", error);
    res.status(500).json({
      success: false,
      message: "Error forcing sync: " + error.message,
    });
  }
};

// Months array for reference
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];