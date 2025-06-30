import {
  getAttendanceByID,
  getAttendanceByStudentId,
  getAllAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByClassID,
  getAttendanceByDate,
  getAttendanceSummaryByStudent,
  getClassAttendanceSummaryByClassAndDate,
  getAttendanceByNameRollClassSection,
  getAttendanceByClassAndSection,
} from "../models/attendance.model.js";

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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(classDate)) {
      return res.status(400).json({
        success: false,
        message: "ClassDate must be in YYYY-MM-DD format",
      });
    }

    // Validate status
    const validStatuses = ["Present", "Absent"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Present' or 'Absent'",
      });
    }

    const attendanceID = await createAttendance(
      studentID,
      classID,
      classDate,
      status
    );

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
    if (classDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(classDate)) {
        return res.status(400).json({
          success: false,
          message: "ClassDate must be in YYYY-MM-DD format",
        });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ["Present", "Absent"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'Present' or 'Absent'",
        });
      }
    }

    const affectedRows = await updateAttendance(
      id,
      studentID,
      classID,
      classDate,
      status
    );

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

    const affectedRows = await deleteAttendance(id);

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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
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
