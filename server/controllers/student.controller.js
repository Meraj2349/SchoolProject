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
    updateStudent
} from "../models/student.model.js";

// Utility function for validation
const validateStudentData = (data) => {
  const requiredFields = [
    "FirstName",
    "LastName",
    "DateOfBirth",
    "Gender",
    "Class",
    "Section",
    "RollNumber",
  ];
  const missingFields = requiredFields.filter((field) => !data[field]);

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

// Get all students
const getAllStudentsController = async (req, res) => {
  try {
    const students = await getAllStudents();
    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a new student
const addStudentController = async (req, res) => {
  try {
    const studentData = req.body;

    const validationError = validateStudentData(studentData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    studentData.AdmissionDate =
      studentData.AdmissionDate || new Date().toISOString().split("T")[0];

    const result = await addStudent(studentData);

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get student by ID
const getStudentByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    const student = await getStudentById(parseInt(id));

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update student
const updateStudentController = async (req, res) => {
  try {
    const { id } = req.params;
    const studentData = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    const validationError = validateStudentData(studentData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const result = await updateStudent(parseInt(id), studentData);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete student
const deleteStudentController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    const result = await deleteStudent(parseInt(id));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search students
const searchStudentsController = async (req, res) => {
  try {
    const filters = req.query;

    if (Object.keys(filters).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one search parameter is required: FirstName, Class, Section, or RollNumber",
      });
    }

    const students = await searchStudents(filters);

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get student count
const getStudentCountController = async (req, res) => {
  try {
    const count = await getStudentCount();

    res.status(200).json({
      success: true,
      message: "Student count retrieved successfully",
      data: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get students by class
const getStudentsByClassController = async (req, res) => {
  try {
    const { className } = req.params;

    if (!className) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    const students = await getStudentsByClass(className);

    res.status(200).json({
      success: true,
      message: `Students from class ${className} retrieved successfully`,
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get students by class and section
const getStudentsByClassAndSectionController = async (req, res) => {
  try {
    const { className, section } = req.params;

    if (!className || !section) {
      return res.status(400).json({
        success: false,
        message: "Both class name and section are required",
      });
    }

    const students = await getStudentsByClassAndSection(className, section);

    res.status(200).json({
      success: true,
      message: `Students from class ${className}, section ${section} retrieved successfully`,
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if roll number exists
const checkRollNumberController = async (req, res) => {
  try {
    const { rollNumber, className, section, excludeStudentID } = req.query;

    if (!rollNumber || !className || !section) {
      return res.status(400).json({
        success: false,
        message: "rollNumber, className, and section are required",
      });
    }

    const exists = await checkRollNumberExists(
      rollNumber,
      className,
      section,
      excludeStudentID ? parseInt(excludeStudentID) : null
    );

    res.status(200).json({
      success: true,
      message: "Roll number check completed",
      data: { exists },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all classes
const getAllClassesController = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.status(200).json({
      success: true,
      message: "Classes retrieved successfully",
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
    addStudentController, checkRollNumberController, deleteStudentController, getAllClassesController, getAllStudentsController, getStudentByIdController, getStudentCountController, getStudentsByClassAndSectionController, getStudentsByClassController, searchStudentsController, updateStudentController
};
