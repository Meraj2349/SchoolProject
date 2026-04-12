import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { t } from "../config/i18n.js";
import {
  getPublishedNoticeAnnouncements,
  getAllNoticeAnnouncements,
  createNoticeAnnouncement,
  updateNoticeAnnouncement,
  toggleNoticeAnnouncementPublish,
  deleteNoticeAnnouncement,
  getNoticeAnnouncementById,
} from "../models/notice-announcement.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_CATEGORIES = ["Admission", "Exam", "Notice", "Event"];

// GET /api/notice-announcements — public, returns published only
export const getPublishedController = async (req, res) => {
  const lang = req.language;
  try {
    const items = await getPublishedNoticeAnnouncements();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching published notice announcements:", error);
    res
      .status(500)
      .json({ error: t("notice_announcement_fetch_failed", lang) });
  }
};

// GET /api/notice-announcements/all — admin, returns all
export const getAllController = async (req, res) => {
  const lang = req.language;
  try {
    const items = await getAllNoticeAnnouncements();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching all notice announcements:", error);
    res
      .status(500)
      .json({ error: t("notice_announcement_fetch_failed", lang) });
  }
};

// POST /api/notice-announcements — admin, multipart/form-data
export const createController = async (req, res) => {
  const lang = req.language;
  const { title_bn, title_en, category, date, is_published } = req.body;

  if (!title_bn || !title_en || !category || !date) {
    // Clean up uploaded file if validation fails
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res
      .status(400)
      .json({ error: t("notice_announcement_required_fields", lang) });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res
      .status(400)
      .json({ error: t("notice_announcement_invalid_category", lang) });
  }

  if (!req.file) {
    return res.status(400).json({ error: t("no_file_uploaded", lang) });
  }

  // Build a URL path relative to the server's static root
  const image_url = `/uploads/notice-announcements/${req.file.filename}`;

  try {
    const result = await createNoticeAnnouncement({
      title_bn,
      title_en,
      image_url,
      category,
      date,
      is_published: is_published === "false" ? false : true,
    });
    res
      .status(201)
      .json({ message: t("notice_announcement_created", lang), id: result.id });
  } catch (error) {
    console.error("Error creating notice announcement:", error);
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    res
      .status(500)
      .json({ error: t("notice_announcement_create_failed", lang) });
  }
};

// PUT /api/notice-announcements/:id — admin, optionally re-upload image
export const updateController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { title_bn, title_en, category, date, is_published } = req.body;

  if (!title_bn || !title_en || !category || !date) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res
      .status(400)
      .json({ error: t("notice_announcement_required_fields", lang) });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res
      .status(400)
      .json({ error: t("notice_announcement_invalid_category", lang) });
  }

  try {
    // Fetch existing record to get current image_url
    const existing = await getNoticeAnnouncementById(id);
    if (!existing) {
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
      return res
        .status(404)
        .json({ error: t("notice_announcement_not_found", lang) });
    }

    let image_url = existing.image_url;

    if (req.file) {
      // New image uploaded — delete old file if stored locally
      const oldFilePath = path.join(__dirname, "../public", existing.image_url);
      fs.unlink(oldFilePath, () => {}); // ignore error if file missing
      image_url = `/uploads/notice-announcements/${req.file.filename}`;
    }

    const result = await updateNoticeAnnouncement(id, {
      title_bn,
      title_en,
      image_url,
      category,
      date,
      is_published:
        is_published === "false" || is_published === false ? false : true,
    });

    if (!result.success) {
      return res
        .status(404)
        .json({ error: t("notice_announcement_not_found", lang) });
    }

    res.status(200).json({ message: t("notice_announcement_updated", lang) });
  } catch (error) {
    console.error("Error updating notice announcement:", error);
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    res
      .status(500)
      .json({ error: t("notice_announcement_update_failed", lang) });
  }
};

// PATCH /api/notice-announcements/:id/publish — admin, toggle is_published
export const togglePublishController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { is_published } = req.body;

  if (typeof is_published !== "boolean") {
    return res
      .status(400)
      .json({ error: t("notice_announcement_invalid_publish", lang) });
  }

  try {
    const result = await toggleNoticeAnnouncementPublish(id, is_published);
    if (!result.success) {
      return res
        .status(404)
        .json({ error: t("notice_announcement_not_found", lang) });
    }
    res
      .status(200)
      .json({ message: t("notice_announcement_publish_toggled", lang) });
  } catch (error) {
    console.error("Error toggling notice announcement publish:", error);
    res
      .status(500)
      .json({ error: t("notice_announcement_update_failed", lang) });
  }
};

// DELETE /api/notice-announcements/:id — admin
export const removeController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;

  try {
    const result = await deleteNoticeAnnouncement(id);

    // Delete the image file from disk if it's a local path
    if (result.image_url && result.image_url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../public", result.image_url);
      fs.unlink(filePath, () => {}); // ignore error if already missing
    }

    res.status(200).json({
      message: t("notice_announcement_deleted", lang),
      success: result.success,
    });
  } catch (error) {
    console.error("Error deleting notice announcement:", error);
    res
      .status(500)
      .json({ error: t("notice_announcement_delete_failed", lang) });
  }
};
