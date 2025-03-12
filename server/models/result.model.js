import db from "../config/db.config.js";

const getAllResults = async () => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, 
        CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
        e.ExamName,
        sub.SubjectName
      FROM Results r
      JOIN Students s ON r.StudentID = s.StudentID
      JOIN Exams e ON r.ExamID = e.ExamID
      JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching results: " + err.message);
  }
};

const addResult = async (resultData) => {
  const { StudentID, ExamID, SubjectID, MarksObtained } = resultData;
  
  const sql = "INSERT INTO Results (StudentID, ExamID, SubjectID, MarksObtained) VALUES (?, ?, ?, ?)";

  try {
    const [result] = await db.query(sql, [StudentID, ExamID, SubjectID, MarksObtained]);
    return { message: "Result added successfully", resultID: result.insertId };
  } catch (err) {
    throw new Error("Error adding result: " + err.message);
  }
};

const deleteResult = async (resultID) => {
  const sql = "DELETE FROM Results WHERE ResultID = ?";

  try {
    const [result] = await db.query(sql, [resultID]);

    if (result.affectedRows === 0) {
      throw new Error("Result not found");
    }
    return { message: "Result deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting result: " + error.message);
  }
};

const updateResult = async (resultID, resultData) => {
  const { StudentID, ExamID, SubjectID, MarksObtained } = resultData;

  const sql = `UPDATE Results SET StudentID = ?, ExamID = ?, SubjectID = ?, MarksObtained = ? WHERE ResultID = ?`;
  
  try {
    const [result] = await db.query(sql, [StudentID, ExamID, SubjectID, MarksObtained, resultID]);

    if (result.affectedRows === 0) {
      throw new Error("Result not found");
    }

    return { message: `Result with ID ${resultID} updated successfully` };
  } catch (error) {
    throw new Error("Error updating result: " + error.message);
  }
};

const searchResults = async (filters) => {
  const { StudentID, ExamID, SubjectID, MinMarks, MaxMarks } = filters;

  let query = `
    SELECT r.*, 
      CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
      e.ExamName,
      sub.SubjectName
    FROM Results r
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Exams e ON r.ExamID = e.ExamID
    JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    WHERE 1=1
  `;
  const params = [];

  if (StudentID) {
    query += " AND r.StudentID = ?";
    params.push(StudentID);
  }
  if (ExamID) {
    query += " AND r.ExamID = ?";
    params.push(ExamID);
  }
  if (SubjectID) {
    query += " AND r.SubjectID = ?";
    params.push(SubjectID);
  }
  if (MinMarks) {
    query += " AND r.MarksObtained >= ?";
    params.push(MinMarks);
  }
  if (MaxMarks) {
    query += " AND r.MarksObtained <= ?";
    params.push(MaxMarks);
  }

  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw new Error("Error searching results: " + error.message);
  }
};

const getResultById = async (resultID) => {
  const sql = `
    SELECT r.*, 
      CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
      e.ExamName,
      sub.SubjectName
    FROM Results r
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Exams e ON r.ExamID = e.ExamID
    JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    WHERE r.ResultID = ?
  `;

  try {
    const [results] = await db.query(sql, [resultID]);

    if (results.length === 0) {
      throw new Error("Result not found");
    }

    return results[0];
  } catch (error) {
    throw new Error("Error fetching result: " + error.message);
  }
};

const getResultsByStudent = async (studentID) => {
  const sql = `
    SELECT r.*, 
      e.ExamName,
      sub.SubjectName
    FROM Results r
    JOIN Exams e ON r.ExamID = e.ExamID
    JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    WHERE r.StudentID = ?
    ORDER BY e.ExamDate DESC, sub.SubjectName
  `;

  try {
    const [results] = await db.query(sql, [studentID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching results for student: " + error.message);
  }
};

const getResultsByExam = async (examID) => {
  const sql = `
    SELECT r.*, 
      CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
      sub.SubjectName
    FROM Results r
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    WHERE r.ExamID = ?
    ORDER BY s.LastName, s.FirstName, sub.SubjectName
  `;

  try {
    const [results] = await db.query(sql, [examID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching results for exam: " + error.message);
  }
};

const getResultsByClass = async (classID) => {
  const sql = `
    SELECT r.*, 
      CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
      e.ExamName,
      sub.SubjectName
    FROM Results r
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Exams e ON r.ExamID = e.ExamID
    JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    WHERE e.ClassID = ?
    ORDER BY e.ExamDate DESC, s.LastName, s.FirstName, sub.SubjectName
  `;

  try {
    const [results] = await db.query(sql, [classID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching results for class: " + error.message);
  }
};

const getHighestMarksInSubject = async (className, examName, year, subjectName) => {
  // SQL query joining all the necessary tables to get results by class name, exam name, year and subject name
  const sql = `
    SELECT 
      r.ResultID,
      r.StudentID,
      r.ExamID,
      r.SubjectID,
      r.MarksObtained,
      CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
      e.ExamName,
      YEAR(e.ExamDate) AS ExamYear,
      sub.SubjectName,
      c.ClassName,
      c.Section
    FROM Results r
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Exams e ON r.ExamID = e.ExamID
    JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    JOIN Classes c ON e.ClassID = c.ClassID
    WHERE c.ClassName = ?
      AND e.ExamName = ?
      AND YEAR(e.ExamDate) = ?
      AND sub.SubjectName = ?
    ORDER BY r.MarksObtained DESC
    LIMIT 10
  `;

  try {
    const [results] = await db.query(sql, [className, examName, year, subjectName]);
    
    if (results.length === 0) {
      throw new Error(`No results found for Class ${className}, ${examName} ${year}, ${subjectName}`);
    }

    // Get the highest mark
    const highestMark = results[0].MarksObtained;
    
    // Return all students who achieved this highest mark (in case of ties)
    const topStudents = results.filter(result => result.MarksObtained === highestMark);
    
    return {
      subjectName: subjectName,
      examName: examName,
      examYear: year,
      className: className,
      sections: [...new Set(topStudents.map(student => student.Section))], // Get unique sections
      highestMark: highestMark,
      topStudents: topStudents.map(student => ({
        studentID: student.StudentID,
        studentName: student.StudentName,
        section: student.Section,
        marksObtained: student.MarksObtained
      }))
    };
  } catch (error) {
    throw new Error("Error fetching highest marks in subject: " + error.message);
  }
};

const getSubjectHighestMarksByClassAndExam = async (className, examName, year) => {
  const sql = `
    SELECT 
      sub.SubjectName,
      MAX(r.MarksObtained) AS HighestMark
    FROM Results r
    JOIN Students s ON r.StudentID = s.StudentID
    JOIN Exams e ON r.ExamID = e.ExamID
    JOIN Subjects sub ON r.SubjectID = sub.SubjectID
    JOIN Classes c ON e.ClassID = c.ClassID
    WHERE c.ClassName = ?
      AND e.ExamName = ?
      AND YEAR(e.ExamDate) = ?
    GROUP BY sub.SubjectID, sub.SubjectName
    ORDER BY sub.SubjectName
  `;

  try {
    const [subjectHighestMarks] = await db.query(sql, [className, examName, year]);
    
    if (subjectHighestMarks.length === 0) {
      throw new Error(`No results found for Class ${className}, ${examName} ${year}`);
    }

    // For each subject with highest marks, get the students who achieved those marks
    const result = await Promise.all(subjectHighestMarks.map(async (subject) => {
      const topStudentsQuery = `
        SELECT 
          r.StudentID,
          CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
          s.Class AS StudentClass,
          s.Section AS StudentSection
        FROM Results r
        JOIN Students s ON r.StudentID = s.StudentID
        JOIN Exams e ON r.ExamID = e.ExamID
        JOIN Subjects sub ON r.SubjectID = sub.SubjectID
        JOIN Classes c ON e.ClassID = c.ClassID
        WHERE c.ClassName = ?
          AND e.ExamName = ?
          AND YEAR(e.ExamDate) = ?
          AND sub.SubjectName = ?
          AND r.MarksObtained = ?
        ORDER BY s.LastName, s.FirstName
      `;

      const [topStudents] = await db.query(topStudentsQuery, [
        className, 
        examName, 
        year, 
        subject.SubjectName, 
        subject.HighestMark
      ]);

      return {
        subject: subject.SubjectName,
        highestMark: subject.HighestMark,
        topStudents: topStudents.map(student => ({
          studentID: student.StudentID,
          studentName: student.StudentName,
          section: student.StudentSection
        }))
      };
    }));

    return {
      className: className,
      examName: examName,
      examYear: year,
      subjectsHighestMarks: result
    };
  } catch (error) {
    throw new Error("Error fetching subject highest marks: " + error.message);
  }

  
};

const getStudentResultsByExam = async (studentID, className, examName, year) => {
    const sql = `
      SELECT 
        r.*, 
        e.ExamName,
        sub.SubjectName,
        c.ClassName,
        YEAR(e.ExamDate) AS ExamYear
      FROM Results r
      JOIN Students s ON r.StudentID = s.StudentID
      JOIN Exams e ON r.ExamID = e.ExamID
      JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      JOIN Classes c ON e.ClassID = c.ClassID
      WHERE s.StudentID = ?
        AND c.ClassName = ?
        AND e.ExamName = ?
        AND YEAR(e.ExamDate) = ?
      ORDER BY sub.SubjectName
    `;
  
    try {
      const [results] = await db.query(sql, [studentID, className, examName, year]);
  
      if (results.length === 0) {
        throw new Error(`No results found for Student ID ${studentID} in Class ${className}, ${examName} ${year}`);
      }
  
      return results;
    } catch (error) {
      throw new Error("Error fetching student results by exam: " + error.message);
    }
  };


export {
  getAllResults,
  addResult,
  deleteResult,
  updateResult,
  searchResults,
  getResultById,
  getResultsByStudent,
  getResultsByExam,
  getResultsByClass,
  getHighestMarksInSubject,
  getSubjectHighestMarksByClassAndExam,
  getStudentResultsByExam
};