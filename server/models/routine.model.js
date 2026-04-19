import db from "../config/db.config.js";
import { branchFilter } from "../utils/branchFilter.js";

// Classes are GLOBAL (no branch_id). Teacher assignment lives in
// ClassTeacherAssignments keyed by (ClassID, branch_id). Routines stay
// branch-scoped via Routines.branch_id.

// Create new routine with ClassID (following Classes table structure)
export const createRoutine = async (routineData, branchId = null) => {
  let sql, values;
  if (branchId != null) {
    sql = `INSERT INTO Routines (RoutineTitle, ClassID, RoutineDate, Description,
     FileURL, FileType, FilePublicID, CreatedBy, branch_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    values = [
      routineData.RoutineTitle,
      routineData.ClassID,
      routineData.RoutineDate,
      routineData.Description || null,
      routineData.FileURL || null,
      routineData.FileType || "pdf",
      routineData.FilePublicID || null,
      routineData.CreatedBy || null,
      branchId,
    ];
  } else {
    sql = `INSERT INTO Routines (RoutineTitle, ClassID, RoutineDate, Description,
     FileURL, FileType, FilePublicID, CreatedBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    values = [
      routineData.RoutineTitle,
      routineData.ClassID,
      routineData.RoutineDate,
      routineData.Description || null,
      routineData.FileURL || null,
      routineData.FileType || "pdf",
      routineData.FilePublicID || null,
      routineData.CreatedBy || null,
    ];
  }
  const [result] = await db.execute(sql, values);
  return getRoutineById(result.insertId);
};

// Get routine by ID with class details
export const getRoutineById = async (id) => {
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r
     LEFT JOIN Classes c ON r.ClassID = c.ClassID
     WHERE r.RoutineID = ? AND r.IsActive = TRUE`,
    [id],
  );
  return rows[0];
};

// Get all routines with class details (branch-scoped)
export const getAllRoutines = async (branchId = null) => {
  const { clause, params } = branchFilter(branchId, "r");
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r
     LEFT JOIN Classes c ON r.ClassID = c.ClassID
     WHERE r.IsActive = TRUE ${clause}
     ORDER BY r.RoutineDate DESC, r.CreatedAt DESC`,
    params,
  );
  return rows;
};

// Get routines by class ID (branch-scoped)
export const getRoutinesByClassId = async (classId, branchId = null) => {
  const { clause, params } = branchFilter(branchId, "r");
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r
     LEFT JOIN Classes c ON r.ClassID = c.ClassID
     WHERE r.ClassID = ? AND r.IsActive = TRUE ${clause}
     ORDER BY r.RoutineDate DESC, r.CreatedAt DESC`,
    [classId, ...params],
  );
  return rows;
};

// Get routines by class name and section (branch-scoped)
export const getRoutinesByClassSection = async (className, section, branchId = null) => {
  const { clause: branchClause, params: branchParams } = branchFilter(branchId, "r");
  let query = `SELECT r.*, c.ClassName, c.Section,
               CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
               FROM Routines r
               LEFT JOIN Classes c ON r.ClassID = c.ClassID
               WHERE r.IsActive = TRUE ${branchClause}`;
  const params = [...branchParams];

  if (className && className !== "all") {
    query += " AND c.ClassName = ?";
    params.push(className);
  }

  if (section && section !== "all") {
    query += " AND c.Section = ?";
    params.push(section);
  }

  query += " ORDER BY r.RoutineDate DESC, r.CreatedAt DESC";

  const [rows] = await db.execute(query, params);
  return rows;
};

// Update routine (ClassID দিয়ে update করা হবে)
export const updateRoutine = async (id, updateData) => {
  const fields = [];
  const values = [];

  if (updateData.RoutineTitle) {
    fields.push("RoutineTitle = ?");
    values.push(updateData.RoutineTitle);
  }
  if (updateData.ClassID) {
    fields.push("ClassID = ?");
    values.push(updateData.ClassID);
  }
  if (updateData.RoutineDate) {
    fields.push("RoutineDate = ?");
    values.push(updateData.RoutineDate);
  }
  if (updateData.Description !== undefined) {
    fields.push("Description = ?");
    values.push(updateData.Description);
  }
  if (updateData.FileURL !== undefined) {
    fields.push("FileURL = ?");
    values.push(updateData.FileURL);
  }
  if (updateData.FileType) {
    fields.push("FileType = ?");
    values.push(updateData.FileType);
  }
  if (updateData.FilePublicID !== undefined) {
    fields.push("FilePublicID = ?");
    values.push(updateData.FilePublicID);
  }

  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(id);

  await db.execute(
    `UPDATE Routines SET ${fields.join(", ")}, UpdatedAt = CURRENT_TIMESTAMP WHERE RoutineID = ?`,
    values,
  );

  return getRoutineById(id);
};

// Delete routine (soft delete)
export const deleteRoutine = async (id) => {
  const [result] = await db.execute(
    "UPDATE Routines SET IsActive = FALSE WHERE RoutineID = ?",
    [id],
  );
  return result.affectedRows > 0;
};

// Search routines with class info (branch-scoped)
export const searchRoutines = async (searchTerm, branchId = null) => {
  const { clause, params: branchParams } = branchFilter(branchId, "r");
  const [rows] = await db.execute(
    `SELECT r.*, c.ClassName, c.Section,
     CONCAT(c.ClassName, ' - Section ', c.Section) as ClassSectionName
     FROM Routines r
     LEFT JOIN Classes c ON r.ClassID = c.ClassID
     WHERE (r.RoutineTitle LIKE ? OR c.ClassName LIKE ? OR c.Section LIKE ? OR r.Description LIKE ?)
     AND r.IsActive = TRUE ${clause}
     ORDER BY r.RoutineDate DESC`,
    [
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      ...branchParams,
    ],
  );
  return rows;
};

// ========== Helper Functions for Classes (GLOBAL — no branch filter) ==========

// Get all available classes for dropdown
export const getAllClasses = async () => {
  const [rows] = await db.execute(
    `SELECT ClassID, ClassName, Section,
     CONCAT(ClassName, ' - Section ', Section) as ClassSectionName
     FROM Classes
     ORDER BY ClassName, Section`,
  );
  return rows;
};

// Get distinct class names for filter dropdown
export const getDistinctClasses = async () => {
  const [rows] = await db.execute(
    `SELECT DISTINCT ClassName FROM Classes ORDER BY ClassName`,
  );
  return rows.map((row) => row.ClassName);
};

// Get distinct sections for filter dropdown
export const getDistinctSections = async () => {
  const [rows] = await db.execute(
    `SELECT DISTINCT Section FROM Classes ORDER BY Section`,
  );
  return rows.map((row) => row.Section);
};

// Get sections by class name (dynamic section loading)
export const getSectionsByClassName = async (className) => {
  const [rows] = await db.execute(
    `SELECT ClassID, Section FROM Classes WHERE ClassName = ? ORDER BY Section`,
    [className],
  );
  return rows;
};

// Validate if class exists
export const validateClassId = async (classId) => {
  const [rows] = await db.execute(
    `SELECT ClassID, ClassName, Section FROM Classes WHERE ClassID = ?`,
    [classId],
  );
  return rows[0];
};
