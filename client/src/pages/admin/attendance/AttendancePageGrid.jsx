import {
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import attendanceAPI from "../../../api/attendanceApi";
import studentAPI from "../../../api/studentApi";
import Sidebar from "../../../components/Sidebar";
import "./AttendancePageGrid.css";

const AttendancePageGrid = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'summary'
  const [studentSummaries, setStudentSummaries] = useState([]);

  // Get current month and year
  const currentDate = new Date();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch students and classes on component mount
  useEffect(() => {
    fetchStudentsAndClasses();
  }, []);

  // Fetch attendance when class/section/month changes
  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchAttendanceData();
    }
  }, [selectedClass, selectedSection, selectedMonth, selectedYear]);

  // Auto-sync setup - automatically refresh data every 30 seconds
  useEffect(() => {
    if (autoSyncEnabled && selectedClass && selectedSection) {
      const interval = setInterval(async () => {
        await performAutoSync();
      }, 30000); // 30 seconds

      setSyncInterval(interval);
      return () => clearInterval(interval);
    }
  }, [selectedClass, selectedSection, autoSyncEnabled]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [syncInterval]);

  const fetchStudentsAndClasses = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAllStudents();

      // Handle different response formats
      const studentsData = response.data || response;
      setStudents(studentsData);

      // Extract unique classes
      const uniqueClasses = studentsData.reduce((acc, student) => {
        const key = `${student.ClassName}-${student.Section}`;
        if (!acc.some((c) => c.key === key)) {
          acc.push({
            key,
            className: student.ClassName,
            section: student.Section,
          });
        }
        return acc;
      }, []);

      setClasses(uniqueClasses);
    } catch (error) {
      setError("Failed to fetch students and classes");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (silent = false) => {
    if (!selectedClass || !selectedSection) return;

    try {
      if (!silent) {
        setLoading(true);
        setError("");
      }

      console.log("Fetching attendance data for:", {
        selectedClass,
        selectedSection,
        selectedMonth,
        selectedYear,
      });

      const response = await attendanceAPI.getAttendanceByClassAndSection(
        selectedClass,
        selectedSection
      );

      console.log("Fetch attendance response:", response);

      if (
        response &&
        (response.success === true || response.success === undefined)
      ) {
        // Transform attendance data into a format suitable for the grid
        const attendanceMap = {};

        // Filter by selected month and year
        const monthStart = new Date(selectedYear, selectedMonth, 1);
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

        // First, initialize ALL student-day combinations as "Absent" (default state)
        const filteredStudents = getFilteredStudents();
        const days = getDaysInMonth(selectedMonth, selectedYear);

        console.log(
          "Initializing attendance for",
          filteredStudents.length,
          "students and",
          days.length,
          "days"
        );

        filteredStudents.forEach((student) => {
          days.forEach((day) => {
            const key = `${student.StudentID}-${formatDate(day)}`;
            attendanceMap[key] = "Absent"; // Default everyone to Absent
          });
        });

        // Then, override with actual database records
        const attendanceData = response.data || response;
        if (Array.isArray(attendanceData)) {
          console.log("Processing", attendanceData.length, "database records");
          attendanceData.forEach((record) => {
            const recordDate = new Date(record.ClassDate);
            if (recordDate >= monthStart && recordDate <= monthEnd) {
              // Format the date consistently to match frontend keys
              const formattedDate = formatDate(recordDate);
              const key = `${record.StudentID}-${formattedDate}`;
              attendanceMap[key] = record.Status;
              console.log(
                "Setting attendance from DB:",
                key,
                "=",
                record.Status
              );
            }
          });
        }

        const totalRecords = Object.keys(attendanceMap).length;
        const presentRecords = Object.values(attendanceMap).filter(
          (status) => status === "Present"
        ).length;

        console.log("Final attendance map:", {
          totalRecords,
          presentRecords,
          absentRecords: totalRecords - presentRecords,
        });

        // Update state with new data
        setAttendance(attendanceMap);
        setLastSyncTime(new Date());

        if (!silent) {
          setSuccess(
            `📊 Data loaded: ${totalRecords} records (${presentRecords} present, ${
              totalRecords - presentRecords
            } absent)`
          );
          setTimeout(() => setSuccess(""), 3000);
        }
      } else {
        throw new Error(response?.message || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Attendance fetch error:", error);
      if (!silent) {
        setError("Failed to fetch attendance data: " + error.message);
        setTimeout(() => setError(""), 5000);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const getFilteredStudents = () => {
    return students
      .filter(
        (student) =>
          student.ClassName === selectedClass &&
          student.Section === selectedSection
      )
      .sort((a, b) => {
        // Safe comparison for RollNumber - handle both string and number types
        const rollA = String(a.RollNumber || '').toLowerCase();
        const rollB = String(b.RollNumber || '').toLowerCase();
        return rollA.localeCompare(rollB, undefined, { numeric: true });
      });
  };

  // Calculate student-wise attendance statistics
  const calculateStudentSummaries = () => {
    const filteredStudents = getFilteredStudents();
    const days = getDaysInMonth(selectedMonth, selectedYear);

    return filteredStudents.map((student) => {
      let presentCount = 0;
      let absentCount = 0;
      let totalDays = 0;

      days.forEach((day) => {
        const today = new Date();
        if (day <= today) {
          // Only count days up to today
          const key = `${student.StudentID}-${formatDate(day)}`;
          const status = attendance[key];

          // Since default is "Absent", count all days
          if (status === "Present") {
            presentCount++;
          } else {
            // Default to absent (includes both explicit "Absent" and undefined)
            absentCount++;
          }
          totalDays++;
        }
      });

      const attendancePercentage =
        totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

      return {
        studentID: student.StudentID,
        firstName: student.FirstName,
        lastName: student.LastName,
        rollNumber: student.RollNumber,
        presentCount,
        absentCount,
        totalDays,
        attendancePercentage,
        status:
          attendancePercentage >= 75
            ? "good"
            : attendancePercentage >= 50
            ? "warning"
            : "poor",
      };
    });
  };

  // Update student summaries when attendance data changes
  useEffect(() => {
    if (
      selectedClass &&
      selectedSection &&
      Object.keys(attendance).length > 0
    ) {
      setStudentSummaries(calculateStudentSummaries());
    }
  }, [attendance, selectedClass, selectedSection, selectedMonth, selectedYear]);

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const toggleAttendance = async (studentId, date) => {
    const key = `${studentId}-${formatDate(date)}`;
    const currentStatus = attendance[key] || "Absent"; // Default to Absent
    let newStatus;

    // Simple toggle logic: Absent → Present, Present → Absent
    if (currentStatus === "Absent") {
      newStatus = "Present";
    } else {
      newStatus = "Absent";
    }

    console.log("Toggle attendance:", {
      studentId,
      date: formatDate(date),
      currentStatus,
      newStatus,
      key,
    });

    // Get student details for display
    const student = getFilteredStudents().find(
      (s) => s.StudentID === studentId
    );
    const studentName = student
      ? `${student.FirstName} ${student.LastName}`
      : "Student";

    // Set saving state immediately
    setSaving(true);

    try {
      // Update database first
      console.log("Calling markAttendance API with:", {
        studentId: parseInt(studentId),
        classDate: formatDate(date),
        status: newStatus,
      });

      const response = await attendanceAPI.markAttendance({
        studentId: parseInt(studentId),
        classDate: formatDate(date),
        status: newStatus,
      });

      console.log("markAttendance API response:", response);

      // Check if the database update was successful
      if (response && response.success) {
        // Update local state immediately after successful database update
        setAttendance((prev) => {
          const newAttendance = {
            ...prev,
            [key]: newStatus,
          };
          console.log("Updated local attendance state:", { key, newStatus });
          return newAttendance;
        });

        // Show success message
        setSuccess(
          `✅ ${studentName} marked ${newStatus.toLowerCase()} for ${date.toLocaleDateString()}`
        );

        // Update sync time
        setLastSyncTime(new Date());

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);

        console.log("Attendance toggle completed successfully");
      } else {
        throw new Error(
          response?.message || "Failed to update attendance - Invalid response"
        );
      }
    } catch (error) {
      console.error("Failed to update attendance:", error);

      // Show error message
      setError(`❌ Failed to update ${studentName}: ${error.message}`);
      setTimeout(() => setError(""), 5000);

      // Optionally refresh data from database to ensure consistency
      try {
        await fetchAttendanceData(true);
      } catch (refreshError) {
        console.error("Failed to refresh data after error:", refreshError);
      }
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = async (date) => {
    const filteredStudents = getFilteredStudents();
    const dateStr = formatDate(date);

    setSaving(true);
    try {
      const updates = filteredStudents.map((student) => ({
        studentId: student.StudentID,
        classDate: dateStr,
        status: "Present",
      }));

      // Update local state optimistically
      const newAttendance = { ...attendance };
      filteredStudents.forEach((student) => {
        newAttendance[`${student.StudentID}-${dateStr}`] = "Present";
      });
      setAttendance(newAttendance);

      // Save to backend with batch processing
      const results = await Promise.allSettled(
        updates.map((update) => attendanceAPI.markAttendance(update))
      );

      // Check for any failures
      const failures = results.filter((result) => result.status === "rejected");

      if (failures.length === 0) {
        setSuccess(
          `Successfully marked all ${
            filteredStudents.length
          } students present for ${date.toLocaleDateString()}`
        );

        // Always refresh data to ensure database synchronization
        await fetchAttendanceData(true);
        setLastSyncTime(new Date());
      } else {
        throw new Error(
          `${failures.length} out of ${filteredStudents.length} updates failed`
        );
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      // Revert changes on error and refresh from database
      setError(`Failed to mark all present: ${error.message}`);
      await fetchAttendanceData(true);
      setTimeout(() => setError(""), 3000);
      console.error("Bulk attendance update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const markAllAbsent = async (date) => {
    const filteredStudents = getFilteredStudents();
    const dateStr = formatDate(date);

    setSaving(true);
    try {
      const updates = filteredStudents.map((student) => ({
        studentId: student.StudentID,
        classDate: dateStr,
        status: "Absent",
      }));

      // Update local state optimistically
      const newAttendance = { ...attendance };
      filteredStudents.forEach((student) => {
        newAttendance[`${student.StudentID}-${dateStr}`] = "Absent";
      });
      setAttendance(newAttendance);

      // Save to backend with batch processing
      const results = await Promise.allSettled(
        updates.map((update) => attendanceAPI.markAttendance(update))
      );

      // Check for any failures
      const failures = results.filter((result) => result.status === "rejected");

      if (failures.length === 0) {
        setSuccess(
          `Successfully marked all ${
            filteredStudents.length
          } students absent for ${date.toLocaleDateString()}`
        );

        // Always refresh data to ensure database synchronization
        await fetchAttendanceData(true);
        setLastSyncTime(new Date());
      } else {
        throw new Error(
          `${failures.length} out of ${filteredStudents.length} updates failed`
        );
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      // Revert changes on error and refresh from database
      setError(`Failed to mark all absent: ${error.message}`);
      await fetchAttendanceData(true);
      setTimeout(() => setError(""), 3000);
      console.error("Bulk attendance update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const getUniqueClassNames = () => {
    return [...new Set(classes.map((c) => c.className))].sort();
  };

  const getSectionsForClass = (className) => {
    return classes
      .filter((c) => c.className === className)
      .map((c) => c.section)
      .sort();
  };

  // Simple auto-sync function
  const performAutoSync = async () => {
    if (!selectedClass || !selectedSection || !autoSyncEnabled) return;
    try {
      await fetchAttendanceData(true);
    } catch (error) {
      console.warn("Auto-sync failed:", error);
    }
  };

  const days = getDaysInMonth(selectedMonth, selectedYear);
  const filteredStudents = getFilteredStudents();

  return (
    <div className="attendance-page">
      <Sidebar />
      <div className="attendance-content">
        <div className="attendance-header">
          <div className="header-content">
            <h1>
              <Calendar className="page-icon" />
              Student Attendance System
            </h1>
            <p className="page-subtitle">
              Smart attendance tracking - All students start as Absent (A).
              Click any cell to mark Present (P).
            </p>
            <div className="header-stats">
              {selectedClass && selectedSection && (
                <div className="class-info">
                  <span className="info-label">Currently Viewing:</span>
                  <span className="info-value">
                    {selectedClass} - Section {selectedSection}
                  </span>
                  <span className="month-info">
                    ({months[selectedMonth]} {selectedYear})
                  </span>
                </div>
              )}
              {lastSyncTime && (
                <div className="sync-info">
                  <span className="sync-status-text">
                    Last updated: {lastSyncTime.toLocaleTimeString()}
                  </span>
                  {autoSyncEnabled && (
                    <span
                      className="auto-sync-indicator"
                      title="Auto-sync is enabled"
                    >
                      🔄 Auto-sync ON
                    </span>
                  )}
                </div>
              )}
              {Object.keys(attendance).length > 0 && (
                <div className="data-info">
                  <span className="data-status">
                    📊 {Object.keys(attendance).length} records loaded
                  </span>
                  <span className="present-count">
                    ✅{" "}
                    {
                      Object.values(attendance).filter(
                        (status) => status === "Present"
                      ).length
                    }{" "}
                    present today
                  </span>
                  <span className="absent-count">
                    ❌{" "}
                    {
                      Object.values(attendance).filter(
                        (status) => status === "Absent"
                      ).length
                    }{" "}
                    absent today
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="attendance-controls">
          <div className="controls-header">
            <h3>Select Class and Time Period</h3>
            <p>
              Choose the class, section, and month to view or mark attendance
            </p>
          </div>

          <div className="controls-row">
            <div className="form-group">
              <label>
                <Users className="label-icon" />
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection("");
                }}
                className="select-input"
              >
                <option value="">Choose a class...</option>
                {getUniqueClassNames().map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Users className="label-icon" />
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="select-input"
              >
                <option value="">Choose a section...</option>
                {selectedClass &&
                  getSectionsForClass(selectedClass).map((section) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Calendar className="label-icon" />
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="select-input"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Calendar className="label-icon" />
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="select-input"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => currentDate.getFullYear() - 2 + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="action-buttons">
              <button
                className="refresh-btn primary-btn"
                onClick={() => fetchAttendanceData()}
                disabled={!selectedClass || !selectedSection}
              >
                Refresh Data
              </button>

              <button
                className={`view-toggle-btn ${
                  viewMode === "summary" ? "active" : ""
                }`}
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "summary" : "grid")
                }
                disabled={!selectedClass || !selectedSection}
              >
                
                {viewMode === "grid" ? "Student Summary" : "Attendance Grid"}
              </button>

              <label className="auto-sync-toggle">
                <input
                  type="checkbox"
                  checked={autoSyncEnabled}
                  onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                />
                <span className="toggle-label">Auto-sync</span>
              </label>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {(saving || loading) && (
          <div className="status-bar">
            <div className="status-content">
              {saving && (
                <span className="status-item saving">
                  <Clock className="status-icon spinning" />
                  Updating attendance record...
                </span>
              )}
              {loading && (
                <span className="status-item loading">
                  <RefreshCw className="status-icon spinning" />
                  Loading data from database...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="error-message">
            <XCircle className="message-icon" />
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle className="message-icon" />
            {success}
          </div>
        )}

        {/* Attendance Content */}
        {selectedClass && selectedSection && (
          <div className="attendance-grid-container">
            <div className="grid-header">
              <div className="grid-title">
                <h3>
                  <Users className="section-icon" />
                  {selectedClass} - Section {selectedSection}
                </h3>
                <p className="grid-subtitle">
                  {months[selectedMonth]} {selectedYear} •{" "}
                  {filteredStudents.length} Students
                </p>
              </div>

              <div className="legend-container">
                <h4>How to use:</h4>
                <div className="legend">
                  <div className="legend-item">
                    <span className="legend-color present"></span>
                    <span>
                      <strong>P</strong> = Present (Green) - Click to mark
                      Present
                    </span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color absent"></span>
                    <span>
                      <strong>A</strong> = Absent (Red) - Default state
                    </span>
                  </div>
                </div>
                <p className="legend-help">
                  💡 <strong>How it works:</strong> All students start as
                  Absent. Click any cell to toggle: Absent (A) → Present (P) →
                  Absent (A)
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <Clock className="loading-icon spinning" />
                <p>Loading attendance data...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <Users className="empty-icon" />
                <p>No students found for selected class and section</p>
                <small>
                  Please check if students are enrolled in this class
                </small>
              </div>
            ) : (
              <>
                {/* Student Summary View */}
                {viewMode === "summary" && (
                  <div className="student-summary-container">
                    <div className="summary-header">
                      <h4>Student-wise Attendance Summary</h4>
                      <p>
                        Overview of each student's attendance for{" "}
                        {months[selectedMonth]} {selectedYear}
                      </p>
                    </div>

                    <div className="summary-grid">
                      {studentSummaries.map((summary) => (
                        <div
                          key={summary.studentID}
                          className={`student-summary-card ${summary.status}`}
                        >
                          <div className="student-header">
                            <h5>
                              {summary.firstName} {summary.lastName}
                            </h5>
                            <span className="roll-number">
                              Roll: {summary.rollNumber}
                            </span>
                          </div>

                          <div className="attendance-stats">
                            <div className="stat-row">
                              <span className="stat-label">Present:</span>
                              <span className="stat-value present">
                                {summary.presentCount} days
                              </span>
                            </div>
                            <div className="stat-row">
                              <span className="stat-label">Absent:</span>
                              <span className="stat-value absent">
                                {summary.absentCount} days
                              </span>
                            </div>
                            <div className="stat-row">
                              <span className="stat-label">Total:</span>
                              <span className="stat-value total">
                                {summary.totalDays} days
                              </span>
                            </div>
                          </div>

                          <div className="attendance-percentage">
                            <div className="percentage-circle">
                              <span className="percentage-value">
                                {summary.attendancePercentage}%
                              </span>
                            </div>
                            <div className="percentage-bar">
                              <div
                                className="percentage-fill"
                                style={{
                                  width: `${summary.attendancePercentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className={`status-badge ${summary.status}`}>
                            {summary.status === "good" && "✓ Good Attendance"}
                            {summary.status === "warning" &&
                              "⚠ Needs Attention"}
                            {summary.status === "poor" && "⚠ Poor Attendance"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance Grid View */}
                {viewMode === "grid" && (
                  <div className="grid-view-container">
                    <div className="grid-header">
                      <h4>Attendance Grid</h4>
                      <p>
                        Interactive attendance grid for {months[selectedMonth]}{" "}
                        {selectedYear}
                      </p>
                    </div>

                    <div className="grid-legend">
                      <div className="legend">
                        <div className="legend-item">
                          <span className="legend-color present"></span>
                          <span>
                            <strong>P</strong> = Present (Green)
                          </span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color absent"></span>
                          <span>
                            <strong>A</strong> = Absent (Red)
                          </span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color today"></span>
                          <span>Today's date (Blue border)</span>
                        </div>
                      </div>
                      <p className="legend-help">
                        💡 <strong>Tip:</strong> Click on any student's date
                        cell to toggle between Present and Absent
                      </p>
                    </div>

                    {loading ? (
                      <div className="loading-state">
                        <Clock className="loading-icon spinning" />
                        <p>Loading attendance data...</p>
                        <div className="loading-progress"></div>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="empty-state">
                        <Users className="empty-icon" />
                        <h3>No Students Found</h3>
                        <p>
                          No students found for{" "}
                          <strong>
                            {selectedClass} - Section {selectedSection}
                          </strong>
                        </p>
                        <p>
                          Please check if you have selected the correct class
                          and section.
                        </p>
                      </div>
                    ) : (
                      <div className="attendance-table-wrapper">
                        <div className="table-controls">
                          <div className="table-info">
                            <span>
                              Showing {filteredStudents.length} students for{" "}
                              {days.length} days
                            </span>
                          </div>
                        </div>

                        <table
                          className="attendance-table"
                          key={`attendance-${Object.keys(attendance).length}`}
                        >
                          <thead>
                            <tr>
                              <th className="student-header">
                                <div className="header-content">
                                  <span className="header-label">
                                    Student Information
                                  </span>
                                  <span className="month-year">
                                    {months[selectedMonth]} {selectedYear}
                                  </span>
                                </div>
                              </th>
                              {days.map((day) => (
                                <th
                                  key={day.toISOString()}
                                  className="date-header"
                                >
                                  <div className="date-cell">
                                    <div className="date-number">
                                      {day.getDate()}
                                    </div>
                                    <div className="date-day">
                                      {day.toLocaleDateString("en", {
                                        weekday: "short",
                                      })}
                                    </div>
                                    <div className="date-actions">
                                      <button
                                        className="mark-all-btn present"
                                        onClick={() => markAllPresent(day)}
                                        disabled={saving}
                                        title={`Mark all students present for ${day.toLocaleDateString()}`}
                                      >
                                        All P
                                      </button>
                                      <button
                                        className="mark-all-btn absent"
                                        onClick={() => markAllAbsent(day)}
                                        disabled={saving}
                                        title={`Mark all students absent for ${day.toLocaleDateString()}`}
                                      >
                                        All A
                                      </button>
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((student, index) => (
                              <tr
                                key={student.StudentID}
                                className={
                                  index % 2 === 0 ? "even-row" : "odd-row"
                                }
                              >
                                <td className="student-name-cell">
                                  <div className="student-info">
                                    <div className="student-avatar">
                                      {student.FirstName.charAt(0)}
                                      {student.LastName.charAt(0)}
                                    </div>
                                    <div className="student-details">
                                      <div className="student-name">
                                        {student.FirstName} {student.LastName}
                                      </div>
                                      <div className="student-meta">
                                        <span className="student-roll">
                                          Roll: {student.RollNumber}
                                        </span>
                                        <span className="student-number">
                                          #{index + 1}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                {days.map((day) => {
                                  const key = `${
                                    student.StudentID
                                  }-${formatDate(day)}`;
                                  const status = attendance[key] || "absent"; // Default to absent if not set
                                  const isToday =
                                    formatDate(day) === formatDate(new Date());
                                  const isPastDate = day < new Date();

                                  return (
                                    <td
                                      key={day.toISOString()}
                                      className={`attendance-cell ${status.toLowerCase()} ${
                                        isToday ? "today" : ""
                                      } ${
                                        isPastDate ? "past-date" : "future-date"
                                      } ${saving ? "updating" : ""}`}
                                    >
                                      <button
                                        className={`attendance-btn ${status.toLowerCase()} ${
                                          saving ? "saving" : ""
                                        }`}
                                        onClick={() => {
                                          console.log(
                                            "Button clicked for:",
                                            student.FirstName,
                                            formatDate(day),
                                            "Current status:",
                                            status
                                          );
                                          toggleAttendance(
                                            student.StudentID,
                                            day
                                          );
                                        }}
                                        title={`${student.FirstName} ${
                                          student.LastName
                                        } - ${day.toLocaleDateString()} - Currently: ${status} - Click to toggle`}
                                        disabled={saving}
                                      >
                                        <span className="status-text">
                                          {status === "Present" ? "P" : "A"}
                                        </span>
                                        {saving && (
                                          <div className="btn-loading-spinner"></div>
                                        )}
                                        <div className="btn-ripple"></div>
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="help-section">
          <div className="help-content">
            <h4>📚 How to Use the Attendance System</h4>
            <div className="help-grid">
              <div className="help-item">
                <div className="help-icon">🎯</div>
                <div className="help-text">
                  <strong>Step 1:</strong> Select your class and section from
                  the dropdowns above
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">📅</div>
                <div className="help-text">
                  <strong>Step 2:</strong> Choose the month and year you want to
                  view or mark attendance for
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">👆</div>
                <div className="help-text">
                  <strong>Step 3:</strong> All students start as Absent (A).
                  Click any cell to mark Present (P)
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">🔄</div>
                <div className="help-text">
                  <strong>Toggle System:</strong> Click repeatedly to toggle:
                  Absent (A) → Present (P) → Absent (A)
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">⚡</div>
                <div className="help-text">
                  <strong>Quick Actions:</strong> Use "All P" or "All A" buttons
                  in date headers to mark entire day
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">💾</div>
                <div className="help-text">
                  <strong>Auto-Save:</strong> All changes are saved
                  automatically - no need to click save!
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">🔄</div>
                <div className="help-text">
                  <strong>Real-time:</strong> The grid updates automatically to
                  show the latest data
                </div>
              </div>
            </div>

            <div className="keyboard-shortcuts">
              <h5>💡 Pro Tips:</h5>
              <ul>
                <li>
                  📍 <strong>Default State:</strong> All students automatically
                  start as <span className="highlight-absent">Absent (A)</span>
                </li>
                <li>
                  🔄 <strong>Toggle System:</strong> Click any cell to toggle
                  between Absent (A) and Present (P)
                </li>
                <li>
                  🕒 Today's date has a{" "}
                  <span className="highlight-today">blue border</span> for easy
                  identification
                </li>
                <li>
                  🎯 <strong>Visual Guide:</strong> Red cells = Absent, Green
                  cells = Present
                </li>
                <li>
                  ⚡ <strong>Quick Actions:</strong> Use "All P" or "All A"
                  buttons to mark entire day at once
                </li>
                <li>
                  💾 <strong>Auto-Save:</strong> All changes save automatically
                  - no save button needed!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePageGrid;
