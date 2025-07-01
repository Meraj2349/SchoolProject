import {
  addClass,
  deleteClass,
  getClasses,
  editClass,
  getTotalStudentsInClassByName,
} from "../models/classes.model.js";

// Add a new class
export const addClassController = async (req, res) => {
  const { className, section, teacherId } = req.body;

  if (!className || !section || !teacherId) {
    return res
      .status(400)
      .json({ error: "Class name, section, and teacher ID are required." });
  }

  try {
    const result = await addClass({ className, section, teacherId });
    res
      .status(201)
      .json({ message: "Class added successfully.", ClassID: result.ClassID });
  } catch (error) {
    console.error("Error adding class:", error);
    res.status(500).json({ error: "Failed to add class." });
  }
};

// Delete a class by ID
export const deleteClassController = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteClass(id);
    res
      .status(200)
      .json({
        message: "Class deleted successfully.",
        success: result.success,
      });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ error: "Failed to delete class." });
  }
};

// Get all classes
export const getClassesController = async (req, res) => {
  try {
    const classes = await getClasses();
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes." });
  }
};

// Edit a class by ID
export const editClassController = async (req, res) => {
  const { id } = req.params;
  const { className, section, teacherId } = req.body;

  if (!className || !section || !teacherId) {
    return res
      .status(400)
      .json({ error: "Class name, section, and teacher ID are required." });
  }

  try {
    const result = await editClass(id, { className, section, teacherId });
    res
      .status(200)
      .json({
        message: "Class updated successfully.",
        success: result.success,
      });
  } catch (error) {
    console.error("Error editing class:", error);
    res.status(500).json({ error: "Failed to update class." });
  }
};


// Get total students in a class by class name
export const getTotalStudentsInClassByNameController = async (req, res) => {
  const { className } = req.params;

  if (!className) {
    return res.status(400).json({ error: "Class name is required." });
  }

  try {
    const count = await getTotalStudentsInClassByName(className);
    res.status(200).json({
      message: `Total students in class ${className} retrieved successfully.`,
      count,
    });
  } catch (error) {
    console.error("Error fetching student count:", error);
    res.status(500).json({ error: "Failed to fetch student count." });
  }
} 
