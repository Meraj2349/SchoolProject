import db from "../config/db.config.js";

export const createImage = async (imageData) => {
  const [result] = await db.execute(
    `INSERT INTO Images (ImagePath, PublicID, Description, ImageType) 
     VALUES (?, ?, ?, ?)`,
    [imageData.ImagePath, imageData.PublicID, imageData.Description, imageData.ImageType]
  );
  return getImageById(result.insertId);
};

export const getImageById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM Images WHERE ImageID = ?',
    [id]
  );
  return rows[0];
};

export const updateImage = async (id, updateData) => {
  const { Description, ImageType } = updateData;
  await db.execute(
    'UPDATE Images SET Description = ?, ImageType = ? WHERE ImageID = ?',
    [Description, ImageType, id]
  );
  return getImageById(id);
};

export const deleteImage = async (id) => {
  const [result] = await db.execute(
    'DELETE FROM Images WHERE ImageID = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const getImagesByType = async (type) => {
  if (type === 'all') {
    const [rows] = await db.execute('SELECT * FROM Images ORDER BY ImageID DESC');
    return rows;
  }
  
  const [rows] = await db.execute(
    'SELECT * FROM Images WHERE ImageType = ? ORDER BY ImageID DESC',
    [type]
  );
  return rows;
};

export const getImageByPublicId = async (publicId) => {
  const [rows] = await db.execute(
    'SELECT * FROM Images WHERE PublicID = ?',
    [publicId]
  );
  return rows[0];
};