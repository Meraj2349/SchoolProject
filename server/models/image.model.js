import db from "../config/db.config.js";

export const createImage = async (imageData) => {
  const [result] = await db.execute(
    `INSERT INTO Images (ImagePath, PublicID, Description, ImageType, StudentID, TeacherID, AssociatedID) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      imageData.ImagePath,
      imageData.PublicID,
      // db.execute rejects undefined parameters; an omitted description is NULL
      imageData.Description ?? null,
      imageData.ImageType,
      imageData.StudentID || null,
      imageData.TeacherID || null,
      imageData.AssociatedID || null,
    ],
  );
  return getImageById(result.insertId);
};

export const getImageById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM Images WHERE ImageID = ?", [
    id,
  ]);
  return rows[0];
};

// Metadata columns a client may change; fields left undefined keep their value.
const METADATA_COLUMNS = ["Description", "ImageType", "StudentID", "TeacherID", "AssociatedID"];

export const updateImage = async (id, updateData) => {
  const columns = METADATA_COLUMNS.filter((column) => updateData[column] !== undefined);
  if (columns.length > 0) {
    await db.execute(
      `UPDATE Images SET ${columns.map((c) => `${c} = ?`).join(", ")} WHERE ImageID = ?`,
      [...columns.map((c) => (updateData[c] === "" ? null : updateData[c])), id],
    );
  }
  return getImageById(id);
};

// Points the record at a newly uploaded file.
export const updateImageFile = async (id, { ImagePath, PublicID }) => {
  await db.execute("UPDATE Images SET ImagePath = ?, PublicID = ? WHERE ImageID = ?", [
    ImagePath,
    PublicID,
    id,
  ]);
  return getImageById(id);
};

export const deleteImage = async (id) => {
  const [result] = await db.execute("DELETE FROM Images WHERE ImageID = ?", [
    id,
  ]);
  return result.affectedRows > 0;
};

export const getImagesByType = async (type) => {
  if (type === "all") {
    const [rows] = await db.execute(
      "SELECT * FROM Images ORDER BY ImageID DESC",
    );
    return rows;
  }

  const [rows] = await db.execute(
    "SELECT * FROM Images WHERE ImageType = ? ORDER BY ImageID DESC",
    [type],
  );
  return rows;
};

export const getImageByPublicId = async (publicId) => {
  const [rows] = await db.execute("SELECT * FROM Images WHERE PublicID = ?", [
    publicId,
  ]);
  return rows[0];
};

export const getImagesByStudentId = async (studentId) => {
  const [rows] = await db.execute(
    "SELECT * FROM Images WHERE StudentID = ? ORDER BY UploadDate DESC",
    [studentId],
  );
  return rows;
};

export const getImagesByTeacherId = async (teacherId) => {
  const [rows] = await db.execute(
    "SELECT * FROM Images WHERE TeacherID = ? ORDER BY UploadDate DESC",
    [teacherId],
  );
  return rows;
};

export const getImagesWithDetails = async (type = null) => {
  let query = `
    SELECT 
      i.*,
      s.FirstName as StudentFirstName,
      s.LastName as StudentLastName,
      s.RollNumber,
      t.FirstName as TeacherFirstName,
      t.LastName as TeacherLastName,
      t.Subject
    FROM Images i
    LEFT JOIN Students s ON i.StudentID = s.StudentID
    LEFT JOIN Teachers t ON i.TeacherID = t.TeacherID
  `;

  let params = [];

  if (type && type !== "all") {
    query += " WHERE i.ImageType = ?";
    params.push(type);
  }

  query += " ORDER BY i.UploadDate DESC";

  const [rows] = await db.execute(query, params);
  return rows;
};
