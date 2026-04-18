import db from "../config/db.config.js";
import { branchFilter } from "../utils/branchFilter.js";

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
const VALID_EXAM_TYPES = [
  "Monthly",
  "Quarterly",
  "Half-Yearly",
  "Annual",
  "Final",
];

// Get all exams (branch-scoped via Classes join)
const getAllExams = async (branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "c");
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
      WHERE 1=1 ${clause}
      ORDER BY e.ExamDate DESC, e.ExamID DESC
    `, branchParams);
    return rows;
  } catch (err) {
    throw new Error("Error fetching exams: " + err.message);
  }
};

// Get exam by ID (branch-scoped)
const getExamById = async (examId, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "c");
  try {
    if (!examId) {
      throw new Error("Exam ID is required");
    }

    const [rows] = await db.query(
      `SELECT
        e.ExamID,
        e.ExamType,
        e.ExamName,
        e.ClassID,
        e.ExamDate,
        c.ClassName,
        c.Section
      FROM Exams e
      LEFT JOIN Classes c ON e.ClassID = c.ClassID
      WHERE e.ExamID = ? ${clause}`,
      [examId, ...branchParams],
    );

    return rows[0] || null;
  } catch (err) {
    throw new Error("Error fetching exam by ID: " + err.message);
  }
};

// Get exams by class (branch-scoped)
const getExamsByClass = async (classId, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "c");
  try {
    const [rows] = await db.query(
      `SELECT
        e.ExamID,
        e.ExamType,
        e.ExamName,
        e.ClassID,
        e.ExamDate,
        c.ClassName,
        c.Section
      FROM Exams e
      LEFT JOIN Classes c ON e.ClassID = c.ClassID
      WHERE e.ClassID = ? ${clause}
      ORDER BY e.ExamDate DESC`,
      [classId, ...branchParams],
    );
    return rows;
  } catch (err) {
    throw new Error("Error fetching exams by class: " + err.message);
  }
};

// Add exam by class name and section (branch-scoped)
const addExamByClassDetails = async (examData, branchId = null) => {
  try {
    const { examType, examName, className, sectionName, examDate } = examData;

    if (!examType || !examName || !className || !sectionName || !examDate) {
      throw new Error(
        "All fields are required: examType, examName, className, sectionName, examDate",
      );
    }

    if (!VALID_EXAM_TYPES.includes(examType)) {
      throw new Error(
        `Invalid examType. Must be one of: ${VALID_EXAM_TYPES.join(", ")}`,
      );
    }

    // Get class ID by class name and section (branch-scoped)
    const branchClause = branchId != null ? "AND branch_id = ?" : "";
    const branchParam = branchId != null ? [branchId] : [];
    const [classRows] = await db.query(
      `SELECT ClassID, ClassName, Section FROM Classes WHERE ClassName = ? AND Section = ? ${branchClause}`,
      [className, sectionName, ...branchParam],
    );

    if (classRows.length === 0) {
      throw new Error(`Class '${className} - ${sectionName}' not found`);
    }

    const classInfo = classRows[0];

    const examDateObj = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(examDateObj.getTime())) {
      throw new Error("Invalid examDate format. Use YYYY-MM-DD");
    }

    if (examDateObj < today) {
      throw new Error("examDate cannot be in the past");
    }

    const [result] = await db.query(
      `INSERT INTO Exams (ExamType, ExamName, ClassID, ExamDate) VALUES (?, ?, ?, ?)`,
      [examType, examName, classInfo.ClassID, examDate],
    );

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
        ExamDate: examDate,
      },
    };
  } catch (err) {
    throw new Error("Error adding exam by class details: " + err.message);
  }
};

// Create exam by class name and section (alternative function name, branch-scoped)
const createExamByClassNameAndSection = async (
  examType,
  examName,
  className,
  sectionName,
  examDate,
  branchId = null,
) => {
  try {
    if (!examType || !examName || !className || !sectionName || !examDate) {
      throw new Error(
        "All fields are required: examType, examName, className, sectionName, examDate",
      );
    }

    if (!VALID_EXAM_TYPES.includes(examType)) {
      throw new Error(
        `Invalid examType. Must be one of: ${VALID_EXAM_TYPES.join(", ")}`,
      );
    }

    const branchClause = branchId != null ? "AND branch_id = ?" : "";
    const branchParam = branchId != null ? [branchId] : [];
    const [classRows] = await db.query(
      `SELECT ClassID, ClassName, Section FROM Classes WHERE ClassName = ? AND Section = ? ${branchClause}`,
      [className, sectionName, ...branchParam],
    );

    if (classRows.length === 0) {
      throw new Error(`Class '${className} - ${sectionName}' not found`);
    }

    const classInfo = classRows[0];

    const examDateObj = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(examDateObj.getTime())) {
      throw new Error("Invalid examDate format. Use YYYY-MM-DD");
    }

    if (examDateObj < today) {
      throw new Error("examDate cannot be in the past");
    }

    const [result] = await db.query(
      `INSERT INTO Exams (ExamType, ExamName, ClassID, ExamDate) VALUES (?, ?, ?, ?)`,
      [examType, examName, classInfo.ClassID, examDate],
    );

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
        ExamDate: examDate,
      },
    };
  } catch (err) {
    throw new Error(
      "Error creating exam by class name and section: " + err.message,
    );
  }
};

// Update exam (branch-scoped)
const updateExam = async (examId, examData, branchId = null) => {
  const { clause: branchClause2, params: branchParams2 } = branchFilter(branchId, "c");
  try {
    if (!examId) throw new Error("Exam ID is required");

    // Fetch with branch scope to verify ownership
    const existingExam = await getExamById(examId, branchId);
    if (!existingExam) throw new Error("Exam not found");

    let { ExamType, ExamName, ClassID, ClassName, SectionName, ExamDate } =
      examData;

    if ((ClassName || SectionName) && !ClassID) {
      const cn = ClassName || "";
      const sn = SectionName || "";
      const branchClause = branchId != null ? "AND branch_id = ?" : "";
      const branchParam = branchId != null ? [branchId] : [];
      const [classRows] = await db.query(
        `SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ? ${branchClause}`,
        [cn, sn, ...branchParam],
      );
      if (classRows.length === 0)
        throw new Error(`Class '${cn} – ${sn}' not found`);
      ClassID = classRows[0].ClassID;
    }

    const updates = [];
    const params = [];

    if (ExamType !== undefined) {
      if (!VALID_EXAM_TYPES.includes(ExamType))
        throw new Error(
          `Invalid ExamType. Must be one of: ${VALID_EXAM_TYPES.join(", ")}`,
        );
      updates.push("ExamType = ?");
      params.push(ExamType);
    }

    if (ExamName !== undefined) {
      if (!ExamName || ExamName.trim().length === 0)
        throw new Error("ExamName cannot be empty");
      updates.push("ExamName = ?");
      params.push(ExamName.trim());
    }

    if (ClassID !== undefined) {
      const branchClause = branchId != null ? "AND branch_id = ?" : "";
      const branchParam = branchId != null ? [branchId] : [];
      const [classCheck] = await db.query(
        `SELECT ClassID FROM Classes WHERE ClassID = ? ${branchClause}`,
        [ClassID, ...branchParam],
      );
      if (classCheck.length === 0) throw new Error("Class not found");
      updates.push("ClassID = ?");
      params.push(ClassID);
    }

    if (ExamDate !== undefined) {
      const d = new Date(ExamDate);
      if (isNaN(d.getTime()))
        throw new Error("Invalid ExamDate format. Use YYYY-MM-DD");
      updates.push("ExamDate = ?");
      params.push(ExamDate);
    }

    if (updates.length === 0) throw new Error("No valid fields to update");

    params.push(examId);
    const [result] = await db.query(
      `UPDATE Exams SET ${updates.join(", ")} WHERE ExamID = ?`,
      params,
    );

    if (result.affectedRows === 0) throw new Error("No rows were updated");

    return { success: true, message: "Exam updated successfully" };
  } catch (err) {
    throw new Error("Error updating exam: " + err.message);
  }
};

// Delete exam (branch-scoped)
const deleteExam = async (examId, branchId = null) => {
  try {
    if (!examId) {
      throw new Error("Exam ID is required");
    }

    const examInfo = await getExamById(examId, branchId);
    if (!examInfo) {
      throw new Error("Exam not found");
    }

    await db.query("DELETE FROM Results WHERE ExamID = ?", [examId]);

    const [result] = await db.query(
      `DELETE FROM Exams WHERE ExamID = ?`,
      [examId],
    );

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
        ExamDate: examInfo.ExamDate,
      },
    };
  } catch (err) {
    throw new Error("Error deleting exam: " + err.message);
  }
};

// Get distinct exam names (public — no branch scoping, used for autocomplete on public pages)
const getDistinctExamNames = async () => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT ExamName FROM Exams ORDER BY ExamName ASC`
    );
    return rows.map((r) => r.ExamName);
  } catch (err) {
    throw new Error("Error fetching exam names: " + err.message);
  }
};

export {
  addExamByClassDetails,
  createExamByClassNameAndSection,
  deleteExam,
  getAllExams,
  getDistinctExamNames,
  getExamById,
  getExamsByClass,
  updateExam,
  VALID_EXAM_TYPES,
};
