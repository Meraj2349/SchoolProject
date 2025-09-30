import {
    addMultipleResults,
    addResult,
    addResultByStudentDetails,
    advancedSearchResults,
    checkResultExists,
    deleteResult,
    deleteResultsByExam,
    getAllResults,
    getResultById,
    getResultCount,
    getResultsByClass,
    getResultsByExam,
    getResultsByStudent,
    getResultsBySubject,
    getStudentResultSummary,
    searchResults,
    updateResult
} from "../models/result.model.js";

// Utility function for validation
const validateResultData = (data) => {
  const requiredFields = ["StudentID", "ExamID", "SubjectID", "ClassID", "MarksObtained"];
  const missingFields = requiredFields.filter((field) => !data[field] && data[field] !== 0);

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  if (data.MarksObtained < 0) {
    return "MarksObtained cannot be negative";
  }

  if (data.MarksObtained > 100) {
    return "MarksObtained cannot exceed 100";
  }

  return null;
};

// Get all results
const getAllResultsController = async (req, res) => {
  try {
    const results = await getAllResults();
    res.status(200).json({
      success: true,
      message: "Results retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving results",
      error: error.message,
    });
  }
};

// Get result by ID
const getResultByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid result ID is required",
      });
    }

    const result = await getResultById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving result",
      error: error.message,
    });
  }
};

// Get results by student
const getResultsByStudentController = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    const results = await getResultsByStudent(studentId);
    res.status(200).json({
      success: true,
      message: "Student results retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving student results",
      error: error.message,
    });
  }
};

// Get results by exam
const getResultsByExamController = async (req, res) => {
  try {
    const { examId } = req.params;
    
    if (!examId || isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const results = await getResultsByExam(examId);
    res.status(200).json({
      success: true,
      message: "Exam results retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving exam results",
      error: error.message,
    });
  }
};

// Get results by class
const getResultsByClassController = async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (!classId || isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Valid class ID is required",
      });
    }

    const results = await getResultsByClass(classId);
    res.status(200).json({
      success: true,
      message: "Class results retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving class results",
      error: error.message,
    });
  }
};

// Get results by subject
const getResultsBySubjectController = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    if (!subjectId || isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Valid subject ID is required",
      });
    }

    const results = await getResultsBySubject(subjectId);
    res.status(200).json({
      success: true,
      message: "Subject results retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving subject results",
      error: error.message,
    });
  }
};

// Add new result
const addResultController = async (req, res) => {
  try {
    const resultData = req.body;

    // Validate input data
    const validationError = validateResultData(resultData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Check if result already exists
    const resultExists = await checkResultExists(
      resultData.StudentID,
      resultData.ExamID,
      resultData.SubjectID
    );

    if (resultExists) {
      return res.status(409).json({
        success: false,
        message: "Result already exists for this student, exam, and subject",
      });
    }

    const result = await addResult(resultData);
    
    if (result.affectedRows > 0) {
      res.status(201).json({
        success: true,
        message: "Result added successfully",
        data: { resultId: result.insertId },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to add result",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding result",
      error: error.message,
    });
  }
};

// Add multiple results
const addMultipleResultsController = async (req, res) => {
  try {
    const { results } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Results array is required and cannot be empty",
      });
    }

    // Validate each result
    for (let i = 0; i < results.length; i++) {
      const validationError = validateResultData(results[i]);
      if (validationError) {
        return res.status(400).json({
          success: false,
          message: `Result ${i + 1}: ${validationError}`,
        });
      }
    }

    const result = await addMultipleResults(results);
    
    if (result.affectedRows > 0) {
      res.status(201).json({
        success: true,
        message: `${result.affectedRows} results added successfully`,
        data: { affectedRows: result.affectedRows },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to add results",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding multiple results",
      error: error.message,
    });
  }
};

// Update result
const updateResultController = async (req, res) => {
  try {
    const { id } = req.params;
    const resultData = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid result ID is required",
      });
    }

    // Validate input data
    const validationError = validateResultData(resultData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Check if result exists
    const existingResult = await getResultById(id);
    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const result = await updateResult(id, resultData);
    
    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Result updated successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update result",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating result",
      error: error.message,
    });
  }
};

// Delete result
const deleteResultController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid result ID is required",
      });
    }

    // Check if result exists
    const existingResult = await getResultById(id);
    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const result = await deleteResult(id);
    
    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Result deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete result",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting result",
      error: error.message,
    });
  }
};

// Delete results by exam
const deleteResultsByExamController = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId || isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const result = await deleteResultsByExam(examId);
    
    res.status(200).json({
      success: true,
      message: `${result.affectedRows} results deleted successfully`,
      data: { affectedRows: result.affectedRows },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting results by exam",
      error: error.message,
    });
  }
};

// Get result count
const getResultCountController = async (req, res) => {
  try {
    const count = await getResultCount();
    res.status(200).json({
      success: true,
      message: "Result count retrieved successfully",
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving result count",
      error: error.message,
    });
  }
};

// Get student result summary
const getStudentResultSummaryController = async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid student ID is required",
      });
    }

    if (!examId || isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const results = await getStudentResultSummary(studentId, examId);
    res.status(200).json({
      success: true,
      message: "Student result summary retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving student result summary",
      error: error.message,
    });
  }
};

// Search results
const searchResultsController = async (req, res) => {
  try {
    const filters = req.query;
    
    const results = await searchResults(filters);
    res.status(200).json({
      success: true,
      message: "Results searched successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching results",
      error: error.message,
    });
  }
};

// Check if result exists
const checkResultExistsController = async (req, res) => {
  try {
    const { studentId, examId, subjectId } = req.query;

    if (!studentId || !examId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: "Student ID, exam ID, and subject ID are required",
      });
    }

    const exists = await checkResultExists(studentId, examId, subjectId);
    res.status(200).json({
      success: true,
      message: "Result existence checked successfully",
      data: { exists },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking result existence",
      error: error.message,
    });
  }
};

// Get results with teacher information
const getResultsWithTeacherInfoController = async (req, res) => {
  try {
    const results = await getResultsWithTeacherInfo();
    res.status(200).json({
      success: true,
      message: "Results with teacher info retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving results with teacher info",
      error: error.message,
    });
  }
};

// Get class results summary
const getClassResultsSummaryController = async (req, res) => {
  try {
    const { classId, examId } = req.params;
    
    if (!classId || isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: "Valid class ID is required",
      });
    }

    if (!examId || isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: "Valid exam ID is required",
      });
    }

    const summary = await getClassResultsSummary(classId, examId);
    res.status(200).json({
      success: true,
      message: "Class results summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving class results summary",
      error: error.message,
    });
  }
};

// Get subject-wise results
const getSubjectWiseResultsController = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    if (!subjectId || isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Valid subject ID is required",
      });
    }

    const results = await getSubjectWiseResults(subjectId);
    res.status(200).json({
      success: true,
      message: "Subject-wise results retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving subject-wise results",
      error: error.message,
    });
  }
};

// Add result by student details (names instead of IDs)
const addResultByStudentDetailsController = async (req, res) => {
  try {
    const { 
      studentName, 
      rollNumber, 
      className, 
      sectionName, 
      examName, 
      subjectName, 
      marksObtained 
    } = req.body;

    // Validate required fields
    if (!studentName && !rollNumber) {
      return res.status(400).json({
        success: false,
        message: "Either student name or roll number is required",
      });
    }

    if (!className || !sectionName || !examName || !subjectName || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: "className, sectionName, examName, subjectName, and marksObtained are required",
      });
    }

    const result = await addResultByStudentDetails({
      studentName,
      rollNumber,
      className,
      sectionName,
      examName,
      subjectName,
      marksObtained
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding result by student details",
      error: error.message,
    });
  }
};

// Advanced search with pagination and comprehensive filters
const advancedSearchResultsController = async (req, res) => {
  try {
    const {
      studentName,
      rollNumber,
      className,
      sectionName,
      examName,
      subjectName,
      minMarks,
      maxMarks,
      examType,
      startDate,
      endDate,
      sortBy = 'examDate',
      sortOrder = 'DESC',
      limit = 50,
      offset = 0
    } = req.query;

    const searchCriteria = {
      studentName,
      rollNumber,
      className,
      sectionName,
      examName,
      subjectName,
      minMarks: minMarks ? parseInt(minMarks) : undefined,
      maxMarks: maxMarks ? parseInt(maxMarks) : undefined,
      examType,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const results = await advancedSearchResults(searchCriteria);

    res.status(200).json({
      success: true,
      message: "Advanced search completed successfully",
      data: results.results,
      pagination: {
        total: results.total,
        limit: results.limit,
        offset: results.offset,
        hasMore: results.hasMore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in advanced search",
      error: error.message,
    });
  }
};

export {
    addMultipleResultsController, addResultByStudentDetailsController, addResultController, advancedSearchResultsController,
    checkResultExistsController,
    deleteResultController,
    deleteResultsByExamController,
    getAllResultsController,
    getResultByIdController,
    getResultCountController,
    getResultsByClassController,
    getResultsByExamController,
    getResultsByStudentController,
    getResultsBySubjectController,
    getStudentResultSummaryController,
    searchResultsController,
    updateResultController
};

