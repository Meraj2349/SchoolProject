import { useEffect, useState } from 'react';
import {
  FaBookOpen,
  FaCalculator,
  FaCheck,
  FaGraduationCap,
  FaSave,
  FaTimes,
  FaUser
} from 'react-icons/fa';
import examsApi from '../../../api/examsApi';
import resultApi from '../../../api/resultApi';
import studentAPI from '../../../api/studentApi';
import LottieLoader from '../../../components/LottieLoader';
import Sidebar from '../../../components/Sidebar';
import './StudentResultEntry.css';

const isDevelopment = import.meta.env.DEV;

const StudentResultEntry = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingResultId, setEditingResultId] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    className: '',
    section: '',
    examName: '',
    subjectName: '',
    marksObtained: '',
    totalMarks: 100
  });

  // Dropdown data
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  
  // Search and validation
  const [studentFound, setStudentFound] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // Existing result (if same student + exam + subject exists in DB)
  const [dbExistingResult, setDbExistingResult] = useState(null);

  // Show smart notifications
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  // Load dropdown data on component mount
  useEffect(() => {
    loadDropdownData();
  }, []);

  // Check if a result already exists for the selected student/exam/subject
  useEffect(() => {
    const checkIfResultExists = async () => {
      try {
        if (!studentFound?.StudentID || !formData.examName || !formData.subjectName) {
          setDbExistingResult(null);
          return;
        }
        // Resolve IDs based on current selections
        const selectedClass = classes.find(c => c.ClassName === formData.className && c.Section === formData.section);
        const selectedExam = (filteredExams.length > 0 ? filteredExams : exams).find(e => e.ExamName === formData.examName);
        const selectedSubject = (filteredSubjects.length > 0 ? filteredSubjects : subjects).find(s => s.SubjectName === formData.subjectName);

        if (!selectedExam?.ExamID || !selectedSubject?.SubjectID) {
          setDbExistingResult(null);
          return;
        }

        const existsCheck = await resultApi.checkResultExists(
          studentFound.StudentID,
          selectedExam.ExamID,
          selectedSubject.SubjectID
        );
        if (existsCheck?.success && existsCheck?.data?.exists) {
          setDbExistingResult(existsCheck.data.result || { ResultID: existsCheck.data.resultId });
        } else {
          setDbExistingResult(null);
        }
      } catch (e) {
        // On error, don't block UI; just clear existing marker
        setDbExistingResult(null);
      }
    };

    checkIfResultExists();
  }, [studentFound, formData.examName, formData.subjectName, formData.className, formData.section, classes, exams, subjects, filteredExams, filteredSubjects]);

  const loadDropdownData = async () => {
    try {
      // Load students
      const studentsResponse = await studentAPI.getAllStudents();
      if (studentsResponse.success) {
        setStudents(studentsResponse.data || []);
      }

      // Load classes using studentAPI like in StudentPage
      try {
        const response = await studentAPI.getAllClasses();
        console.log('Classes API Response:', response); // Debug log
        if (response.success) {
          console.log('Classes data:', response.data); // Debug log
          setClasses(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load classes:', error);
      }

      // Load all subjects
      try {
        const response = await fetch('http://localhost:3000/api/subjects');
        const subjectsData = await response.json();
        console.log('Subjects API Response:', subjectsData); // Debug log
        if (Array.isArray(subjectsData)) {
          console.log('Subjects data:', subjectsData); // Debug log
          setSubjects(subjectsData || []);
        }
      } catch (error) {
        console.error('Failed to load subjects:', error);
      }

      // Load all exams using examsApi
      try {
        const examsData = await examsApi.getAllExams();
        console.log('Exams API Response:', examsData); // Debug log
        if (examsData.success && examsData.data) {
          console.log('Exams data:', examsData.data); // Debug log
          setExams(examsData.data || []);
        }
      } catch (error) {
        console.error('Failed to load exams:', error);
        // Fallback to mock data if API fails
        setExams([
          { ExamID: 1, ExamName: 'Mid Term Exam 2025', ExamDate: '2025-02-15', ExamType: 'Monthly' },
          { ExamID: 2, ExamName: 'Final Exam 2025', ExamDate: '2025-05-15', ExamType: 'Final' },
          { ExamID: 3, ExamName: 'Unit Test 1', ExamDate: '2025-01-20', ExamType: 'Monthly' },
          { ExamID: 4, ExamName: 'Monthly Test', ExamDate: '2025-03-10', ExamType: 'Monthly' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  // Select student from dropdown
  const selectStudent = (student) => {
    console.log('Selected student object:', student); // Debug log
    setFormData(prev => ({
      ...prev,
      firstName: student.FirstName || student.firstname,
      lastName: student.LastName || student.lastname || '',
      rollNumber: student.RollNumber || student.rollnumber,
      className: student.ClassName || student.classname || prev.className,
      section: student.Section || student.section || prev.section
    }));
    setStudentFound(student);
    setSuccess(`Student selected: ${student.FirstName || student.firstname} ${student.LastName || student.lastname || ''}`);
    setError('');
  };

  // Calculate grade based on marks
  const calculateGrade = (marksObtained, totalMarks = 100) => {
    const percentage = (marksObtained / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  // Get grade class for styling
  const getGradeClass = (grade) => {
    const gradeMap = {
      'A+': 'grade-a-plus',
      'A': 'grade-a',
      'B+': 'grade-b-plus',
      'B': 'grade-b',
      'C+': 'grade-c-plus',
      'C': 'grade-c',
      'D': 'grade-d',
      'F': 'grade-f'
    };
    return gradeMap[grade] || 'grade-f';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentFound) {
      setError('Please select a student first');
      return;
    }

    if (!formData.examName || !formData.subjectName) {
      setError('Please select exam and subject');
      return;
    }

    setLoading(true);
    try {
      const grade = calculateGrade(formData.marksObtained, formData.totalMarks);
      
      // Find the correct IDs from the database
      const selectedClass = classes.find(c => c.ClassName === formData.className && c.Section === formData.section);
      const selectedExam = (filteredExams.length > 0 ? filteredExams : exams).find(e => e.ExamName === formData.examName);
      const selectedSubject = (filteredSubjects.length > 0 ? filteredSubjects : subjects).find(s => s.SubjectName === formData.subjectName);

      // Ensure valid mappings exist, avoid defaulting to invalid IDs
      if (!selectedClass?.ClassID) {
        showNotification('error', 'Please select a valid Class and Section.');
        setLoading(false);
        return;
      }
      if (!selectedExam?.ExamID) {
        showNotification('error', 'Please select a valid Exam.');
        setLoading(false);
        return;
      }
      if (!selectedSubject?.SubjectID) {
        showNotification('error', 'Please select a valid Subject.');
        setLoading(false);
        return;
      }

      const parsedMarks = parseFloat(formData.marksObtained);
      if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > formData.totalMarks) {
        showNotification('error', `Marks must be a number between 0 and ${formData.totalMarks}.`);
        setLoading(false);
        return;
      }

      const resultData = {
        StudentID: studentFound.StudentID,
        ExamID: selectedExam.ExamID,
        SubjectID: selectedSubject.SubjectID,
        ClassID: selectedClass.ClassID,
        MarksObtained: parsedMarks,
        // Add additional fields that might be needed
        grade: grade
      };

      if (isDevelopment) {
        console.log('=== DEBUG INFO ===');
        console.log('Selected Class:', selectedClass);
        console.log('Selected Exam:', selectedExam);
        console.log('Selected Subject:', selectedSubject);
        console.log('Student Found:', studentFound);
        console.log('Form Data:', formData);
        console.log('Final Result Data:', resultData);
        console.log('==================');
      }

      // Check if result already exists before adding
      try {
        const existsCheck = await resultApi.checkResultExists(
          resultData.StudentID, 
          resultData.ExamID, 
          resultData.SubjectID
        );
        
        if (isDevelopment) console.log('Exists check response:', existsCheck); // Debug log
        
        if (existsCheck.success && existsCheck.data && existsCheck.data.exists && !editMode) {
          const confirmUpdate = confirm(
            `⚠️ Result already exists for ${studentFound.FirstName} ${studentFound.LastName || ''} in ${formData.subjectName} - ${formData.examName}.\n\nDo you want to update the existing result?`
          );
          
          if (!confirmUpdate) {
            setLoading(false);
            return;
          }
          
          // Set edit mode and continue with update
          setEditMode(true);
        }
      } catch (checkError) {
        if (isDevelopment) console.log('Check exists error:', checkError); // Continue with add if check fails
      }

      let response;
      // Decide update vs add. If editMode+id OR existing in DB, perform update
      const effectiveUpdateId = (editMode && editingResultId) ? editingResultId : (dbExistingResult?.ResultID || null);
      if (effectiveUpdateId) {
        // Update existing result
        response = await resultApi.updateResult(effectiveUpdateId, resultData);
        if (response && response.success) {
          showNotification('success', '✅ Result updated successfully!');
          setEditMode(false);
          setEditingResultId(null);
          setDbExistingResult(null);
          resetForm();
        } else {
          showNotification('error', response?.message || 'Failed to update result');
        }
      } else {
        // Add new result
        response = await resultApi.addResult(resultData);
        if (response && response.success) {
          showNotification('success', '✅ Result added successfully!');
          resetForm();
        } else {
          showNotification('error', response?.message || 'Failed to add result');
        }
      }
    } catch (error) {
      if (isDevelopment) console.error('Submit error:', error); // Debug log
      
      // Handle different error formats
      let errorMessage = editMode ? 'Failed to update result' : 'Failed to add result';
      
      if (error.message && error.message.includes('Result already exists')) {
        errorMessage = `⚠️ Result already exists for ${studentFound.FirstName} ${studentFound.LastName || ''} in ${formData.subjectName} - ${formData.examName}.`;
      } else if (error.success === false && error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete result function
  const handleDeleteResult = async (resultId) => {
    const confirmDelete = confirm('⚠️ Are you sure you want to delete this result? This action cannot be undone.');
    
    if (!confirmDelete) return;
    
    setLoading(true);
    try {
      const response = await resultApi.deleteResult(resultId);
      if (response && response.success) {
        showNotification('success', '✅ Result deleted successfully!');
        setDbExistingResult(null);
        resetForm();
      } else {
        showNotification('error', response?.message || 'Failed to delete result');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to delete result');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      rollNumber: '',
      className: '',
      section: '',
      examName: '',
      subjectName: '',
      marksObtained: '',
      totalMarks: 100
    });
    setStudentFound(null);
    setError('');
    setSuccess('');
    setEditMode(false);
    setEditingResultId(null);
  };

  // Filter subjects by class
  const filterSubjectsByClass = (className, section) => {
    if (!className || !classes.length || !subjects.length) {
      setFilteredSubjects([]);
      return;
    }

    // Find the ClassID for the selected class and section
    const selectedClass = classes.find(c => c.ClassName === className && c.Section === section);
    if (!selectedClass) {
      setFilteredSubjects([]);
      return;
    }

    // Filter subjects by ClassID
    const classSubjects = subjects.filter(subject => subject.ClassID === selectedClass.ClassID);
    setFilteredSubjects(classSubjects);
    console.log('Filtered subjects for class', className, 'section', section, ':', classSubjects);
  };

  // Filter exams by class
  const filterExamsByClass = (className, section) => {
    if (!className || !classes.length || !exams.length) {
      setFilteredExams([]);
      return;
    }

    // Find the ClassID for the selected class and section
    const selectedClass = classes.find(c => c.ClassName === className && c.Section === section);
    if (!selectedClass) {
      setFilteredExams([]);
      return;
    }

    // Filter exams by ClassID
    const classExams = exams.filter(exam => exam.ClassID === selectedClass.ClassID);
    setFilteredExams(classExams);
    console.log('Filtered exams for class', className, 'section', section, ':', classExams);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset section when class changes (following StudentPage pattern)
      if (field === 'className') {
        newData.section = '';
        newData.subjectName = '';
        newData.examName = '';
        // Load students for the selected class
        loadStudentSuggestions(value, '');
        // Clear filtered data
        setFilteredSubjects([]);
        setFilteredExams([]);
      }
      
      // Load students and filter subjects/exams when section changes
      if (field === 'section') {
        newData.subjectName = '';
        newData.examName = '';
        loadStudentSuggestions(prev.className, value);
        // Filter subjects and exams for this class-section combination
        if (prev.className && value) {
          filterSubjectsByClass(prev.className, value);
          filterExamsByClass(prev.className, value);
        }
      }
      
      return newData;
    });
    
    // Reset student found when class/section changes
    if (['className', 'section'].includes(field)) {
      setStudentFound(null);
    }
  };

  // Helper functions for dropdowns (following StudentPage pattern)
  const getUniqueClasses = () => {
    return [...new Set(classes.map(c => c.ClassName).filter(Boolean))].sort();
  };

  const getUniqueSections = (className) => {
    const sections = classes
      .filter(c => c.ClassName === className)
      .map(c => c.Section)
      .filter(Boolean)
      .sort();
    console.log('Sections for class', className, ':', sections, 'from classes:', classes);
    return sections;
  };

  // Load students by class and section
  const loadStudentSuggestions = async (className, section) => {
    if (!className) {
      setFilteredStudents([]);
      setShowSuggestions(false);
      return;
    }

    try {
      let response;
      if (section) {
        // Load students by class and section
        console.log('Loading students for:', { className, section }); // Debug log
        response = await studentAPI.getStudentsByClassAndSection(className, section);
      } else {
        // Load students by class only
        console.log('Loading students for class only:', className); // Debug log
        response = await studentAPI.getStudentsByClass(className);
      }

      if (response.success) {
        console.log('Loaded students response:', response.data); // Debug log
        setFilteredStudents(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load student suggestions:', error);
    }
  };

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const currentGrade = formData.marksObtained ? calculateGrade(formData.marksObtained, formData.totalMarks) : '';
  const currentPercentage = formData.marksObtained ? ((formData.marksObtained / formData.totalMarks) * 100).toFixed(1) : '';

  return (
    <div className="result-entry-container">
      <Sidebar />
      
      <div className="result-main-content">
        <div className="result-content-wrapper">

          {/* Header */}
          <div className="result-header">
            <div className="result-header-content">
              <div className="result-header-icon">
                <FaGraduationCap />
              </div>
              <div className="result-header-text">
                <h1>Student Result Entry</h1>
                <p>Enter student information and exam results with ease</p>
                {studentFound && (
                  <div className="student-header-info">
                    <div className="student-name-display">
                      📚 <strong>{studentFound.FirstName || studentFound.firstname} {studentFound.LastName || studentFound.lastname || ''}</strong>
                    </div>
                    <div className="student-roll-display">
                      🎯 Roll: <strong>{studentFound.RollNumber || studentFound.rollnumber}</strong> | Class: <strong>{classes.find(c => c.ClassID === studentFound.ClassID)?.ClassName} {classes.find(c => c.ClassID === studentFound.ClassID)?.Section}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="alert alert-error">
              <FaTimes />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <FaCheck />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Student Information Section */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">
                  <FaUser />
                </div>
                <h2 className="section-title">Student Information</h2>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label required">Class</label>
                  <select
                    value={formData.className}
                    onChange={(e) => handleInputChange('className', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select Class</option>
                    {getUniqueClasses().map(className => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    className="form-select"
                    disabled={!formData.className}
                    required
                  >
                    <option value="">Select Section</option>
                    {formData.className && getUniqueSections(formData.className).map(section => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Select Student</label>
                  <select
                    value={studentFound ? studentFound.StudentID : ''}
                    onChange={(e) => {
                      const selectedStudent = filteredStudents.find(s => s.StudentID === parseInt(e.target.value));
                      if (selectedStudent) {
                        selectStudent(selectedStudent);
                      }
                    }}
                    className="form-select"
                    required
                    disabled={!formData.className || !formData.section}
                  >
                    <option value="">Select Student</option>
                    {filteredStudents.map(student => (
                      <option key={student.StudentID || student.studentid} value={student.StudentID || student.studentid}>
                        {student.FirstName || student.firstname} {student.LastName || student.lastname || ''} - Roll: {student.RollNumber || student.rollnumber}
                      </option>
                    ))}
                  </select>
                  {formData.className && getUniqueSections(formData.className).length === 0 && (
                    <small className="text-muted">No sections available for selected class</small>
                  )}
                  {formData.className && formData.section && (
                    <div className="class-section-info">
                      <span className="info-icon">✓</span>
                      <span className="info-text">Selected: {formData.className} - Section {formData.section}</span>
                    </div>
                  )}
                </div>


              </div>



              {/* Student Verification Status */}
              {studentFound && (
                <div className="student-verification verified">
                  <div className="verification-content">
                    <div className="verification-icon success">
                      <FaCheck />
                    </div>
                    <div className="verification-text success">
                      <h3>✅ Student Verified Successfully</h3>
                      <div className="student-details-card">
                        <div className="student-info-row">
                          <div className="info-item">
                            <span className="info-label">👤 Full Name:</span>
                            <span className="info-value">{studentFound.FirstName || studentFound.firstname} {studentFound.LastName || studentFound.lastname || ''}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">🎯 Roll Number:</span>
                            <span className="info-value">{studentFound.RollNumber || studentFound.rollnumber}</span>
                          </div>
                        </div>
                        <div className="student-info-row">
                          <div className="info-item">
                            <span className="info-label">📚 Class:</span>
                            <span className="info-value">{classes.find(c => c.ClassID === studentFound.ClassID)?.ClassName}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">🏫 Section:</span>
                            <span className="info-value">{classes.find(c => c.ClassID === studentFound.ClassID)?.Section}</span>
                          </div>
                        </div>
                        <div className="student-info-row">
                          <div className="info-item">
                            <span className="info-label">🆔 Student ID:</span>
                            <span className="info-value">{studentFound.StudentID}</span>
                          </div>
                          {studentFound.Gender && (
                            <div className="info-item">
                              <span className="info-label">{studentFound.Gender === 'Male' ? '👨' : '👩'} Gender:</span>
                              <span className="info-value">{studentFound.Gender}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Exam Information Section */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon purple">
                  <FaBookOpen />
                </div>
                <h2 className="section-title">Exam Information</h2>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Exam Name</label>
                  <select
                    value={formData.examName}
                    onChange={(e) => handleInputChange('examName', e.target.value)}
                    className="form-select"
                    required
                    disabled={!formData.className || !formData.section}
                  >
                    <option value="">Select Exam</option>
                    {(filteredExams.length > 0 ? filteredExams : exams).map(exam => (
                      <option key={exam.ExamID} value={exam.ExamName}>
                        {exam.ExamName} ({exam.ExamType}) - {new Date(exam.ExamDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  {!formData.className || !formData.section ? (
                    <div className="dropdown-helper-text">
                      <span className="helper-icon">ℹ️</span>
                      Please select class and section first to see available exams
                    </div>
                  ) : filteredExams.length === 0 ? (
                    <small className="text-muted">Showing all exams (no class-specific exams found)</small>
                  ) : (
                    <small className="text-muted">{filteredExams.length} exam(s) available for {formData.className} - Section {formData.section}</small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Subject</label>
                  <select
                    value={formData.subjectName}
                    onChange={(e) => handleInputChange('subjectName', e.target.value)}
                    className="form-select"
                    required
                    disabled={!formData.className || !formData.section}
                  >
                    <option value="">Select Subject</option>
                    {(filteredSubjects.length > 0 ? filteredSubjects : subjects).map(subject => (
                      <option key={subject.SubjectID} value={subject.SubjectName}>
                        {subject.SubjectName}
                      </option>
                    ))}
                  </select>
                  {!formData.className || !formData.section ? (
                    <div className="dropdown-helper-text">
                      <span className="helper-icon">ℹ️</span>
                      Please select class and section first to see available subjects
                    </div>
                  ) : filteredSubjects.length === 0 ? (
                    <small className="text-muted">No subjects found for selected class and section</small>
                  ) : (
                    <small className="text-muted">{filteredSubjects.length} subject(s) available for {formData.className} - Section {formData.section}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Marks Information Section */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon green">
                  <FaCalculator />
                </div>
                <h2 className="section-title">Marks Information</h2>
              </div>

              <div className="form-grid-4">
                <div className="form-group">
                  <label className="form-label required">Marks Obtained</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={formData.totalMarks}
                    value={formData.marksObtained}
                    onChange={(e) => handleInputChange('marksObtained', e.target.value)}
                    className="form-input"
                    placeholder="Obtained marks"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Total Marks</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.totalMarks}
                    onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Grade Display */}
              {currentGrade && (
                <div className="grade-display">
                  <div className={`grade-card ${getGradeClass(currentGrade)}`}>
                    <div className="grade-label">Grade</div>
                    <div className="grade-value">{currentGrade}</div>
                  </div>
                  <div className="grade-card">
                    <div className="grade-label">Percentage</div>
                    <div className="grade-value">{currentPercentage}%</div>
                  </div>
                </div>
              )}


            </div>

            {/* Result Summary Section */}
            {studentFound && formData.examName && formData.subjectName && formData.marksObtained && (
              <div className="result-summary-section">
                <div className="section-header">
                  <div className="section-icon purple">
                    <FaBookOpen />
                  </div>
                  <h2 className="section-title">📋 Result Summary</h2>
                </div>
                <div className="summary-card">
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">👤 Student:</span>
                      <span className="summary-value">{studentFound.FirstName || studentFound.firstname} {studentFound.LastName || studentFound.lastname || ''}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">🎯 Roll:</span>
                      <span className="summary-value">{studentFound.RollNumber || studentFound.rollnumber}</span>
                    </div>
                  </div>
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">📚 Class:</span>
                      <span className="summary-value">{formData.className} - Section {formData.section}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">📝 Exam:</span>
                      <span className="summary-value">{formData.examName}</span>
                    </div>
                  </div>
                  <div className="summary-row">
                    <div className="summary-item">
                      <span className="summary-label">📖 Subject:</span>
                      <span className="summary-value">{formData.subjectName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">📊 Marks:</span>
                      <span className="summary-value highlight">{formData.marksObtained}/{formData.totalMarks} ({currentPercentage}% - Grade {currentGrade})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Section */}
            <div className="action-buttons">
              <button
                type="button"
                onClick={() => {
                  if (dbExistingResult?.ResultID) {
                    handleDeleteResult(dbExistingResult.ResultID);
                  } else {
                    resetForm();
                  }
                }}
                className={`btn ${dbExistingResult?.ResultID ? 'btn-danger' : 'btn-secondary'}`}
              >
                <FaTimes />
                {dbExistingResult?.ResultID ? 'Delete Result' : 'Reset Form'}
              </button>
              
              <button
                type="submit"
                disabled={loading || !studentFound}
                className="btn btn-success"
              >
                {loading ? (
                  <>
                    <LottieLoader size="small" type="spinner" showText={false} />
                    {(editMode || dbExistingResult?.ResultID) ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <FaSave />
                    {(editMode || dbExistingResult?.ResultID) ? 'Update Result' : 'Save Result'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Smart Notification */}
      {notification.show && (
        <div className={`smart-notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-message">{notification.message}</div>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, type: '', message: '' })}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResultEntry;