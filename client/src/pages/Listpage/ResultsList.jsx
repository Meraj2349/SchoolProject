import { useEffect, useMemo, useState } from "react";
import examsApi from "../../api/examsApi";
import imageService from "../../api/imageService";
import resultApi from "../../api/resultApi";
import "../../assets/styles/StudentListpage.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import LatestUpdatesNotice from "./LatestUpdatesNotice";

const StudentImage = ({ studentId, firstName, lastName }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        console.log('Fetching image for student ID:', studentId);
        const response = await imageService.getImagesByStudent(studentId);
        console.log('Image API response:', response);
        if (response && Array.isArray(response) && response.length > 0) {
          console.log('Setting image URL:', response[0].ImagePath);
          setImageUrl(response[0].ImagePath);
        } else {
          console.log('No image found for student:', studentId);
        }
      } catch (error) {
        console.log('Error fetching image for student:', studentId, error);
      }
    };
    if (studentId) fetchImage();
  }, [studentId]);

  return imageUrl ? (
    <img 
      src={imageUrl} 
      alt={`${firstName} ${lastName}`}
      style={{
        width: "60px", 
        height: "60px", 
        objectFit: "cover", 
        borderRadius: "50%",
        border: "2px solid #e5e7eb",
        display: "block"
      }}
      onError={() => setImageUrl(null)}
    />
  ) : (
    <div className="avatar-placeholder" style={{
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f3f4f6",
      color: "#6b7280",
      fontSize: "1.2rem",
      fontWeight: "bold"
    }}>
      {firstName?.charAt(0)}{lastName?.charAt(0)}
    </div>
  );
};

// Results search and listing page (modeled after StudentList)
const ResultsList = () => {
	console.log('ResultsList component is rendering');
	const [searchFilters, setSearchFilters] = useState({
		firstName: "",
		rollNumber: "",
		className: "",
		section: "",
		examName: "",
	});

	const [rows, setRows] = useState([]); // flat rows: one per subject
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [searched, setSearched] = useState(false);

	// Exam suggestions state
	const [exams, setExams] = useState([]);
	const [filteredExams, setFilteredExams] = useState([]);
	const [showExamSuggest, setShowExamSuggest] = useState(false); // false = text input, true = dropdown

	useEffect(() => {
		// Preload exams once for fast suggestions
		const loadExams = async () => {
			try {
				const res = await examsApi.getAllExams();
				if (res?.success && Array.isArray(res.data)) {
					setExams(res.data);
					setFilteredExams(res.data);
				}
			} catch (e) {
				console.warn("Failed to load exams for suggestions", e);
			}
		};
		loadExams();
	}, []);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const updatedFilters = { ...searchFilters, [name]: value };
		setSearchFilters(updatedFilters);

		// Check if other required fields are filled (except examName)
		const otherFieldsFilled = 
			updatedFilters.firstName?.trim() &&
			updatedFilters.rollNumber?.trim() &&
			updatedFilters.className?.trim() &&
			updatedFilters.section?.trim();

		if (name === "examName" && otherFieldsFilled && !showExamSuggest) {
			// Live filter exams when in text input mode
			const q = (value || "").toLowerCase();
			if (q && exams.length > 0) {
				setFilteredExams(
					exams.filter((ex) => ex.ExamName?.toLowerCase().includes(q))
				);
			} else {
				setFilteredExams(exams);
			}
		}
	};

	const handleSearch = async (e) => {
		e.preventDefault();

		// Require all fields like StudentList for accurate search
		const allFieldsFilled = Object.values(searchFilters).every(
			(v) => v && v.trim() !== ""
		);
		if (!allFieldsFilled) {
			setError(
				"Please fill in all fields (First Name, Roll Number, Class Name, Section, Exam Name)."
			);
			return;
		}

		setLoading(true);
		setError("");
		setSearched(true);

		try {
			const trimmed = Object.fromEntries(
				Object.entries(searchFilters).map(([k, v]) => [k, v.trim()])
			);

			// Map to backend filters supported by /api/results/search
			const filters = {
				studentName: trimmed.firstName,
				rollNumber: trimmed.rollNumber,
				className: trimmed.className,
				section: trimmed.section,
				examName: trimmed.examName,
			};

			// Optional: validate exam exists to give early feedback (non-blocking)
			try {
				const exams = await examsApi.getAllExams();
				if (exams?.success && Array.isArray(exams.data)) {
					const exists = exams.data.some(
						(e) => e.ExamName?.toLowerCase().includes(trimmed.examName.toLowerCase())
					);
					if (!exists) {
						// Don't block search—backend may still match. Just warn lightly.
						console.warn("Exam name not found in exams list; proceeding with search.");
					}
				}
			} catch (_) {}

			const res = await resultApi.searchResults(filters);
			if (res.success) {
				const data = res.data || [];
				if (data.length === 0) {
					setError("No results found for the specified student and exam.");
				}
				setRows(data);
			} else {
				setError(res.message || "Search failed.");
				setRows([]);
			}
		} catch (err) {
			console.error("Results search error:", err);
			setError(err.message || "An error occurred while searching results.");
			setRows([]);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		setSearchFilters({ firstName: "", rollNumber: "", className: "", section: "", examName: "" });
		setRows([]);
		setError("");
		setSearched(false);
	};

	// Group by student (name/roll/class/section) and exam
	const grouped = useMemo(() => {
		const groups = {};
		for (const r of rows) {
			const studentKey = `${r.FirstName || ""}|${r.LastName || ""}|${r.RollNumber || ""}|${r.ClassName || ""}|${r.Section || ""}`;
			const examKey = r.ExamName || "";
			const key = `${studentKey}||${examKey}`;
			if (!groups[key]) {
				groups[key] = {
					student: {
						firstName: r.FirstName,
						lastName: r.LastName,
						rollNumber: r.RollNumber,
						className: r.ClassName,
						section: r.Section,
						studentId: r.StudentID,
						studentImage: r.StudentImage || r.ProfileImage,
					},
					examName: r.ExamName,
					examType: r.ExamType,
					examDate: r.ExamDate,
					subjects: [],
				};
			}
			groups[key].subjects.push({
				subjectName: r.SubjectName,
				marksObtained: r.MarksObtained,
			});
		}
		return Object.values(groups);
	}, [rows]);

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		try { return new Date(dateString).toLocaleDateString(); } catch { return "N/A"; }
	};

	const downloadCSV = () => {
		if (!rows || rows.length === 0) return;
		const header = [
			"FirstName",
			"LastName",
			"RollNumber",
			"ClassName",
			"Section",
			"ExamName",
			"ExamType",
			"ExamDate",
			"SubjectName",
			"MarksObtained",
		];
		const lines = [header.join(",")];
		for (const r of rows) {
			const line = [
				r.FirstName || "",
				r.LastName || "",
				r.RollNumber || "",
				r.ClassName || "",
				r.Section || "",
				r.ExamName || "",
				r.ExamType || "",
				r.ExamDate ? formatDate(r.ExamDate) : "",
				r.SubjectName || "",
				r.MarksObtained ?? "",
			]
				.map((v) => `${String(v).replaceAll('"', '""')}`)
				.map((v) => `"${v}"`)
				.join(",");
			lines.push(line);
		}
		const csv = lines.join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `results_${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const printPage = () => {
		window.print();
	};

	return (
		<div className="student-search-container">
			<Navbar />
			<LatestUpdatesNotice />

			<div className="search-header">
				<h1 className="search-title">Results Search</h1>
				<p className="search-subtitle">
					Search by student and exam to view all subject-wise marks, and download the results.
				</p>
			</div>

			<div className="search-form-container">
				<form onSubmit={handleSearch} className="search-form">
					<div className="search-instruction">
						<p>Please fill in all fields below to search for a specific student's exam results.</p>
					</div>
					<div className="form-grid">
						<div className="form-group">
							<label htmlFor="firstName" className="form-label">
								First Name <span className="required">*</span>
							</label>
							<input
								type="text"
								id="firstName"
								name="firstName"
								value={searchFilters.firstName}
								onChange={handleInputChange}
								placeholder="Enter first name"
								className="form-input"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="rollNumber" className="form-label">
								Roll Number <span className="required">*</span>
							</label>
							<input
								type="text"
								id="rollNumber"
								name="rollNumber"
								value={searchFilters.rollNumber}
								onChange={handleInputChange}
								placeholder="Enter roll number"
								className="form-input"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="className" className="form-label">
								Class Name <span className="required">*</span>
							</label>
							<input
								type="text"
								id="className"
								name="className"
								value={searchFilters.className}
								onChange={handleInputChange}
								placeholder="Enter class name"
								className="form-input"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="section" className="form-label">
								Section Name <span className="required">*</span>
							</label>
							<input
								type="text"
								id="section"
								name="section"
								value={searchFilters.section}
								onChange={handleInputChange}
								placeholder="Enter section name"
								className="form-input"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="examName" className="form-label">
								Exam Name <span className="required">*</span>
							</label>
							<div style={{ display: "flex", gap: ".5rem" }}>
								{showExamSuggest ? (
									<select
										id="examName"
										name="examName"
										value={searchFilters.examName}
										onChange={handleInputChange}
										className="form-input"
										required
										disabled={!(
											searchFilters.firstName?.trim() &&
											searchFilters.rollNumber?.trim() &&
											searchFilters.className?.trim() &&
											searchFilters.section?.trim()
										)}
									>
										<option value="">Select an exam</option>
										{filteredExams.map((ex) => (
											<option key={ex.ExamID} value={ex.ExamName}>
												{ex.ExamName} {ex.ExamType ? `(${ex.ExamType})` : ""}
											</option>
										))}
									</select>
								) : (
									<input
										type="text"
										id="examName"
										name="examName"
										value={searchFilters.examName}
										onChange={handleInputChange}
										placeholder={(
											searchFilters.firstName?.trim() &&
											searchFilters.rollNumber?.trim() &&
											searchFilters.className?.trim() &&
											searchFilters.section?.trim()
										) ? "Type exam name or use dropdown" : "Fill other fields first"}
										className="form-input"
										required
										disabled={!(
											searchFilters.firstName?.trim() &&
											searchFilters.rollNumber?.trim() &&
											searchFilters.className?.trim() &&
											searchFilters.section?.trim()
										)}
									/>
								)}
								<button
									type="button"
									className="btn btn-reset"
									onClick={() => {
										const otherFieldsFilled = 
											searchFilters.firstName?.trim() &&
											searchFilters.rollNumber?.trim() &&
											searchFilters.className?.trim() &&
											searchFilters.section?.trim();
										if (otherFieldsFilled && exams.length > 0) {
											if (!showExamSuggest) {
												// Switching to dropdown mode
												setFilteredExams(exams);
											}
											setShowExamSuggest((s) => !s);
										}
									}}
									disabled={!(
										searchFilters.firstName?.trim() &&
										searchFilters.rollNumber?.trim() &&
										searchFilters.className?.trim() &&
										searchFilters.section?.trim()
									)}
									title={(
										searchFilters.firstName?.trim() &&
										searchFilters.rollNumber?.trim() &&
										searchFilters.className?.trim() &&
										searchFilters.section?.trim()
									) ? (showExamSuggest ? "Switch to text input" : "Show dropdown list") : "Fill other fields first"}
								>
									{showExamSuggest ? "📝 Text" : "📋 List"}
								</button>
							</div>
						</div>
					</div>

					<div className="form-actions">
						<button type="submit" className="btn btn-search" disabled={loading}>
							{loading ? "Searching..." : "Search Results"}
						</button>
						<button type="button" onClick={handleReset} className="btn btn-reset">
							Reset
						</button>
						<button
							type="button"
							className="btn btn-download"
							onClick={downloadCSV}
							disabled={!rows || rows.length === 0}
							title="Download as CSV"
						>
							Download CSV
						</button>
						<button
							type="button"
							className="btn btn-print"
							onClick={printPage}
							disabled={!rows || rows.length === 0}
							title="Print / Save as PDF"
						>
							Print / PDF
						</button>
					</div>
				</form>

				{error && (
					<div className="error-message">
						<i className="error-icon">⚠</i>
						{error}
					</div>
				)}
			</div>

			{searched && (
				<div className="results-container">
					<div className="results-header">
						<h2 className="results-title">Exam Results</h2>
						<span className="results-count">
							{rows.length} record{rows.length !== 1 ? "s" : ""} found
						</span>
					</div>

					{grouped.length > 0 ? (
						<div className="students-grid" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
							{grouped.map((g, idx) => (
								<div key={idx} className="student-profile-card">
									<div className="profile-header">
										<div className="profile-avatar">
											<StudentImage 
												studentId={g.student.studentId}
												firstName={g.student.firstName}
												lastName={g.student.lastName}
											/>
										</div>
										<div className="profile-info">
											<h3 className="student-name">
												{g.student.firstName} {g.student.lastName}
											</h3>
											<p className="student-details">
												Class {g.student.className} - Section {g.student.section}
											</p>
											<p className="student-roll">Roll Number: {g.student.rollNumber}</p>
											<p className="student-id">Student ID: {g.student.studentId || 'N/A'}</p>
										</div>
									</div>

									<div className="profile-details">
										<div className="detail-grid">
											<div className="detail-item">
												<span className="detail-icon">📝</span>
												<div className="detail-content">
													<span className="detail-label">Exam</span>
													<span className="detail-value">{g.examName} ({g.examType || ""})</span>
												</div>
											</div>
											<div className="detail-item">
												<span className="detail-icon">📅</span>
												<div className="detail-content">
													<span className="detail-label">Exam Date</span>
													<span className="detail-value">{formatDate(g.examDate)}</span>
												</div>
											</div>
										</div>
									</div>

									<div className="profile-details">
										<h4 style={{ margin: "0.5rem 0 0.5rem" }}>Subject-wise Marks</h4>
										<div className="table-responsive">
											<table className="table">
												<thead>
													<tr>
														<th>Subject</th>
														<th>Marks Obtained</th>
													</tr>
												</thead>
												<tbody>
													{g.subjects.map((s, i) => (
														<tr key={i}>
															<td>{s.subjectName}</td>
															<td>{s.marksObtained}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="no-results">
							<div className="no-results-icon">🔍</div>
							<h3>No results found</h3>
							<p>Try adjusting your search criteria and search again.</p>
						</div>
					)}
				</div>
			)}

			<Footer />
		</div>
	);
};

export default ResultsList;

