import db from "../config/db.config.js";

const getAllExams = async () => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, c.ClassName, c.Section 
      FROM Exams e
      LEFT JOIN Classes c ON e.ClassID = c.ClassID
      ORDER BY e.ExamDate DESC
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching exams: " + err.message);
  }
};

const addExam = async (examData) => {
  const { ExamName, ClassID, ExamDate } = examData;
  
  const sql = "INSERT INTO Exams (ExamName, ClassID, ExamDate) VALUES (?, ?, ?)";

  try {
    const [result] = await db.query(sql, [ExamName, ClassID, ExamDate]);
    return { message: "Exam added successfully", examID: result.insertId };
  } catch (err) {
    throw new Error("Error adding exam: " + err.message);
  }
};

const updateExam = async (examID, examData) => {
  const { ExamName, ClassID, ExamDate } = examData;

  const sql = `UPDATE Exams SET ExamName = ?, ClassID = ?, ExamDate = ? WHERE ExamID = ?`;
  
  try {
    const [result] = await db.query(sql, [ExamName, ClassID, ExamDate, examID]);

    if (result.affectedRows === 0) {
      throw new Error("Exam not found");
    }

    return { message: `Exam with ID ${examID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating exam: " + error.message);
  }
};

const deleteExam = async (examID) => {
  const sql = "DELETE FROM Exams WHERE ExamID = ?";

  try {
    const [result] = await db.query(sql, [examID]);

    if (result.affectedRows === 0) {
      throw new Error("Exam not found");
    }
    return { message: "Exam deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting exam: " + error.message);
  }
};

const getExamById = async (examID) => {
  const sql = `
    SELECT e.*, c.ClassName, c.Section 
    FROM Exams e
    LEFT JOIN Classes c ON e.ClassID = c.ClassID
    WHERE e.ExamID = ?
  `;

  try {
    const [results] = await db.query(sql, [examID]);

    if (results.length === 0) {
      throw new Error("Exam not found");
    }

    return results[0];
  } catch (error) {
    throw new Error("Error fetching exam: " + error.message);
  }
};

const searchExams = async (filters) => {
  const { ExamName, ClassID, StartDate, EndDate } = filters;

  let query = `
    SELECT e.*, c.ClassName, c.Section 
    FROM Exams e
    LEFT JOIN Classes c ON e.ClassID = c.ClassID
    WHERE 1=1
  `;
  const params = [];

  if (ExamName) {
    query += " AND e.ExamName LIKE ?";
    params.push(`%${ExamName}%`);
  }
  if (ClassID) {
    query += " AND e.ClassID = ?";
    params.push(ClassID);
  }
  if (StartDate && EndDate) {
    query += " AND e.ExamDate BETWEEN ? AND ?";
    params.push(StartDate, EndDate);
  } else if (StartDate) {
    query += " AND e.ExamDate >= ?";
    params.push(StartDate);
  } else if (EndDate) {
    query += " AND e.ExamDate <= ?";
    params.push(EndDate);
  }

  query += " ORDER BY e.ExamDate DESC";

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw new Error("Error searching exams: " + error.message);
  }
};

const getExamsByClass = async (classID) => {
  const sql = `
    SELECT * FROM Exams 
    WHERE ClassID = ?
    ORDER BY ExamDate DESC
  `;

  try {
    const [results] = await db.query(sql, [classID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching exams for class: " + error.message);
  }
};

const getUpcomingExams = async (days = 30) => {
  const sql = `
    SELECT e.*, c.ClassName, c.Section 
    FROM Exams e
    LEFT JOIN Classes c ON e.ClassID = c.ClassID
    WHERE e.ExamDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    ORDER BY e.ExamDate
  `;

  try {
    const [results] = await db.query(sql, [days]);
    return results;
  } catch (error) {
    throw new Error("Error fetching upcoming exams: " + error.message);
  }
};

export {
  getAllExams,
  addExam,
  updateExam,
  deleteExam,
  getExamById,
  searchExams,
  getExamsByClass,
  getUpcomingExams
};