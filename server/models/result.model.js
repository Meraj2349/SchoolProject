import db from "../config/db.config.js";

/**
 * Result Model for School Management System
 * 
 * Database Schema (Matches your database.sql):
 * CREATE TABLE Results (
 *     ResultID INT PRIMARY KEY AUTO_INCREMENT,
 *     StudentID INT NOT NULL,
 *     ExamID INT NOT NULL,
 *     SubjectID INT NOT NULL,
 *     ClassID INT NOT NULL,
 *     MarksObtained INT NOT NULL,
 *     FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
 *     FOREIGN KEY (ExamID) REFERENCES Exams (ExamID),
 *     FOREIGN KEY (SubjectID) REFERENCES Subjects (SubjectID),
 *     FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
 * );
 */

// Get all results with complete student, exam, subject, and class information
const getAllResults = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      ORDER BY e.ExamDate DESC, s.RollNumber
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching results: " + err.message);
  }
};

// Get result by ID with complete information
const getResultById = async (resultId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE r.ResultID = ?
    `, [resultId]);
    return rows[0];
  } catch (err) {
    throw new Error("Error fetching result by ID: " + err.message);
  }
};

// Get results by student ID with complete information
const getResultsByStudent = async (studentId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE r.StudentID = ?
      ORDER BY e.ExamDate DESC
    `, [studentId]);
    return rows;
  } catch (err) {
    throw new Error("Error fetching results by student: " + err.message);
  }
};

// Get results by exam ID with complete information
const getResultsByExam = async (examId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE r.ExamID = ?
      ORDER BY s.RollNumber, sub.SubjectName
    `, [examId]);
    return rows;
  } catch (err) {
    throw new Error("Error fetching results by exam: " + err.message);
  }
};

// Get results by class with complete information
const getResultsByClass = async (classId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE r.ClassID = ?
      ORDER BY e.ExamDate DESC, s.RollNumber
    `, [classId]);
    return rows;
  } catch (err) {
    throw new Error("Error fetching results by class: " + err.message);
  }
};

// Get results by subject with complete information
const getResultsBySubject = async (subjectId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE r.SubjectID = ?
      ORDER BY e.ExamDate DESC, s.RollNumber
    `, [subjectId]);
    return rows;
  } catch (err) {
    throw new Error("Error fetching results by subject: " + err.message);
  }
};

// Add new result with validation
const addResult = async (resultData) => {
  try {
    console.log('🔍 Model addResult called with:', resultData);
    const { StudentID, ExamID, SubjectID, ClassID, MarksObtained } = resultData;
    console.log('🔍 Extracted values:', { StudentID, ExamID, SubjectID, ClassID, MarksObtained });
    
    // Validate required fields
    if (!StudentID || !ExamID || !SubjectID || !ClassID || MarksObtained === undefined || MarksObtained === null) {
      throw new Error("All fields are required: StudentID, ExamID, SubjectID, ClassID, MarksObtained");
    }

    // Validate marks
    if (MarksObtained < 0) {
      throw new Error("Marks obtained cannot be negative");
    }

    if (MarksObtained > 100) {
      throw new Error("Marks obtained cannot exceed 100");
    }

    // Check if student exists and belongs to the specified class
    const [studentCheck] = await db.query(`
      SELECT s.StudentID, s.FirstName, s.LastName, s.RollNumber, c.ClassName, c.Section
      FROM Students s
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE s.StudentID = ? AND s.ClassID = ?
    `, [StudentID, ClassID]);

    if (studentCheck.length === 0) {
      console.log('❌ Student not found for StudentID:', StudentID, 'ClassID:', ClassID);
      throw new Error("Student not found or does not belong to the specified class");
    }
    console.log('✅ Student found:', studentCheck[0]);

    // Check if exam exists (remove class restriction for now)
    const [examCheck] = await db.query(`
      SELECT ExamID, ExamName, ExamType, ClassID FROM Exams WHERE ExamID = ?
    `, [ExamID]);

    if (examCheck.length === 0) {
      console.log('❌ Exam not found for ExamID:', ExamID);
      throw new Error("Exam not found");
    }
    console.log('✅ Exam found:', examCheck[0]);

    // Check if subject exists (remove class restriction for now)  
    const [subjectCheck] = await db.query(`
      SELECT SubjectID, SubjectName, ClassID FROM Subjects WHERE SubjectID = ?
    `, [SubjectID]);

    if (subjectCheck.length === 0) {
      console.log('❌ Subject not found for SubjectID:', SubjectID);
      throw new Error("Subject not found");
    }
    console.log('✅ Subject found:', subjectCheck[0]);

    // Check if result already exists
    const exists = await checkResultExists(StudentID, ExamID, SubjectID);
    if (exists) {
      const student = studentCheck[0];
      const exam = examCheck[0];
      const subject = subjectCheck[0];
      throw new Error(`Result already exists for ${student.FirstName} ${student.LastName} (Roll: ${student.RollNumber}) in ${subject.SubjectName} for ${exam.ExamName} exam`);
    }

    // Insert the result
    console.log('🔄 Executing INSERT query...');
    const [result] = await db.query(`
      INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained)
      VALUES (?, ?, ?, ?, ?)
    `, [StudentID, ExamID, SubjectID, ClassID, MarksObtained]);

    console.log('📊 INSERT result:', result);

    return {
      affectedRows: result.affectedRows,
      insertId: result.insertId,
      success: true,
      message: "Result added successfully",
      data: {
        StudentID,
        ExamID,
        SubjectID,
        ClassID,
        MarksObtained,
        studentInfo: studentCheck[0],
        examInfo: examCheck[0],
        subjectInfo: subjectCheck[0]
      }
    };
  } catch (err) {
    throw new Error("Error adding result: " + err.message);
  }
};

// Add result by student details (name, roll, class, section)
const addResultByStudentDetails = async (resultData) => {
  try {
    const { 
      studentName, 
      rollNumber, 
      className, 
      section, 
      examName, 
      subjectName, 
      marksObtained 
    } = resultData;

    // Validate required fields
    if (!marksObtained || marksObtained < 0) {
      throw new Error("Invalid marks obtained. Must be a positive number.");
    }

    // Get student ID by name and/or roll number with proper class validation
    let studentQuery = `
      SELECT s.StudentID, s.FirstName, s.LastName, s.RollNumber, c.ClassName, c.Section
      FROM Students s 
      LEFT JOIN Classes c ON s.ClassID = c.ClassID
      WHERE 1=1
    `;
    const studentParams = [];

    if (studentName) {
      studentQuery += ` AND (CONCAT(s.FirstName, ' ', s.LastName) LIKE ? OR s.FirstName LIKE ? OR s.LastName LIKE ?)`;
      const namePattern = `%${studentName}%`;
      studentParams.push(namePattern, namePattern, namePattern);
    }

    if (rollNumber) {
      studentQuery += ` AND s.RollNumber = ?`;
      studentParams.push(rollNumber);
    }

    if (className) {
      studentQuery += ` AND c.ClassName = ?`;
      studentParams.push(className);
    }

    if (section) {
      studentQuery += ` AND c.Section = ?`;
      studentParams.push(section);
    }

    const [studentRows] = await db.query(studentQuery, studentParams);

    if (studentRows.length === 0) {
      throw new Error("Student not found with the provided details. Please check student name, roll number, class, and section.");
    }

    if (studentRows.length > 1) {
      throw new Error("Multiple students found with the provided details. Please provide more specific information.");
    }

    const student = studentRows[0];
    const studentId = student.StudentID;

    // Get exam ID by exam name and class
    const [examRows] = await db.query(`
      SELECT e.ExamID, e.ExamName, e.ExamType, c.ClassName, c.Section
      FROM Exams e
      LEFT JOIN Classes c ON e.ClassID = c.ClassID
      WHERE e.ExamName = ? AND c.ClassName = ? AND c.Section = ?
    `, [examName, className, section]);

    if (examRows.length === 0) {
      throw new Error(`Exam '${examName}' not found for class '${className}' section '${section}'. Please check exam name and class details.`);
    }

    const exam = examRows[0];
    const examId = exam.ExamID;

    // Get subject ID by subject name and class
    const [subjectRows] = await db.query(`
      SELECT sub.SubjectID, sub.SubjectName, c.ClassName, c.Section
      FROM Subjects sub
      LEFT JOIN Classes c ON sub.ClassID = c.ClassID
      WHERE sub.SubjectName = ? AND c.ClassName = ? AND c.Section = ?
    `, [subjectName, className, section]);

    if (subjectRows.length === 0) {
      throw new Error(`Subject '${subjectName}' not found for class '${className}' section '${section}'. Please check subject name and class details.`);
    }

    const subject = subjectRows[0];
    const subjectId = subject.SubjectID;

    // Get class ID
    const [classRows] = await db.query(`
      SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ?
    `, [className, section]);

    if (classRows.length === 0) {
      throw new Error(`Class '${className}' section '${section}' not found. Please check class and section names.`);
    }

    const classId = classRows[0].ClassID;

    // Check if result already exists
    const exists = await checkResultExists(studentId, examId, subjectId);
    if (exists) {
      throw new Error(`Result already exists for student '${student.FirstName} ${student.LastName}' (Roll: ${student.RollNumber}) in '${subjectName}' for '${examName}' exam.`);
    }

    // Validate marks (assuming 100 as max marks, adjust as needed)
    if (marksObtained > 100) {
      throw new Error("Marks obtained cannot exceed 100.");
    }

    // Insert the result
    const [result] = await db.query(`
      INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained)
      VALUES (?, ?, ?, ?, ?)
    `, [studentId, examId, subjectId, classId, marksObtained]);

    return {
      success: true,
      resultId: result.insertId,
      studentName: `${student.FirstName} ${student.LastName}`,
      rollNumber: student.RollNumber,
      className: className,
      section: section,
      examName: examName,
      examType: exam.ExamType,
      subjectName: subjectName,
      marksObtained: marksObtained,
      message: `Result added successfully for ${student.FirstName} ${student.LastName} (Roll: ${student.RollNumber}) in ${subjectName}`
    };
  } catch (err) {
    throw new Error("Error adding result by student details: " + err.message);
  }
};

// Add multiple results (batch insert) with validation
const addMultipleResults = async (resultsData) => {
  try {
    if (!Array.isArray(resultsData) || resultsData.length === 0) {
      throw new Error("Results data must be a non-empty array");
    }

    // Validate each result
    const validatedResults = [];
    const errors = [];

    for (let i = 0; i < resultsData.length; i++) {
      const result = resultsData[i];
      const { StudentID, ExamID, SubjectID, ClassID, MarksObtained } = result;

      // Check required fields
      if (!StudentID || !ExamID || !SubjectID || !ClassID || MarksObtained === undefined || MarksObtained === null) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      // Validate marks
      if (MarksObtained < 0 || MarksObtained > 100) {
        errors.push(`Row ${i + 1}: Invalid marks (${MarksObtained}). Must be between 0 and 100`);
        continue;
      }

      // Check for duplicates in the same batch
      const duplicate = validatedResults.find(r => 
        r.StudentID === StudentID && r.ExamID === ExamID && r.SubjectID === SubjectID
      );
      if (duplicate) {
        errors.push(`Row ${i + 1}: Duplicate result in batch for StudentID ${StudentID}, ExamID ${ExamID}, SubjectID ${SubjectID}`);
        continue;
      }

      // Check if result already exists in database
      const exists = await checkResultExists(StudentID, ExamID, SubjectID);
      if (exists) {
        errors.push(`Row ${i + 1}: Result already exists for StudentID ${StudentID}, ExamID ${ExamID}, SubjectID ${SubjectID}`);
        continue;
      }

      validatedResults.push([StudentID, ExamID, SubjectID, ClassID, MarksObtained]);
    }

    if (errors.length > 0) {
      throw new Error("Validation errors:\n" + errors.join("\n"));
    }

    if (validatedResults.length === 0) {
      throw new Error("No valid results to insert");
    }

    // Insert all valid results
    const [result] = await db.query(`
      INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained)
      VALUES ?
    `, [validatedResults]);

    return {
      success: true,
      insertedCount: validatedResults.length,
      firstInsertId: result.insertId,
      message: `Successfully inserted ${validatedResults.length} results`
    };
  } catch (err) {
    throw new Error("Error adding multiple results: " + err.message);
  }
};

// Update result with validation
const updateResult = async (resultId, resultData) => {
  try {
    if (!resultId) {
      throw new Error("Result ID is required");
    }

    // Check if result exists
    const [existingResult] = await db.query(`
      SELECT * FROM Results WHERE ResultID = ?
    `, [resultId]);

    if (existingResult.length === 0) {
      throw new Error("Result not found");
    }

    const { StudentID, ExamID, SubjectID, ClassID, MarksObtained } = resultData;
    const updates = [];
    const params = [];

    // Build dynamic update query
    if (StudentID !== undefined) {
      // Validate student exists and belongs to class
      const [studentCheck] = await db.query(`
        SELECT StudentID FROM Students WHERE StudentID = ? AND ClassID = ?
      `, [StudentID, ClassID || existingResult[0].ClassID]);
      
      if (studentCheck.length === 0) {
        throw new Error("Student not found or does not belong to the specified class");
      }
      
      updates.push("StudentID = ?");
      params.push(StudentID);
    }

    if (ExamID !== undefined) {
      // Validate exam exists and belongs to class
      const [examCheck] = await db.query(`
        SELECT ExamID FROM Exams WHERE ExamID = ? AND ClassID = ?
      `, [ExamID, ClassID || existingResult[0].ClassID]);
      
      if (examCheck.length === 0) {
        throw new Error("Exam not found or does not belong to the specified class");
      }
      
      updates.push("ExamID = ?");
      params.push(ExamID);
    }

    if (SubjectID !== undefined) {
      // Validate subject exists and belongs to class
      const [subjectCheck] = await db.query(`
        SELECT SubjectID FROM Subjects WHERE SubjectID = ? AND ClassID = ?
      `, [SubjectID, ClassID || existingResult[0].ClassID]);
      
      if (subjectCheck.length === 0) {
        throw new Error("Subject not found or does not belong to the specified class");
      }
      
      updates.push("SubjectID = ?");
      params.push(SubjectID);
    }

    if (ClassID !== undefined) {
      // Validate class exists
      const [classCheck] = await db.query(`
        SELECT ClassID FROM Classes WHERE ClassID = ?
      `, [ClassID]);
      
      if (classCheck.length === 0) {
        throw new Error("Class not found");
      }
      
      updates.push("ClassID = ?");
      params.push(ClassID);
    }

    if (MarksObtained !== undefined) {
      // Validate marks
      if (MarksObtained < 0 || MarksObtained > 100) {
        throw new Error("Marks obtained must be between 0 and 100");
      }
      
      updates.push("MarksObtained = ?");
      params.push(MarksObtained);
    }

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    // Check for duplicate result if StudentID, ExamID, or SubjectID is being updated
    if (StudentID !== undefined || ExamID !== undefined || SubjectID !== undefined) {
      const newStudentID = StudentID || existingResult[0].StudentID;
      const newExamID = ExamID || existingResult[0].ExamID;
      const newSubjectID = SubjectID || existingResult[0].SubjectID;

      const [duplicateCheck] = await db.query(`
        SELECT ResultID FROM Results 
        WHERE StudentID = ? AND ExamID = ? AND SubjectID = ? AND ResultID != ?
      `, [newStudentID, newExamID, newSubjectID, resultId]);

      if (duplicateCheck.length > 0) {
        throw new Error("Another result already exists for this student, exam, and subject combination");
      }
    }

    // Perform update
    params.push(resultId);
    const [result] = await db.query(`
      UPDATE Results 
      SET ${updates.join(', ')}
      WHERE ResultID = ?
    `, params);

    if (result.affectedRows === 0) {
      throw new Error("No rows were updated");
    }

    return {
      success: true,
      message: "Result updated successfully",
      affectedRows: result.affectedRows
    };
  } catch (err) {
    throw new Error("Error updating result: " + err.message);
  }
};

// Delete result
const deleteResult = async (resultId) => {
  try {
    const [result] = await db.query(`
      DELETE FROM Results WHERE ResultID = ?
    `, [resultId]);
    return result;
  } catch (err) {
    throw new Error("Error deleting result: " + err.message);
  }
};

// Delete results by exam
const deleteResultsByExam = async (examId) => {
  try {
    const [result] = await db.query(`
      DELETE FROM Results WHERE ExamID = ?
    `, [examId]);
    return result;
  } catch (err) {
    throw new Error("Error deleting results by exam: " + err.message);
  }
};

// Get result count
const getResultCount = async () => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) as count FROM Results
    `);
    return rows[0].count;
  } catch (err) {
    throw new Error("Error getting result count: " + err.message);
  }
};

// Check if result exists
const checkResultExists = async (studentId, examId, subjectId) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) as count 
      FROM Results 
      WHERE StudentID = ? AND ExamID = ? AND SubjectID = ?
    `, [studentId, examId, subjectId]);
    return rows[0].count > 0;
  } catch (err) {
    throw new Error("Error checking result existence: " + err.message);
  }
};

// Find a result row by composite keys (StudentID + ExamID + SubjectID)
const findResultByComposite = async (studentId, examId, subjectId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.ResultID,
        r.StudentID,
        r.ExamID,
        r.SubjectID,
        r.ClassID,
        r.MarksObtained
      FROM Results r
      WHERE r.StudentID = ? AND r.ExamID = ? AND r.SubjectID = ?
      LIMIT 1
    `, [studentId, examId, subjectId]);
    return rows[0] || null;
  } catch (err) {
    throw new Error("Error finding result by composite keys: " + err.message);
  }
};

// Get student result summary (all subjects for a specific exam) with complete information
const getStudentResultSummary = async (studentId, examId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.MarksObtained,
        sub.SubjectName,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE r.StudentID = ? AND r.ExamID = ?
      ORDER BY sub.SubjectName
    `, [studentId, examId]);
    return rows;
  } catch (err) {
    throw new Error("Error fetching student result summary: " + err.message);
  }
};

// Search results with comprehensive filters including student name, roll, class, section
const searchResults = async (filters) => {
  try {
    let query = `
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE 1=1
    `;
    const params = [];

    // Search by student name (first name or last name or full name)
    if (filters.studentName) {
      query += ` AND (s.FirstName LIKE ? OR s.LastName LIKE ? OR CONCAT(s.FirstName, ' ', s.LastName) LIKE ?)`;
      const namePattern = `%${filters.studentName}%`;
      params.push(namePattern, namePattern, namePattern);
    }

    // Search by roll number (exact or partial match)
    if (filters.rollNumber) {
      query += ` AND s.RollNumber LIKE ?`;
      params.push(`%${filters.rollNumber}%`);
    }

    // Search by class name (exact or partial match)
    if (filters.className) {
      query += ` AND c.ClassName LIKE ?`;
      params.push(`%${filters.className}%`);
    }

    // Search by section name (exact or partial match)
    if (filters.section) {
      query += ` AND c.Section LIKE ?`;
      params.push(`%${filters.section}%`);
    }

    // Search by exam name
    if (filters.examName) {
      query += ` AND e.ExamName LIKE ?`;
      params.push(`%${filters.examName}%`);
    }

    // Search by subject name
    if (filters.subjectName) {
      query += ` AND sub.SubjectName LIKE ?`;
      params.push(`%${filters.subjectName}%`);
    }

    // Search by exam type
    if (filters.examType) {
      query += ` AND e.ExamType = ?`;
      params.push(filters.examType);
    }

    // Existing ID-based filters (for backward compatibility)
    if (filters.studentId) {
      query += ` AND r.StudentID = ?`;
      params.push(filters.studentId);
    }

    if (filters.examId) {
      query += ` AND r.ExamID = ?`;
      params.push(filters.examId);
    }

    if (filters.subjectId) {
      query += ` AND r.SubjectID = ?`;
      params.push(filters.subjectId);
    }

    if (filters.classId) {
      query += ` AND r.ClassID = ?`;
      params.push(filters.classId);
    }

    // Search by marks range
    if (filters.minMarks) {
      query += ` AND r.MarksObtained >= ?`;
      params.push(filters.minMarks);
    }

    if (filters.maxMarks) {
      query += ` AND r.MarksObtained <= ?`;
      params.push(filters.maxMarks);
    }

    // Search by date range
    if (filters.startDate) {
      query += ` AND e.ExamDate >= ?`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND e.ExamDate <= ?`;
      params.push(filters.endDate);
    }

    // Add ordering
    query += ` ORDER BY e.ExamDate DESC, c.ClassName, s.RollNumber, sub.SubjectName`;

    // Add pagination if provided
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ` OFFSET ?`;
        params.push(parseInt(filters.offset));
      }
    }

    const [rows] = await db.query(query, params);
    return rows;
  } catch (err) {
    throw new Error("Error searching results: " + err.message);
  }
};

// Advanced search with multiple criteria
const advancedSearchResults = async (searchCriteria) => {
  try {
    const {
      studentName,
      rollNumber,
      className,
      section,
      examName,
      subjectName,
      minMarks,
      maxMarks,
      examType,
      startDate,
      endDate,
      sortBy = 'examDate',
      sortOrder = 'DESC',
      limit = 50,
      offset = 0
    } = searchCriteria;

    let query = `
      SELECT 
        r.MarksObtained,
        CONCAT(s.FirstName, ' ', s.LastName) as StudentName,
        s.FirstName,
        s.LastName,
        s.RollNumber,
        e.ExamName,
        e.ExamType,
        e.ExamDate,
        sub.SubjectName,
        c.ClassName,
        c.Section,
        CASE 
          WHEN r.MarksObtained >= 90 THEN 'A+'
          WHEN r.MarksObtained >= 80 THEN 'A'
          WHEN r.MarksObtained >= 70 THEN 'B'
          WHEN r.MarksObtained >= 60 THEN 'C'
          WHEN r.MarksObtained >= 40 THEN 'D'
          ELSE 'F'
        END as Grade,
        CASE 
          WHEN r.MarksObtained >= 40 THEN 'PASS'
          ELSE 'FAIL'
        END as Status
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE 1=1
    `;
    
    const params = [];
    const conditions = [];

    // Build search conditions
    if (studentName) {
      conditions.push(`(s.FirstName LIKE ? OR s.LastName LIKE ? OR CONCAT(s.FirstName, ' ', s.LastName) LIKE ?)`);
      const namePattern = `%${studentName}%`;
      params.push(namePattern, namePattern, namePattern);
    }

    if (rollNumber) {
      conditions.push(`s.RollNumber LIKE ?`);
      params.push(`%${rollNumber}%`);
    }

    if (className) {
      conditions.push(`c.ClassName LIKE ?`);
      params.push(`%${className}%`);
    }

    if (section) {
      conditions.push(`c.Section LIKE ?`);
      params.push(`%${section}%`);
    }

    if (examName) {
      conditions.push(`e.ExamName LIKE ?`);
      params.push(`%${examName}%`);
    }

    if (subjectName) {
      conditions.push(`sub.SubjectName LIKE ?`);
      params.push(`%${subjectName}%`);
    }

    if (examType) {
      conditions.push(`e.ExamType = ?`);
      params.push(examType);
    }

    if (minMarks !== undefined) {
      conditions.push(`r.MarksObtained >= ?`);
      params.push(minMarks);
    }

    if (maxMarks !== undefined) {
      conditions.push(`r.MarksObtained <= ?`);
      params.push(maxMarks);
    }

    if (startDate) {
      conditions.push(`e.ExamDate >= ?`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`e.ExamDate <= ?`);
      params.push(endDate);
    }

    // Add conditions to query
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // Add sorting
    const sortColumns = {
      'examDate': 'e.ExamDate',
      'studentName': 'CONCAT(s.FirstName, " ", s.LastName)',
      'rollNumber': 's.RollNumber',
      'className': 'c.ClassName',
      'marks': 'r.MarksObtained',
      'subjectName': 'sub.SubjectName'
    };

    const sortColumn = sortColumns[sortBy] || 'e.ExamDate';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${order}, s.RollNumber ASC`;

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM Results r
      LEFT JOIN Students s ON r.StudentID = s.StudentID
      LEFT JOIN Exams e ON r.ExamID = e.ExamID
      LEFT JOIN Subjects sub ON r.SubjectID = sub.SubjectID
      LEFT JOIN Classes c ON r.ClassID = c.ClassID
      WHERE 1=1
    `;
    
    if (conditions.length > 0) {
      countQuery += ` AND ${conditions.join(' AND ')}`;
    }
    
    const countParams = params.slice(0, -2); // Remove limit and offset
    const [countRows] = await db.query(countQuery, countParams);
    
    return {
      results: rows,
      total: countRows[0].total,
      limit,
      offset,
      hasMore: (offset + limit) < countRows[0].total
    };
  } catch (err) {
    throw new Error("Error in advanced search: " + err.message);
  }
};

export {
  addMultipleResults,
  addResult,
  addResultByStudentDetails,
  advancedSearchResults,
  checkResultExists, deleteResult,
  deleteResultsByExam, findResultByComposite, getAllResults,
  getResultById,
  getResultCount,
  getResultsByClass,
  getResultsByExam,
  getResultsByStudent,
  getResultsBySubject,
  getStudentResultSummary,
  searchResults,
  updateResult
};

