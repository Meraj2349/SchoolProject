import db from "../config/db.config.js";

// Add a new message
export const addMessage = async ({ messages, show }) => {
    const sql = `
      INSERT INTO Messages (Messages,\`Show\`)
      VALUES (?, ?)
    `;
    try {
      console.log("Inserting into database:", { messages, show }); // Debugging log
      const [result] = await db.query(sql, [messages, show]);
      return { MessageID: result.insertId };
    } catch (error) {
      console.error("Error adding message to database:", error); // Log the error
      throw error;
    }
  };

// Delete a message by ID
export const deleteMessage = async (messageId) => {
  const sql = `
    DELETE FROM Messages WHERE MessageID = ?
  `;
  try {
    const [result] = await db.query(sql, [messageId]);
    if (result.affectedRows === 0) {
      throw new Error("No message found with that ID");
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Get all messages
export const getMessages = async () => {
  const sql = `
    SELECT * FROM Messages
  `;
  try {
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Edit a message by ID
export const editMessage = async (messageId, { messages, show }) => {
    const sql = `
      UPDATE Messages
      SET Messages = ?, \`Show\` = ?
      WHERE MessageID = ?
    `;
    try {
      console.log("Updating message in database:", { messageId, messages, show }); // Debugging log
      const [result] = await db.query(sql, [messages, show, messageId]);
      if (result.affectedRows === 0) {
        throw new Error("No message found with that ID");
      }
      return { success: true };
    } catch (error) {
      console.error("Error updating message in database:", error); // Log the error
      throw error;
    }
  };

// Toggle the show/hide status of a message by ID
export const toggleMessageVisibility = async (messageId, show) => {
    const sql = `
      UPDATE Messages
      SET \`Show\` = ?
      WHERE MessageID = ?
    `;
    try {
      console.log("Toggling visibility in database:", { messageId, show }); // Debugging log
      const [result] = await db.query(sql, [show, messageId]);
      if (result.affectedRows === 0) {
        throw new Error("No message found with that ID");
      }
      return { success: true };
    } catch (error) {
      console.error("Error toggling visibility in database:", error); // Log the error
      throw error;
    }
  }; 