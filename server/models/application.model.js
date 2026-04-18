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

    // When accepted, auto-create the student record
    if (status === "accepted") {
      // Fetch the application data
      const [rows] = await db.query("SELECT * FROM Applications WHERE id = ?", [id]);
      if (rows.length === 0) throw new Error("Application not found");
      const app = rows[0];

      // Split full name into first/last
      const nameParts = (app.applicant_name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || app.applicant_name;
      const lastName = nameParts.slice(1).join(" ") || "-";

      // Capitalize gender to match Students ENUM('Male','Female')
      const gender =
        app.gender === "male" ? "Male" :
        app.gender === "female" ? "Female" : "Male";

      // Find or create the class (default section 'A')
      const className = app.applying_for_class;
      const section = "A";
      const [existingClass] = await db.query(
        "SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ?",
        [className, section],
      );
      let classId;
      if (existingClass.length > 0) {
        classId = existingClass[0].ClassID;
      } else {
        const [newClass] = await db.query(
          "INSERT INTO Classes (ClassName, Section) VALUES (?, ?)",
          [className, section],
        );
        classId = newClass.insertId;
      }

      // Generate a unique roll number: max existing + 1 for this class
      const [maxRoll] = await db.query(
        "SELECT MAX(CAST(RollNumber AS UNSIGNED)) AS maxRoll FROM Students WHERE ClassID = ?",
        [classId],
      );
      const nextRoll = ((maxRoll[0].maxRoll || 0) + 1).toString();

      // Insert into Students
      await db.query(
        `INSERT INTO Students
          (FirstName, LastName, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, RollNumber)
         VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
        [
          firstName,
          lastName,
          app.date_of_birth,
          gender,
          classId,
          app.address || null,
          app.parent_contact,
          nextRoll,
        ],
      );
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
