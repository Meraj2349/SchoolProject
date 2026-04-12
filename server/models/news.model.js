import db from "../config/db.config.js";

// Get all active news ordered by date DESC
export const getActiveNews = async () => {
  const sql = `
    SELECT id, title_bn, title_en, date, link, is_active, created_at, updated_at
    FROM News
    WHERE is_active = TRUE
    ORDER BY date DESC
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

// Get all news (including inactive) for admin
export const getAllNews = async () => {
  const sql = `
    SELECT id, title_bn, title_en, date, link, is_active, created_at, updated_at
    FROM News
    ORDER BY date DESC
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching all news:", error);
    throw error;
  }
};

// Create a new news item
export const createNews = async ({ title_bn, title_en, date, link, is_active }) => {
  const sql = `
    INSERT INTO News (title_bn, title_en, date, link, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;
  try {
    const [result] = await db.query(sql, [
      title_bn,
      title_en,
      date,
      link || "/events",
      is_active !== undefined ? is_active : true,
    ]);
    return { id: result.insertId };
  } catch (error) {
    console.error("Error creating news:", error);
    throw error;
  }
};

// Update a news item by ID
export const updateNews = async (id, { title_bn, title_en, date, link, is_active }) => {
  const sql = `
    UPDATE News
    SET title_bn = ?, title_en = ?, date = ?, link = ?, is_active = ?
    WHERE id = ?
  `;
  try {
    const [result] = await db.query(sql, [
      title_bn,
      title_en,
      date,
      link || "/events",
      is_active !== undefined ? is_active : true,
      id,
    ]);
    if (result.affectedRows === 0) {
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
};

// Delete a news item by ID
export const deleteNews = async (id) => {
  const sql = `DELETE FROM News WHERE id = ?`;
  try {
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      throw new Error("No news item found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
};
