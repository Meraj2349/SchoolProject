import { t } from "../config/i18n.js";
import {
  addStudent,
  checkRollNumberExists,
  deleteStudent,
  getAllClasses,
  getAllStudents,
  getStudentById,
  getStudentCount,
  getStudentsByClass,
  getStudentsByClassAndSection,
  searchStudents,
  updateStudent,
} from "../models/student.model.js";

// Utility function for validation
const validateStudentData = (data) => {
  // Frontend sends "ClassName"; backend model uses "Class" — accept both.
  const normalised = { ...data };
  if (!normalised.Class && normalised.ClassName) normalised.Class = normalised.ClassName;

  const requiredFields = [
    "FirstName",
    "LastName",
    "DateOfBirth",
    "Gender",
    "Class",
    "Section",
    "RollNumber",
  ];
  const missingFields = requiredFields.filter((field) => !normalised[field]);

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (data.DateOfBirth && !dateRegex.test(data.DateOfBirth)) {
    return "DateOfBirth must be in YYYY-MM-DD format";
  }
  if (data.AdmissionDate && !dateRegex.test(data.AdmissionDate)) {
    return "AdmissionDate must be in YYYY-MM-DD format";
  }

  return null;
};

// Get all students (branch-scoped)
const getAllStudentsController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const students = await getAllStudents(branchId);
    res.status(200).json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a new student
const addStudentController = async (req, res) => {
  const lang = req.language;
  try {
    const studentData = { ...req.body };
    // Normalise ClassName → Class for the model layer
    if (!studentData.Class && studentData.ClassName) studentData.Class = studentData.ClassName;

    const validationError = validateStudentData(studentData);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    studentData.AdmissionDate =
      studentData.AdmissionDate || new Date().toISOString().split("T")[0];

    const branchId = req.branchId ?? null;
    const result = await addStudent(studentData, branchId);

    res.status(201).json({
      success: true,
      message: t("student_created", lang),
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student by ID
const getStudentByIdController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("student_required_fields", lang) });
    }

    const student = await getStudentById(parseInt(id));

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: t("student_not_found", lang) });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student
const updateStudentController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;
    const studentData = { ...req.body };
    // Normalise ClassName → Class for the model layer
    if (!studentData.Class && studentData.ClassName) studentData.Class = studentData.ClassName;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("student_required_fields", lang) });
    }

    const validationError = validateStudentData(studentData);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const branchId = req.branchId ?? null;
    const result = await updateStudent(parseInt(id), studentData, branchId);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: t("student_not_found", lang) });
    }

    res
      .status(200)
      .json({ success: true, message: t("student_updated", lang) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete student
const deleteStudentController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("student_required_fields", lang) });
    }

    const branchId = req.branchId ?? null;
    const result = await deleteStudent(parseInt(id), branchId);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: t("student_not_found", lang) });
    }

    res
      .status(200)
      .json({ success: true, message: t("student_deleted", lang) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search students
const searchStudentsController = async (req, res) => {
  const lang = req.language;
  try {
    const filters = req.query;

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({
        success: false,
        message: t("student_required_fields", lang),
      });
    }

    const branchId = req.branchId ?? null;
    const students = await searchStudents(filters, branchId);

    res.status(200).json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student count (branch-scoped)
const getStudentCountController = async (req, res) => {
  const branchId = req.branchId ?? null;
  try {
    const count = await getStudentCount(branchId);
    res.status(200).json({ success: true, data: count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get students by class
const getStudentsByClassController = async (req, res) => {
  const lang = req.language;
  try {
    const { className } = req.params;

    if (!className) {
      return res
        .status(400)
        .json({ success: false, message: t("class_name_required", lang) });
    }

    const branchId = req.branchId ?? null;
    const students = await getStudentsByClass(className, branchId);

    res
      .status(200)
      .json({ success: true, data: students, count: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get students by class and section
const getStudentsByClassAndSectionController = async (req, res) => {
  const lang = req.language;
  try {
    const { className, sectionName } = req.params;

    if (!className || !sectionName) {
      return res
        .status(400)
        .json({
          success: false,
          message: t("attendance_class_section_required", lang),
        });
    }

    const branchId = req.branchId ?? null;
    const students = await getStudentsByClassAndSection(className, sectionName, branchId);

    res
      .status(200)
      .json({ success: true, data: students, count: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if roll number exists
const checkRollNumberController = async (req, res) => {
  try {
    const { rollNumber, className, section, excludeStudentID } = req.query;

    if (!rollNumber || !className || !section) {
      return res
        .status(400)
        .json({
          success: false,
          message: "rollNumber, className, and section are required",
        });
    }

    const exists = await checkRollNumberExists(
      rollNumber,
      className,
      section,
      excludeStudentID ? parseInt(excludeStudentID) : null,
    );

    res.status(200).json({ success: true, data: { exists } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all classes
const getAllClassesController = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addStudentController,
  checkRollNumberController,
  deleteStudentController,
  getAllClassesController,
  getAllStudentsController,
  getStudentByIdController,
  getStudentCountController,
  getStudentsByClassAndSectionController,
  getStudentsByClassController,
  searchStudentsController,
  updateStudentController,
};
