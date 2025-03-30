import {
    getAllExams,
    addExam,
    updateExam,
    deleteExam,
    getExamById,
    searchExams,
    getExamsByClass,
    getUpcomingExams
  } from "../models/exams.model.js";
  
  // Get all exams
  const getAllExamsController = async (req, res) => {
    try {
      const exams = await getAllExams();
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Add a new exam
  const addExamController = async (req, res) => {
    try {
      const result = await addExam(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Delete an exam by ID
  const deleteExamController = async (req, res) => {
    try {
      const examID = req.params.id;
      const result = await deleteExam(examID);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update an exam by ID
  const updateExamController = async (req, res) => {
    try {
      const examID = req.params.id;
      const result = await updateExam(examID, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Search exams by filters
  const searchExamsController = async (req, res) => {
    try {
      const filters = req.query; // Get filters from query parameters
      const exams = await searchExams(filters);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get an exam by ID
  const getExamByIdController = async (req, res) => {
    try {
      const examID = req.params.id;
      const result = await getExamById(examID);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get exams by class ID
  const getExamsByClassController = async (req, res) => {
    try {
      const classID = req.params.classID;
      const exams = await getExamsByClass(classID);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get upcoming exams
  const getUpcomingExamsController = async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;
      const exams = await getUpcomingExams(days);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export {
    getAllExamsController,
    addExamController,
    deleteExamController,
    updateExamController,
    searchExamsController,
    getExamByIdController,
    getExamsByClassController,
    getUpcomingExamsController
  };