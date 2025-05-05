import db from "../config/db.config.js";

// Add a new notice
export const addNotice = async ({ title, description, show }) => {
  const sql = `
    INSERT INTO Notices (Title, Description, \`Show\`)
    VALUES (?, ?, ?)
  `;
  try {
    const [result] = await db.query(sql, [title, description, show]);
    return { NoticeID: result.insertId };
  } catch (error) {
    console.error("Error adding notice:", error);
    throw error;
  }
};

// Delete a notice by ID
export const deleteNotice = async (noticeId) => {
  const sql = `
    DELETE FROM Notices WHERE NoticeID = ?
  `;
  try {
    const [result] = await db.query(sql, [noticeId]);
    if (result.affectedRows === 0) {
      throw new Error("No notice found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
};

// Get all notices
export const getNotices = async () => {
  const sql = `
    SELECT * FROM Notices
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};

// Show a specific notice by ID (set `Show` to true)
export const showNotice = async (noticeId) => {
  const sql = `
    UPDATE Notices
    SET \`Show\` = true
    WHERE NoticeID = ?
  `;
  try {
    console.log("Making notice visible in database:", { noticeId }); // Debugging log
    const [result] = await db.query(sql, [noticeId]);
    if (result.affectedRows === 0) {
      throw new Error("No notice found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error making notice visible in database:", error); // Log the error
    throw error;
  }
};

export const editNotice = async (noticeId, { title, description }) => {
    const sql = `
      UPDATE Notices
      SET Title = ?, Description = ?
      WHERE NoticeID = ?
    `;
    try {
      const [result] = await db.query(sql, [title, description, noticeId]);
      if (result.affectedRows === 0) {
        return { success: false }; // No rows updated
      }
      return { success: true };
    } catch (error) {
      console.error("Error editing notice:", error);
      throw error;
    }
  };

  export const toggleNoticeVisibility = async (noticeId, show) => {
    const sql = `
      UPDATE Notices
      SET \`Show\` = ?
      WHERE NoticeID = ?
    `;
    try {
      console.log("Toggling visibility in database:", { noticeId, show }); // Debugging log
      const [result] = await db.query(sql, [show, noticeId]);
      if (result.affectedRows === 0) {
        throw new Error("No notice found with that ID");
      }
      return { success: true };
    } catch (error) {
      console.error("Error toggling visibility in database:", error); // Log the error
      throw error;
    }
  };