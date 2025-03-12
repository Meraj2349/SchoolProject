import {
    getAllResults,
    addResult,
    deleteResult,
    updateResult,
    searchResults,
    getResultById,
    getResultsByStudent,
    getResultsByExam,
    getResultsByClass,
    getHighestMarksInSubject,
    getSubjectHighestMarksByClassAndExam,
  getStudentResultsByExam

  } from "../models/result.model.js";
  
  // Get all results
  const getAllResultsController = async (req, res) => {
    try {
      const results = await getAllResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Add a new result
  const addResultController = async (req, res) => {
    try {
      const result = await addResult(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Delete a result by ID
  const deleteResultController = async (req, res) => {
    try {
      const resultID = req.params.id;
      const result = await deleteResult(resultID);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update a result by ID
  const updateResultController = async (req, res) => {
    try {
      const resultID = req.params.id;
      const result = await updateResult(resultID, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Search results by filters
  const searchResultsController = async (req, res) => {
    try {
      const filters = req.query; // Get filters from query parameters
      const results = await searchResults(filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get a result by ID
  const getResultByIdController = async (req, res) => {
    try {
      const resultID = req.params.id;
      const result = await getResultById(resultID);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get results by student ID
  const getResultsByStudentController = async (req, res) => {
    try {
      const studentID = req.params.studentID;
      const results = await getResultsByStudent(studentID);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get results by exam ID
  const getResultsByExamController = async (req, res) => {
    try {
      const examID = req.params.examID;
      const results = await getResultsByExam(examID);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get results by class ID
  const getResultsByClassController = async (req, res) => {
    try {
      const classID = req.params.classID;
      const results = await getResultsByClass(classID);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get highest marks in a subject for a specific class, exam and year
  const getHighestMarksInSubjectController = async (req, res) => {
    try {
      const { className, examName, year, subjectName } = req.params;
      const result = await getHighestMarksInSubject(className, examName, year, subjectName);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get highest marks for all subjects in a specific class, exam and year
  const getSubjectHighestMarksByClassAndExamController = async (req, res) => {
    try {
      const { className, examName, year } = req.params;
      const result = await getSubjectHighestMarksByClassAndExam(className, examName, year);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const getStudentResultsByExamController = async (req, res) => {
    try {
      const { studentID, className, examName, year } = req.params;
      const results = await getStudentResultsByExam(studentID, className, examName, year);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export {
    getAllResultsController,
    addResultController,
    deleteResultController,
    updateResultController,
    searchResultsController,
    getResultByIdController,
    getResultsByStudentController,
    getResultsByExamController,
    getResultsByClassController,
    getHighestMarksInSubjectController,
    getSubjectHighestMarksByClassAndExamController,
    getStudentResultsByExamController
  };