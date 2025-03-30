import {
    getAllClasses,
    addClass,
    deleteClass,
    updateClass,
    searchClasses,
    getClassById,
    getStudentsByClass,
  } from "../models/classes.model.js";
  
  // Get all classes
  const getAllClassesController = async (req, res) => {
    try {
      const classes = await getAllClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Add a new class
  const addClassController = async (req, res) => {
    try {
      const result = await addClass(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Delete a class by ID
  const deleteClassController = async (req, res) => {
    try {
      const classID = req.params.id;
      const result = await deleteClass(classID);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update a class by ID
  const updateClassController = async (req, res) => {
    try {
      const classID = req.params.id;
      const result = await updateClass(classID, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Search classes by filters
  const searchClassesController = async (req, res) => {
    try {
      const filters = req.query; // Get filters from query parameters
      const classes = await searchClasses(filters);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get a class by ID
  const getClassByIdController = async (req, res) => {
    try {
      const classID = req.params.id;
      const result = await getClassById(classID);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get students by class ID
  const getStudentsByClassController = async (req, res) => {
    try {
      const classID = req.params.classID;
      const students = await getStudentsByClass(classID);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export {
    getAllClassesController,
    addClassController,
    deleteClassController,
    updateClassController,
    searchClassesController,
    getClassByIdController,
    getStudentsByClassController,
  };