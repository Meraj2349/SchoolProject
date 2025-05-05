import {
  addMessage,
  deleteMessage,
  getMessages,
  editMessage,
  toggleMessageVisibility,
} from "../models/messages.model.js";

// Add a new message
export const addMessageController = async (req, res) => {
  const { messages, show } = req.body;

  if (!messages) {
    return res.status(400).json({ error: "Message content is required." });
  }

  try {
    const result = await addMessage({ messages, show: show || false });
    res.status(201).json({ message: "Message added successfully.", MessageID: result.MessageID });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message." });
  }
};

// Delete a message by ID
export const deleteMessageController = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteMessage(id);
    res.status(200).json({ message: "Message deleted successfully.", success: result.success });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message." });
  }
};

// Get all messages
export const getMessagesController = async (req, res) => {
  try {
    const messages = await getMessages();
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

// Edit a message by ID

export const editMessageController = async (req, res) => {
  const { id } = req.params;
  const { messages, show } = req.body;

  if (!messages || typeof show === "undefined") {
    return res.status(400).json({ error: "Message content and visibility are required." });
  }

  try {
    console.log("Request body:", req.body); // Debugging log
    const result = await editMessage(id, { messages, show });
    res.status(200).json({ message: "Message updated successfully.", success: result.success });
  } catch (error) {
    console.error("Error updating message:", error); // Log the error
    res.status(500).json({ error: "Failed to update message." });
  }
};

// Toggle the show/hide status of a message
export const toggleMessageVisibilityController = async (req, res) => {
    const { id } = req.params;
    const { show } = req.body;
  
    if (typeof show !== "boolean") {
      return res.status(400).json({ error: "Invalid value for 'show'. It must be a boolean." });
    }
  
    try {
      console.log("Toggling visibility for message ID:", id, "to:", show); // Debugging log
      const result = await toggleMessageVisibility(id, show);
      res.status(200).json({ message: "Message visibility updated successfully.", success: result.success });
    } catch (error) {
      console.error("Error toggling message visibility:", error); // Log the error
      res.status(500).json({ error: "Failed to update message visibility." });
    }
  };