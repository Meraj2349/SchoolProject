import db from "../config/db.config.js";

/** Always returns the single chairman profile row (id = 1). */
export const getChairmanProfile = async () => {
  const [rows] = await db.query(
    `SELECT id, name_en, name_bn, title_en, title_bn,
            institution_en, institution_bn, image_url, image_public_id, updated_at
     FROM ChairmanProfile WHERE id = 1 LIMIT 1`,
  );
  return rows[0] || null;
};

/**
 * Update the chairman profile text fields.
 * Fields are optional – only supplied keys are updated.
 */
export const updateChairmanProfile = async (fields) => {
  const allowed = [
    "name_en", "name_bn",
    "title_en", "title_bn",
    "institution_en", "institution_bn",
    "image_url", "image_public_id",
  ];
  const setClauses = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (setClauses.length === 0) return { success: true };
  values.push(1); // WHERE id = 1
  await db.query(
    `UPDATE ChairmanProfile SET ${setClauses.join(", ")} WHERE id = 1`,
    values,
  );
  return { success: true };
};

/** Return the current image_public_id (needed before replacing the image). */
export const getChairmanImagePublicId = async () => {
  const [rows] = await db.query(
    `SELECT image_public_id FROM ChairmanProfile WHERE id = 1 LIMIT 1`,
  );
  return rows[0]?.image_public_id ?? null;
};
