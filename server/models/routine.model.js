import db from "../config/db.config.js";

// Create new routine with ClassID (following Classes table structure)
export const createRoutine = async (routineData) => {
  const [result] = await db.execute(
    `INSERT INTO Routines (RoutineTitle, ClassID, RoutineDate, Description, 
     FileURL, FileType, FilePublicID, CreatedBy) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      routineData.RoutineTitle,
      routineData.ClassID,
      routineData.RoutineDate,
      routineData.Description || null,
      routineData.FileURL || null,
      routineData.FileType || 'pdf',
      routineData.FilePublicID || null,
      routineData.CreatedBy || null
    ]
  );
  return getRoutineById(result.insertId);
};

// Get routine by ID with class details (ClassName এবং Section সহ)
export const getRoutineById = async (id) => {
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section, c.TeacherID,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r 
     LEFT JOIN Classes c ON r.ClassID = c.ClassID 
     WHERE r.RoutineID = ? AND r.IsActive = TRUE`,
    [id]
  );
  return rows[0];
};

// Get all routines with class details (ClassName এবং Section সহ)
export const getAllRoutines = async () => {
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section, c.TeacherID,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r 
     LEFT JOIN Classes c ON r.ClassID = c.ClassID 
     WHERE r.IsActive = TRUE 
     ORDER BY r.RoutineDate DESC, r.CreatedAt DESC`
  );
  return rows;
};

// Get routines by class ID (specific ClassID দিয়ে)
export const getRoutinesByClassId = async (classId) => {
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section, c.TeacherID,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r 
     LEFT JOIN Classes c ON r.ClassID = c.ClassID 
     WHERE r.ClassID = ? AND r.IsActive = TRUE 
     ORDER BY r.RoutineDate DESC, r.CreatedAt DESC`,
    [classId]
  );
  return rows;
};

// Get routines by class name and section (filtering এর জন্য)
export const getRoutinesByClassSection = async (className, section) => {
  let query = `SELECT r.*, c.ClassName, c.Section, c.TeacherID,
               CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
               FROM Routines r 
               LEFT JOIN Classes c ON r.ClassID = c.ClassID 
               WHERE r.IsActive = TRUE`;
  let params = [];
  
  if (className && className !== 'all') {
    query += ' AND c.ClassName = ?';
    params.push(className);
  }
  
  if (section && section !== 'all') {
    query += ' AND c.Section = ?';
    params.push(section);
  }
  
  query += ' ORDER BY r.RoutineDate DESC, r.CreatedAt DESC';
  
  const [rows] = await db.execute(query, params);
  return rows;
};

// Update routine (ClassID দিয়ে update করা হবে)
export const updateRoutine = async (id, updateData) => {
  const fields = [];
  const values = [];
  
  // Build dynamic update query (following Classes table naming convention)
  if (updateData.RoutineTitle) {
    fields.push('RoutineTitle = ?');
    values.push(updateData.RoutineTitle);
  }
  if (updateData.ClassID) {
    fields.push('ClassID = ?');
    values.push(updateData.ClassID);
  }
  if (updateData.RoutineDate) {
    fields.push('RoutineDate = ?');
    values.push(updateData.RoutineDate);
  }
  if (updateData.Description !== undefined) {
    fields.push('Description = ?');
    values.push(updateData.Description);
  }
  if (updateData.FileURL !== undefined) {
    fields.push('FileURL = ?');
    values.push(updateData.FileURL);
  }
  if (updateData.FileType) {
    fields.push('FileType = ?');
    values.push(updateData.FileType);
  }
  if (updateData.FilePublicID !== undefined) {
    fields.push('FilePublicID = ?');
    values.push(updateData.FilePublicID);
  }
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(id);
  
  await db.execute(
    `UPDATE Routines SET ${fields.join(', ')}, UpdatedAt = CURRENT_TIMESTAMP WHERE RoutineID = ?`,
    values
  );
  
  return getRoutineById(id);
};

// Delete routine (soft delete)
export const deleteRoutine = async (id) => {
  const [result] = await db.execute(
    'UPDATE Routines SET IsActive = FALSE WHERE RoutineID = ?',
    [id]
  );
  return result.affectedRows > 0;
};

// Search routines with class info
export const searchRoutines = async (searchTerm) => {
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section, c.TeacherID,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r 
     LEFT JOIN Classes c ON r.ClassID = c.ClassID 
     WHERE (r.RoutineTitle LIKE ? OR c.ClassName LIKE ? OR c.Section LIKE ? OR r.Description LIKE ?) 
     AND r.IsActive = TRUE 
     ORDER BY r.RoutineDate DESC`,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
  );
  return rows;
};

// ========== Helper Functions for Classes (following Classes table structure) ==========

// Get all available classes for dropdown (ClassID, ClassName, Section)
export const getAllClasses = async () => {
  const [rows] = await db.execute(
    `SELECT ClassID, ClassName, Section, 
     CONCAT(ClassName, ' - Section ', Section) as ClassSectionName,
     TeacherID
     FROM Classes 
     ORDER BY ClassName, Section`
  );
  return rows;
};

// Get distinct class names for filter dropdown
export const getDistinctClasses = async () => {
  const [rows] = await db.execute(
    'SELECT DISTINCT c.ClassName FROM Classes c ORDER BY c.ClassName'
  );
  return rows.map(row => row.ClassName);
};

// Get distinct sections for filter dropdown  
export const getDistinctSections = async () => {
  const [rows] = await db.execute(
    'SELECT DISTINCT c.Section FROM Classes c ORDER BY c.Section'
  );
  return rows.map(row => row.Section);
};

// Get sections by class name (dynamic section loading)
export const getSectionsByClassName = async (className) => {
  const [rows] = await db.execute(
    'SELECT ClassID, Section FROM Classes WHERE ClassName = ? ORDER BY Section',
    [className]
  );
  return rows;
};

// Validate if class exists (before creating/updating routine)
export const validateClassId = async (classId) => {
  const [rows] = await db.execute(
    'SELECT ClassID, ClassName, Section FROM Classes WHERE ClassID = ?',
    [classId]
  );
  return rows[0];
};