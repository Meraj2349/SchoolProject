import db from "../config/db.config.js";

/**
 * Simple Exam Model for School Management System
 * 
 * Database Schema:
 * CREATE TABLE Exams (
 *     ExamID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
 *     ExamType ENUM('Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Final') NOT NULL,
 *     ExamName VARCHAR(50) NOT NULL,
 *     ClassID INT NOT NULL,
 *     ExamDate DATE NOT NULL,
 *     FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
 * );
 */

// Valid exam types from database schema
const VALID_EXAM_TYPES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Final'];

// Get all exams
const getAllExams = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.ExamID,
        e.ExamType,
        e.ExamName,
        e.ClassID,
        e.ExamDate,
        c.ClassName,
        c.Section
      FROM Exams e
      LEFT JOIN Classes c ON e.ClassID = c.ClassID
      ORDER BY e.ExamDate DESC, e.ExamID DESC
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching exams: " + err.message);
  }
};

// Get exam by ID
const getExamById = async (examId) => {
  try {
    if (!examId) {
      throw new Error("Exam ID is required");
    }

    const [rows] = await db.query(`
      SELECT 
        e.ExamID,
        e.ExamType,
        e.ExamName,
        e.ClassID,
        e.ExamDate,
        c.ClassName,
        c.Section
      FROM Exams e
      LEFT JOIN Classes c ON e.ClassID = c.ClassID
      WHERE e.ExamID = ?
    `, [examId]);
    
    return rows[0] || null;
  } catch (err) {
    throw new Error("Error fetching exam by ID: " + err.message);
  }
};

// Get exams by class
const getExamsByClass = async (classId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.ExamID,
        e.ExamType,
        e.ExamName,
        e.ClassID,
        e.ExamDate,
        c.ClassName,
        c.Section
      FROM Exams e
      LEFT JOIN Classes c ON e.ClassID = c.ClassID
      WHERE e.ClassID = ?
      ORDER BY e.ExamDate DESC
    `, [classId]);
    return rows;
  } catch (err) {
    throw new Error("Error fetching exams by class: " + err.message);
  }
};

// Add exam by class name and section
const addExamByClassDetails = async (examData) => {
  try {
    const { 
      examType, 
      examName, 
      className, 
      sectionName, 
      examDate
    } = examData;

    // Validate required fields
    if (!examType || !examName || !className || !sectionName || !examDate) {
      throw new Error("All fields are required: examType, examName, className, sectionName, examDate");
    }

    // Validate exam type
    if (!VALID_EXAM_TYPES.includes(examType)) {
      throw new Error(`Invalid examType. Must be one of: ${VALID_EXAM_TYPES.join(', ')}`);
    }

    // Get class ID by class name and section
    const [classRows] = await db.query(`
      SELECT ClassID, ClassName, Section
      FROM Classes 
      WHERE ClassName = ? AND Section = ?
    `, [className, sectionName]);

    if (classRows.length === 0) {
      throw new Error(`Class '${className} - ${sectionName}' not found`);
    }

    const classInfo = classRows[0];

    // Validate date
    const examDateObj = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(examDateObj.getTime())) {
      throw new Error("Invalid examDate format. Use YYYY-MM-DD");
    }

    if (examDateObj < today) {
      throw new Error("examDate cannot be in the past");
    }

    // Insert the exam
    const [result] = await db.query(`
      INSERT INTO Exams (ExamType, ExamName, ClassID, ExamDate)
      VALUES (?, ?, ?, ?)
    `, [examType, examName, classInfo.ClassID, examDate]);

    return {
      success: true,
      examId: result.insertId,
      message: `Exam '${examName}' successfully scheduled for class '${className} - ${sectionName}' on ${examDate}`,
      data: {
        ExamID: result.insertId,
        ExamType: examType,
        ExamName: examName,
        ClassID: classInfo.ClassID,
        ClassName: className,
        Section: sectionName,
        ExamDate: examDate
      }
    };
  } catch (err) {
    throw new Error("Error adding exam by class details: " + err.message);
  }
};

// Create exam by class name and section (alternative function name)
const createExamByClassNameAndSection = async (examType, examName, className, sectionName, examDate) => {
  try {
    // Validate required fields
    if (!examType || !examName || !className || !sectionName || !examDate) {
      throw new Error("All fields are required: examType, examName, className, sectionName, examDate");
    }

    // Validate exam type
    if (!VALID_EXAM_TYPES.includes(examType)) {
      throw new Error(`Invalid examType. Must be one of: ${VALID_EXAM_TYPES.join(', ')}`);
    }

    // Get class ID by class name and section
    const [classRows] = await db.query(`
      SELECT ClassID, ClassName, Section
      FROM Classes 
      WHERE ClassName = ? AND Section = ?
    `, [className, sectionName]);

    if (classRows.length === 0) {
      throw new Error(`Class '${className} - ${sectionName}' not found`);
    }

    const classInfo = classRows[0];

    // Validate date
    const examDateObj = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(examDateObj.getTime())) {
      throw new Error("Invalid examDate format. Use YYYY-MM-DD");
    }

    if (examDateObj < today) {
      throw new Error("examDate cannot be in the past");
    }

    // Insert the exam
    const [result] = await db.query(`
      INSERT INTO Exams (ExamType, ExamName, ClassID, ExamDate)
      VALUES (?, ?, ?, ?)
    `, [examType, examName, classInfo.ClassID, examDate]);

    return {
      success: true,
      examId: result.insertId,
      message: `Exam '${examName}' successfully created for class '${className} - ${sectionName}' on ${examDate}`,
      exam: {
        ExamID: result.insertId,
        ExamType: examType,
        ExamName: examName,
        ClassID: classInfo.ClassID,
        ClassName: className,
        Section: sectionName,
        ExamDate: examDate
      }
    };
  } catch (err) {
    throw new Error("Error creating exam by class name and section: " + err.message);
  }
};

// Update exam
const updateExam = async (examId, examData) => {
  try {
    if (!examId) {
      throw new Error("Exam ID is required");
    }

    // Check if exam exists
    const [existingExam] = await db.query(`
      SELECT * FROM Exams WHERE ExamID = ?
    `, [examId]);

    if (existingExam.length === 0) {
      throw new Error("Exam not found");
    }

    const { ExamType, ExamName, ClassID, ExamDate } = examData;
    const updates = [];
    const params = [];

    // Build dynamic update query
    if (ExamType !== undefined) {
      if (!VALID_EXAM_TYPES.includes(ExamType)) {
        throw new Error(`Invalid ExamType. Must be one of: ${VALID_EXAM_TYPES.join(', ')}`);
      }
      updates.push("ExamType = ?");
      params.push(ExamType);
    }

    if (ExamName !== undefined) {
      if (!ExamName || ExamName.trim().length === 0) {
        throw new Error("ExamName cannot be empty");
      }
      if (ExamName.length > 50) {
        throw new Error("ExamName cannot exceed 50 characters");
      }
      updates.push("ExamName = ?");
      params.push(ExamName.trim());
    }

    if (ClassID !== undefined) {
      // Validate class exists
      const [classCheck] = await db.query(`
        SELECT ClassID FROM Classes WHERE ClassID = ?
      `, [ClassID]);

      if (classCheck.length === 0) {
        throw new Error("Class not found");
      }

      updates.push("ClassID = ?");
      params.push(ClassID);
    }

    if (ExamDate !== undefined) {
      const examDate = new Date(ExamDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(examDate.getTime())) {
        throw new Error("Invalid ExamDate format. Use YYYY-MM-DD");
      }

      if (examDate < today) {
        throw new Error("ExamDate cannot be in the past");
      }

      updates.push("ExamDate = ?");
      params.push(ExamDate);
    }

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    // Perform update
    params.push(examId);
    const [result] = await db.query(`
      UPDATE Exams 
      SET ${updates.join(', ')}
      WHERE ExamID = ?
    `, params);

    if (result.affectedRows === 0) {
      throw new Error("No rows were updated");
    }

    return {
      success: true,
      message: "Exam updated successfully",
      affectedRows: result.affectedRows
    };
  } catch (err) {
    throw new Error("Error updating exam: " + err.message);
  }
};

// Delete exam
const deleteExam = async (examId) => {
  try {
    if (!examId) {
      throw new Error("Exam ID is required");
    }

    // Check if exam exists
    const examInfo = await getExamById(examId);
    if (!examInfo) {
      throw new Error("Exam not found");
    }

    // Delete the exam
    const [result] = await db.query(`
      DELETE FROM Exams WHERE ExamID = ?
    `, [examId]);

    if (result.affectedRows === 0) {
      throw new Error("No exam was deleted");
    }

    return {
      success: true,
      message: `Exam '${examInfo.ExamName}' has been deleted successfully`,
      deletedExam: {
        ExamID: examId,
        ExamName: examInfo.ExamName,
        ExamType: examInfo.ExamType,
        ClassName: examInfo.ClassName,
        Section: examInfo.Section,
        ExamDate: examInfo.ExamDate
      }
    };
  } catch (err) {
    throw new Error("Error deleting exam: " + err.message);
  }
};

export {
  addExamByClassDetails,
  createExamByClassNameAndSection,
  deleteExam,
  getAllExams,
  getExamById,
  getExamsByClass,
  updateExam,
  VALID_EXAM_TYPES
};

