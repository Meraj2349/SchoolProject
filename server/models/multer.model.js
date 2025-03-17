import db from "../config/db.config.js";

const File = {
  // Save file metadata to the database
  saveFile: async (filename, originalname, mimetype, size) => {
    const [result] = await db.query(
      'INSERT INTO files (filename, originalname, mimetype, size) VALUES (?, ?, ?, ?)',
      [filename, originalname, mimetype, size]
    );
    return result.insertId;
  },

  // Get all files from the database
  getAllFiles: async () => {
    const [rows] = await db.query('SELECT * FROM files');
    return rows;
  },

  // Get a file by ID
  getFileById: async (id) => {
    const [rows] = await db.query('SELECT * FROM files WHERE id = ?', [id]);
    return rows[0];
  },

  // Delete a file by ID
  deleteFile: async (id) => {
    const [result] = await db.query('DELETE FROM files WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

export default File;