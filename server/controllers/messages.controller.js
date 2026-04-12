import { t } from "../config/i18n.js";
import {
  addMessage,
  deleteMessage,
  getMessages,
  editMessage,
  toggleMessageVisibility,
} from "../models/messages.model.js";

// Add a new message
export const addMessageController = async (req, res) => {
  const lang = req.language;
  const { messages, show } = req.body;

  if (!messages) {
    return res.status(400).json({ error: t("message_content_required", lang) });
  }

  try {
    const result = await addMessage({ messages, show: show || false });
    res
      .status(201)
      .json({ message: t("message_added", lang), MessageID: result.MessageID });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: t("message_add_failed", lang) });
  }
};

// Delete a message by ID
export const deleteMessageController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;

  try {
    const result = await deleteMessage(id);
    res
      .status(200)
      .json({ message: t("message_deleted", lang), success: result.success });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: t("message_delete_failed", lang) });
  }
};

// Get all messages
export const getMessagesController = async (req, res) => {
  const lang = req.language;
  try {
    const messages = await getMessages();
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: t("message_fetch_failed", lang) });
  }
};

// Edit a message by ID
export const editMessageController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { messages, show } = req.body;

  if (!messages || typeof show === "undefined") {
    return res
      .status(400)
      .json({ error: t("message_content_visibility_required", lang) });
  }

  try {
    const result = await editMessage(id, { messages, show });
    res
      .status(200)
      .json({ message: t("message_updated", lang), success: result.success });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: t("message_update_failed", lang) });
  }
};

// Toggle the show/hide status of a message
export const toggleMessageVisibilityController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { show } = req.body;

  if (typeof show !== "boolean") {
    return res.status(400).json({ error: t("invalid_show_value", lang) });
  }

  try {
    const result = await toggleMessageVisibility(id, show);
    res
      .status(200)
      .json({
        message: t("message_visibility_updated", lang),
        success: result.success,
      });
  } catch (error) {
    console.error("Error toggling message visibility:", error);
    res
      .status(500)
      .json({ error: t("message_visibility_update_failed", lang) });
  }
};
