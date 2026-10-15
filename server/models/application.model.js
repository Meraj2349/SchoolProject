import db from "../config/db.config.js";
import { STANDARD_SECTIONS } from "./classes.model.js";
import { addStudent } from "./student.model.js";

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

// Students admitted from an application start in the general section.
const ADMISSION_SECTION = STANDARD_SECTIONS.includes("General") ? "General" : STANDARD_SECTIONS[0];

// branchId: the accepting admin's branch (null for super_admin → default branch)
const updateApplicationStatus = async (id, status, branchId = null) => {
  try {
    const [rows] = await db.query("SELECT * FROM Applications WHERE id = ?", [id]);
    if (rows.length === 0) throw new Error("Application not found");
    const app = rows[0];

    await db.query("UPDATE Applications SET status = ? WHERE id = ?", [status, id]);

    // Create the student only once: student_id remembers the enrolment, so
    // accepted → reviewed → accepted does not enrol the same child twice.
    if (status === "accepted" && app.student_id == null) {

      // Split full name into first/last
      const nameParts = (app.applicant_name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || app.applicant_name;
      const lastName = nameParts.slice(1).join(" ") || "-";

      // Capitalize gender to match Students ENUM('Male','Female')
      const gender =
        app.gender === "male" ? "Male" :
        app.gender === "female" ? "Female" : "Male";

      const className = app.applying_for_class;
      const effectiveBranch = branchId ?? 1;

      // Generate a unique roll number: max existing + 1 for this class in this branch
      const [maxRoll] = await db.query(
        `SELECT MAX(CAST(s.RollNumber AS UNSIGNED)) AS maxRoll
           FROM Students s JOIN Classes c ON c.ClassID = s.ClassID
          WHERE c.ClassName = ? AND c.Section = ? AND c.branch_id = ?`,
        [className, ADMISSION_SECTION, effectiveBranch],
      );
      const nextRoll = ((maxRoll[0].maxRoll || 0) + 1).toString();

      const { studentID } = await addStudent(
        {
          FirstName: firstName,
          LastName: lastName,
          DateOfBirth: app.date_of_birth,
          Gender: gender,
          Class: className,
          Section: ADMISSION_SECTION,
          AdmissionDate: new Date().toISOString().split("T")[0],
          Address: app.address || null,
          ParentContact: app.parent_contact,
          RollNumber: nextRoll,
        },
        effectiveBranch,
      );
      await db.query("UPDATE Applications SET student_id = ? WHERE id = ?", [studentID, id]);
    }

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
