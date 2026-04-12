import { t } from "../config/i18n.js";
import {
  getActiveNews,
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
} from "../models/news.model.js";

// GET /api/news — returns active news ordered by date DESC (public)
export const getActiveNewsController = async (req, res) => {
  const lang = req.language;
  try {
    const news = await getActiveNews();
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: t("news_fetch_failed", lang) });
  }
};

// GET /api/news/all — returns all news including inactive (admin)
export const getAllNewsController = async (req, res) => {
  const lang = req.language;
  try {
    const news = await getAllNews();
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching all news:", error);
    res.status(500).json({ error: t("news_fetch_failed", lang) });
  }
};

// POST /api/news — create a news item
export const createNewsController = async (req, res) => {
  const lang = req.language;
  const { title_bn, title_en, date, link, is_active } = req.body;

  if (!title_bn || !title_en || !date) {
    return res
      .status(400)
      .json({ error: t("news_required_fields", lang) });
  }

  try {
    const result = await createNews({ title_bn, title_en, date, link, is_active });
    res
      .status(201)
      .json({ message: t("news_created", lang), id: result.id });
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ error: t("news_create_failed", lang) });
  }
};

// PUT /api/news/:id — update a news item
export const updateNewsController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { title_bn, title_en, date, link, is_active } = req.body;

  if (!title_bn || !title_en || !date) {
    return res
      .status(400)
      .json({ error: t("news_required_fields", lang) });
  }

  try {
    const result = await updateNews(id, { title_bn, title_en, date, link, is_active });
    if (!result.success) {
      return res.status(404).json({ error: t("news_not_found", lang) });
    }
    res.status(200).json({ message: t("news_updated", lang) });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ error: t("news_update_failed", lang) });
  }
};

// DELETE /api/news/:id — delete a news item
export const deleteNewsController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;

  try {
    const result = await deleteNews(id);
    res
      .status(200)
      .json({ message: t("news_deleted", lang), success: result.success });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ error: t("news_delete_failed", lang) });
  }
};
