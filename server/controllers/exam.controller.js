import {
  addExamByClassDetails,
  createExamByClassNameAndSection,
  deleteExam,
  getAllExams,
  getExamById,
  getExamsByClass,
  updateExam
} from "../models/exam.model.js";

// Get all exams
const getAllExamsController = async (req, res) => {
  try {
    const exams = await getAllExams();
    res.status(200).json({
      success: true,
      message: "Exams retrieved successfully",
      data: exams,
      count: exams.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving exams",
      error: error.message,
    });
  }
};

// Get exam by ID
const getExamByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const exam = await getExamById(id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exam retrieved successfully",
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving exam",
      error: error.message,
    });
  }
};

// Get exams by class
const getExamsByClassController = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!classId || isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Valid class ID is required",
      });
    }

    const exams = await getExamsByClass(classId);
    res.status(200).json({
      success: true,
      message: "Exams retrieved successfully",
      data: exams,
      count: exams.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving exams by class",
      error: error.message,
    });
  }
};

// Add exam by class details (names instead of IDs)
const addExamByClassDetailsController = async (req, res) => {
  try {
    const { 
      examType, 
      examName, 
      className, 
      sectionName, 
      examDate
    } = req.body;

    // Validate required fields
    if (!examType || !examName || !className || !sectionName || !examDate) {
      return res.status(400).json({
        success: false,
        message: "examType, examName, className, sectionName, and examDate are required",
      });
    }

    const result = await addExamByClassDetails({
      examType,
      examName,
      className,
      sectionName,
      examDate
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding exam by class details",
      error: error.message,
    });
  }
};

// Create exam by class name and section (alternative endpoint)
const createExamByClassNameAndSectionController = async (req, res) => {
  try {
    const { 
      examType, 
      examName, 
      className, 
      sectionName, 
      examDate
    } = req.body;

    // Validate required fields
    if (!examType || !examName || !className || !sectionName || !examDate) {
      return res.status(400).json({
        success: false,
        message: "examType, examName, className, sectionName, and examDate are required",
      });
    }

    const result = await createExamByClassNameAndSection(
      examType,
      examName,
      className,
      sectionName,
      examDate
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating exam by class name and section",
      error: error.message,
    });
  }
};

// Update exam
const updateExamController = async (req, res) => {
  try {
    const { id } = req.params;
    const examData = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const result = await updateExam(id, examData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating exam",
      error: error.message,
    });
  }
};

// Delete exam
const deleteExamController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const result = await deleteExam(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting exam",
      error: error.message,
    });
  }
};

export {
  addExamByClassDetailsController,
  createExamByClassNameAndSectionController,
  deleteExamController,
  getAllExamsController,
  getExamByIdController,
  getExamsByClassController,
  updateExamController
};
