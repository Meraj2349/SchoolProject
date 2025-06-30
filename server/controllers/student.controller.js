import {
  addStudent,
  checkRollNumberExists,
  deleteStudent,
  getAllStudents,
  getStudentById,
  getStudentCount,
  getStudentsByClass,
  getStudentsByClassAndSection,
  searchStudents,
  updateStudent,
} from "../models/student.model.js";

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
      message: "Error retrieving students: " + error.message,
    });
  }
};

// Add a new student
const addStudentController = async (req, res) => {
  try {
    const {
      FirstName,
      LastName,
      DateOfBirth,
      Gender,
      ClassID,
      AdmissionDate,
      Address,
      ParentContact,
      RollNumber,
    } = req.body;

    // Validation
    if (!FirstName || !LastName || !DateOfBirth || !Gender || !ClassID || !RollNumber) {
      return res.status(400).json({
        success: false,
        message: "Required fields: FirstName, LastName, DateOfBirth, Gender, ClassID, RollNumber",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(DateOfBirth)) {
      return res.status(400).json({
        success: false,
        message: "DateOfBirth must be in YYYY-MM-DD format",
      });
    }

    if (AdmissionDate && !dateRegex.test(AdmissionDate)) {
      return res.status(400).json({
        success: false,
        message: "AdmissionDate must be in YYYY-MM-DD format",
      });
    }

    const studentData = {
      FirstName: FirstName.trim(),
      LastName: LastName.trim(),
      DateOfBirth,
      Gender,
      ClassID,
      AdmissionDate: AdmissionDate || new Date().toISOString().split("T")[0],
      Address: Address?.trim() || null,
      ParentContact: ParentContact?.trim() || null,
      RollNumber: RollNumber.toString().trim(),
    };

    const result = await addStudent(studentData);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        studentID: result.studentID,
        roll_number: result.roll_number,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding student: " + error.message,
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
      message: "Error retrieving student: " + error.message,
    });
  }
};

// Update student
const updateStudentController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      FirstName,
      LastName,
      DateOfBirth,
      Gender,
      ClassID,
      AdmissionDate,
      Address,
      ParentContact,
      RollNumber,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    // Validate date format if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (DateOfBirth && !dateRegex.test(DateOfBirth)) {
      return res.status(400).json({
        success: false,
        message: "DateOfBirth must be in YYYY-MM-DD format",
      });
    }

    if (AdmissionDate && !dateRegex.test(AdmissionDate)) {
      return res.status(400).json({
        success: false,
        message: "AdmissionDate must be in YYYY-MM-DD format",
      });
    }

    const studentData = {
      FirstName: FirstName?.trim(),
      LastName: LastName?.trim(),
      DateOfBirth,
      Gender,
      ClassID,
      AdmissionDate,
      Address: Address?.trim(),
      ParentContact: ParentContact?.trim(),
      RollNumber: RollNumber?.toString().trim(),
    };

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
    res.status(400).json({
      success: false,
      message: "Error updating student: " + error.message,
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
      message: "Error deleting student: " + error.message,
    });
  }
};

// Search students
const searchStudentsController = async (req, res) => {
  try {
    const { FirstName, ClassID, RollNumber } = req.query;

    if (!FirstName && !ClassID && !RollNumber) {
      return res.status(400).json({
        success: false,
        message: "At least one search parameter is required: FirstName, ClassID, or RollNumber",
      });
    }

    const filters = {
      FirstName: FirstName?.trim(),
      ClassID: ClassID ? parseInt(ClassID) : null,
      RollNumber: RollNumber?.trim(),
    };

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
      message: "Error searching students: " + error.message,
    });
  }
};

// Get student count
const getStudentCountController = async (req, res) => {
  try {
    const result = await getStudentCount();

    res.status(200).json({
      success: true,
      message: "Student count retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving student count: " + error.message,
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

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No students found for class ${className}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Students from class ${className} retrieved successfully`,
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving students by class: " + error.message,
    });
  }
};

// Check if roll number exists
const checkRollNumberController = async (req, res) => {
  try {
    const { rollNumber, className, section } = req.query;
    const { excludeStudentID } = req.query;

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
      data: {
        exists,
        rollNumber,
        className,
        section,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking roll number: " + error.message,
    });
  }
};


//class and section based students
const getStudentsByClassAndSectionController = async (req, res) => {
  try {
    const { className, sectionName } = req.params;

    if (!className || !sectionName) {
      return res.status(400).json({
        success: false,
        message: "Class name and section are required",
      });
    }

    const students = await getStudentsByClassAndSection(className, sectionName);

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No students found for class ${className} and section ${sectionName}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Students from class ${className} and section ${sectionName} retrieved successfully`,
      data: students,
      count: students.length,
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving students by class and section: " + error.message,
    });
  }
};

export {
  addStudentController, checkRollNumberController, deleteStudentController, getAllStudentsController, getStudentByIdController, getStudentCountController, getStudentsByClassAndSectionController, getStudentsByClassController, searchStudentsController, updateStudentController
};
