import db from "../config/db.config.js";

const getAllApplications = async () => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Applications ORDER BY created_at DESC",
    );
    return rows;
  } catch (err) {
    throw new Error("Error fetching applications: " + err.message);
  }
};

const getApplicationById = async (id) => {
  try {
    const [rows] = await db.query("SELECT * FROM Applications WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) throw new Error("Application not found");
    return rows[0];
  } catch (err) {
    throw new Error("Error fetching application: " + err.message);
  }
};

const createApplication = async (data) => {
  const {
    applicant_name,
    date_of_birth,
    gender,
    applying_for_class,
    previous_school,
    previous_class,
    parent_name,
    parent_contact,
    parent_email,
    address,
    additional_info,
  } = data;

  try {
    const sql = `
      INSERT INTO Applications
        (applicant_name, date_of_birth, gender, applying_for_class,
         previous_school, previous_class, parent_name, parent_contact,
         parent_email, address, additional_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      applicant_name,
      date_of_birth,
      gender,
      applying_for_class,
      previous_school || null,
      previous_class || null,
      parent_name,
      parent_contact,
      parent_email || null,
      address || null,
      additional_info || null,
    ]);
    return { id: result.insertId };
  } catch (err) {
    throw new Error("Error creating application: " + err.message);
  }
};

const updateApplicationStatus = async (id, status) => {
  try {
    const [result] = await db.query(
      "UPDATE Applications SET status = ? WHERE id = ?",
      [status, id],
    );
    if (result.affectedRows === 0) throw new Error("Application not found");
    return { id, status };
  } catch (err) {
    throw new Error("Error updating application status: " + err.message);
  }
};

const deleteApplication = async (id) => {
  try {
    const [result] = await db.query(
      "DELETE FROM Applications WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) throw new Error("Application not found");
    return { message: "Application deleted successfully" };
  } catch (err) {
    throw new Error("Error deleting application: " + err.message);
  }
};

export {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
};
