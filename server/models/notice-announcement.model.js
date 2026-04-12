import db from "../config/db.config.js";

// Get published notice announcements ordered by date DESC (public)
export const getPublishedNoticeAnnouncements = async () => {
  const sql = `
    SELECT id, title_bn, title_en, image_url, category, date, is_published, created_at, updated_at
    FROM NoticeAnnouncements
    WHERE is_published = TRUE
    ORDER BY date DESC
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching published notice announcements:", error);
    throw error;
  }
};

// Get all notice announcements (including unpublished) for admin
export const getAllNoticeAnnouncements = async () => {
  const sql = `
    SELECT id, title_bn, title_en, image_url, category, date, is_published, created_at, updated_at
    FROM NoticeAnnouncements
    ORDER BY date DESC
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching all notice announcements:", error);
    throw error;
  }
};

// Create a new notice announcement
export const createNoticeAnnouncement = async ({
  title_bn,
  title_en,
  image_url,
  category,
  date,
  is_published,
}) => {
  const sql = `
    INSERT INTO NoticeAnnouncements (title_bn, title_en, image_url, category, date, is_published)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  try {
    const [result] = await db.query(sql, [
      title_bn,
      title_en,
      image_url,
      category,
      date,
      is_published !== undefined ? is_published : true,
    ]);
    return { id: result.insertId };
  } catch (error) {
    console.error("Error creating notice announcement:", error);
    throw error;
  }
};

// Update a notice announcement by ID
export const updateNoticeAnnouncement = async (
  id,
  { title_bn, title_en, image_url, category, date, is_published },
) => {
  const sql = `
    UPDATE NoticeAnnouncements
    SET title_bn = ?, title_en = ?, image_url = ?, category = ?, date = ?, is_published = ?
    WHERE id = ?
  `;
  try {
    const [result] = await db.query(sql, [
      title_bn,
      title_en,
      image_url,
      category,
      date,
      is_published !== undefined ? is_published : true,
      id,
    ]);
    if (result.affectedRows === 0) {
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating notice announcement:", error);
    throw error;
  }
};

// Toggle is_published for a notice announcement
export const toggleNoticeAnnouncementPublish = async (id, is_published) => {
  const sql = `
    UPDATE NoticeAnnouncements
    SET is_published = ?
    WHERE id = ?
  `;
  try {
    const [result] = await db.query(sql, [is_published, id]);
    if (result.affectedRows === 0) {
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error("Error toggling notice announcement publish status:", error);
    throw error;
  }
};

// Delete a notice announcement by ID and return image_url for cleanup
export const deleteNoticeAnnouncement = async (id) => {
  // First fetch image_url so caller can clean up the file
  const selectSql = `SELECT image_url FROM NoticeAnnouncements WHERE id = ?`;
  const deleteSql = `DELETE FROM NoticeAnnouncements WHERE id = ?`;
  try {
    const [rows] = await db.query(selectSql, [id]);
    if (rows.length === 0) {
      throw new Error("No notice announcement found with that ID");
    }
    const image_url = rows[0].image_url;
    const [result] = await db.query(deleteSql, [id]);
    if (result.affectedRows === 0) {
      throw new Error("No notice announcement found with that ID");
    }
    return { success: true, image_url };
  } catch (error) {
    console.error("Error deleting notice announcement:", error);
    throw error;
  }
};

// Get a single notice announcement by ID
export const getNoticeAnnouncementById = async (id) => {
  const sql = `SELECT * FROM NoticeAnnouncements WHERE id = ?`;
  try {
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching notice announcement by ID:", error);
    throw error;
  }
};
