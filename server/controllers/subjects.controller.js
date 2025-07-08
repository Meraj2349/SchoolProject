import { addSubject, deleteSubject, editSubject, getAllClasses, getSubjects } from "../models/subjects.model.js";

// Add a new subject
export const addSubjectController = async (req, res) => {
  const { subjectName, className } = req.body;

  if (!subjectName || !className) {
    return res.status(400).json({ error: "Subject name and class name are required." });
  }

  try {
    console.log("Request body:", req.body); // Debugging log
    const result = await addSubject({ subjectName, className });
    res.status(201).json({ message: "Subject added successfully.", SubjectID: result.SubjectID });
  } catch (error) {
    console.error("Error adding subject:", error); // Log the error
    res.status(500).json({ error: "Failed to add subject." });
  }
};
// Delete a subject by ID
export const deleteSubjectController = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteSubject(id);
    res.status(200).json({ message: "Subject deleted successfully.", success: result.success });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: "Failed to delete subject." });
  }
};

// Get all subjects
export const getSubjectsController = async (req, res) => {
  try {
    const subjects = await getSubjects();
    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects." });
  }
};

// Edit a subject by ID
export const editSubjectController = async (req, res) => {
    const { id } = req.params;
    const { subjectName, className } = req.body;
  
    if (!subjectName || !className) {
      return res.status(400).json({ error: "Subject name and class name are required." });
    }
  
    try {
      console.log("Request body:", req.body); // Debugging log
      const result = await editSubject(id, { subjectName, className });
      res.status(200).json({ message: "Subject updated successfully.", success: result.success });
    } catch (error) {
      console.error("Error updating subject:", error); // Log the error
      res.status(500).json({ error: "Failed to update subject." });
    }
  };

// Get all classes
export const getAllClassesController = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes." });
  }
};