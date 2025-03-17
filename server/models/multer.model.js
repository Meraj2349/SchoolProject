import db from "../config/db.config.js";

const File = {
  // Save file metadata to the database
  saveFile: async (title, filename, originalname, mimetype, size) => {
    try {
      const [result] = await db.query(
        'INSERT INTO files (title, filename, originalname, mimetype, size) VALUES (?, ?, ?, ?, ?)',
        [title, filename, originalname, mimetype, size]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error saving file metadata: ${error.message}`);
    }
  },

  // Get all files from the database
  getAllFiles: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM files ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw new Error(`Error fetching files: ${error.message}`);
    }
  },

  // Get a file by ID
  getFileById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM files WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching file by ID: ${error.message}`);
    }
  },

  // Delete a file by ID
  deleteFile: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM files WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  },
};

export default File;