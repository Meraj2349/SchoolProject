import {
  addNotice,
  deleteNotice,
  getNotices,
  showNotice,
  editNotice,
  toggleNoticeVisibility,
} from "../models/notices.model.js";

// Add a new notice
export const addNoticeController = async (req, res) => {
  const { title, description, show } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  try {
    const result = await addNotice({ title, description, show: show || false });
    res.status(201).json({ message: "Notice added successfully.", NoticeID: result.NoticeID });
  } catch (error) {
    console.error("Error adding notice:", error);
    res.status(500).json({ error: "Failed to add notice." });
  }
};

// Delete a notice by ID
export const deleteNoticeController = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteNotice(id);
    res.status(200).json({ message: "Notice deleted successfully.", success: result.success });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ error: "Failed to delete notice." });
  }
};

// Get all notices
export const getNoticesController = async (req, res) => {
  try {
    const notices = await getNotices();
    res.status(200).json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Failed to fetch notices." });
  }
};

// Show a specific notice by ID
export const showNoticeController = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Making notice visible for ID:", id); // Debugging log
    const result = await showNotice(id);
    res.status(200).json({ message: "Notice is now visible.", success: result.success });
  } catch (error) {
    console.error("Error showing notice:", error); // Log the error
    res.status(500).json({ error: "Failed to show notice." });
  }
};

export const editNoticeController = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  try {
    const result = await editNotice(id, { title, description });
    if (!result.success) {
      return res.status(404).json({ error: "Notice not found." });
    }
    res.status(200).json({ message: "Notice updated successfully." });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ error: "Failed to update notice." });
  }
};

export const toggleNoticeVisibilityController = async (req, res) => {
  const { id } = req.params;
  const { show } = req.body;

  if (typeof show !== "boolean") {
    return res.status(400).json({ error: "Invalid value for 'show'. It must be a boolean." });
  }

  try {
    console.log("Toggling visibility for notice ID:", id, "to:", show); // Debugging log
    const result = await toggleNoticeVisibility(id, show);
    res.status(200).json({ message: "Notice visibility updated successfully.", success: result.success });
  } catch (error) {
    console.error("Error toggling notice visibility:", error); // Log the error
    res.status(500).json({ error: "Failed to update notice visibility." });
  }
};