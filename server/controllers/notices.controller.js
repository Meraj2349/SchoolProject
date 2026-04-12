import { t } from "../config/i18n.js";
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
  const lang = req.language;
  const { title, description, show } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: t("notice_title_desc_required", lang) });
  }

  try {
    const result = await addNotice({ title, description, show: show || false });
    res
      .status(201)
      .json({ message: t("notice_added", lang), NoticeID: result.NoticeID });
  } catch (error) {
    console.error("Error adding notice:", error);
    res.status(500).json({ error: t("notice_add_failed", lang) });
  }
};

// Delete a notice by ID
export const deleteNoticeController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;

  try {
    const result = await deleteNotice(id);
    res
      .status(200)
      .json({ message: t("notice_deleted", lang), success: result.success });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ error: t("notice_delete_failed", lang) });
  }
};

// Get all notices
export const getNoticesController = async (req, res) => {
  const lang = req.language;
  try {
    const notices = await getNotices();
    res.status(200).json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: t("notice_fetch_failed", lang) });
  }
};

// Show a specific notice by ID
export const showNoticeController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;

  try {
    const result = await showNotice(id);
    res
      .status(200)
      .json({ message: t("notice_visible", lang), success: result.success });
  } catch (error) {
    console.error("Error showing notice:", error);
    res.status(500).json({ error: t("notice_update_failed", lang) });
  }
};

export const editNoticeController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: t("notice_title_desc_required", lang) });
  }

  try {
    const result = await editNotice(id, { title, description });
    if (!result.success) {
      return res.status(404).json({ error: t("notice_not_found", lang) });
    }
    res.status(200).json({ message: t("notice_updated", lang) });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ error: t("notice_update_failed", lang) });
  }
};

export const toggleNoticeVisibilityController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { show } = req.body;

  if (typeof show !== "boolean") {
    return res.status(400).json({ error: t("invalid_show_value", lang) });
  }

  try {
    const result = await toggleNoticeVisibility(id, show);
    res
      .status(200)
      .json({
        message: t("notice_visibility_updated", lang),
        success: result.success,
      });
  } catch (error) {
    console.error("Error toggling notice visibility:", error);
    res.status(500).json({ error: t("notice_visibility_update_failed", lang) });
  }
};
