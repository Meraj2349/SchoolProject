import {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  searchStudents,
  getStudentCount,
  getStudentById,
  getStudentsByClass,
  getStudentsByClassAndSection,
  checkRollNumberExists,
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
      message: error.message,
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
      Class,
      Section,
      AdmissionDate,
      Address,
      ParentContact,
      RollNumber,
    } = req.body;

    // Validation
    if (!FirstName || !LastName || !DateOfBirth || !Gender || !Class || !Section || !RollNumber) {
      return res.status(400).json({
        success: false,
        message: "Required fields: FirstName, LastName, DateOfBirth, Gender, Class, Section, RollNumber",
      });
    }

    // Validate date format (optional - basic check)
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
      Class,
      Section,
      AdmissionDate: AdmissionDate || new Date().toISOString().split('T')[0],
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
    
    res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: student,
    });
  } catch (error) {
    if (error.message === "Student not found") {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
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
      Class,
      Section,
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
      Class,
      Section,
      AdmissionDate,
      Address: Address?.trim(),
      ParentContact: ParentContact?.trim(),
      RollNumber: RollNumber?.toString().trim(),
    };

    const result = await updateStudent(parseInt(id), studentData);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message === "Student not found") {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
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
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message === "Student not found") {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

// Search students
const searchStudentsController = async (req, res) => {
  try {
    const { FirstName, Class, Section, RollNumber } = req.query;

    if (!FirstName && !Class && !Section && !RollNumber) {
      return res.status(400).json({
        success: false,
        message: "At least one search parameter is required: FirstName, Class, Section, or RollNumber",
      });
    }

    const filters = {
      FirstName: FirstName?.trim(),
      Class: Class?.trim(),
      Section: Section?.trim(),
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
      message: error.message,
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
      message: error.message,
    });
  }
};

export {
  getAllStudentsController,
  addStudentController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,
  searchStudentsController,
  getStudentCountController,
  getStudentsByClassController,
  getStudentsByClassAndSectionController,
  checkRollNumberController,
};