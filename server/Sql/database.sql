-- School Management System Database

-- Students Table
CREATE TABLE Students (
    StudentID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    DateOfBirth DATE,
    Gender ENUM('Male', 'Female', 'Other'),
    Class VARCHAR(20),
    Section VARCHAR(10),
    AdmissionDate DATE,
    Address TEXT,
    ParentContact VARCHAR(15)
);

-- Teachers Table
CREATE TABLE Teachers (
    TeacherID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Subject VARCHAR(50),
    ContactNumber VARCHAR(15),
    Email VARCHAR(100),
    JoiningDate DATE,
    Address TEXT
);

-- Classes Table
CREATE TABLE Classes (
    ClassID INT PRIMARY KEY AUTO_INCREMENT,
    ClassName VARCHAR(20),
    Section VARCHAR(10),
    TeacherID INT,
    FOREIGN KEY (TeacherID) REFERENCES Teachers(TeacherID)
);

-- Subjects Table
CREATE TABLE Subjects (
    SubjectID INT PRIMARY KEY AUTO_INCREMENT,
    SubjectName VARCHAR(50),
    ClassID INT,
    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID)
);

-- Attendance Table
CREATE TABLE Attendance (
    AttendanceID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT,
    ClassDate DATE,
    Status ENUM('Present', 'Absent', 'Late'),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- Exams Table
CREATE TABLE Exams (
    ExamID INT PRIMARY KEY AUTO_INCREMENT,
    ExamName VARCHAR(50),
    ClassID INT,
    ExamDate DATE,
    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID)
);

-- Exam Subjects Table
CREATE TABLE ExamSubject (
    ExamID INT PRIMARY KEY AUTO_INCREMENT, 
    SubjectID INT NOT NULL,       
    StudentID INT NOT NULL,                
    ExamDate DATE NOT NULL,             
    MainExamID INT NOT NULL,            

    -- Foreign key constraints
    FOREIGN KEY (MainExamID) REFERENCES Exams(ExamID),
    FOREIGN KEY (SubjectID) REFERENCES subjects(SubjectID),
    FOREIGN KEY (StudentID) REFERENCES students(StudentID)

  
);

-- Results Table
CREATE TABLE Results (
    ResultID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT,
    ExamID INT,
    SubjectID INT,
    MarksObtained INT,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (ExamID) REFERENCES Exams(ExamID),
    FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID)
);

-- Fee Structure Table
CREATE TABLE FeeStructure (
    FeeStructureID INT PRIMARY KEY AUTO_INCREMENT,
    ClassID INT,
    FeeType ENUM('Tuition', 'Exam', 'Library', 'Transport', 'Sports', 'Lab', 'Hostel', 'Other'),
    Amount DECIMAL(10,2),
    AcademicYear YEAR,
    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID)
);

-- Fees Payment Table
CREATE TABLE Fees (
    FeeID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT,
    FeeStructureID INT,
    AmountDue DECIMAL(10,2),
    AmountPaid DECIMAL(10,2),
    PaymentDate DATE,
    DueDate DATE,
    PaymentStatus ENUM('Paid', 'Pending', 'Overdue'),
    PaymentMethod ENUM('Cash', 'Bank Transfer', 'Credit Card', 'Mobile Payment'),
    ReceiptNumber VARCHAR(50) UNIQUE,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (FeeStructureID) REFERENCES FeeStructure(FeeStructureID)
);

-- Scholarships/Discounts Table
CREATE TABLE Scholarships (
    ScholarshipID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT,
    FeeStructureID INT,
    DiscountAmount DECIMAL(10,2),
    Reason VARCHAR(255),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (FeeStructureID) REFERENCES FeeStructure(FeeStructureID)
);

-- Late Payment Fine Table
CREATE TABLE LatePaymentFines (
    FineID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT,
    FeeID INT,
    FineAmount DECIMAL(10,2),
    FineReason VARCHAR(255),
    FineDate DATE,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (FeeID) REFERENCES Fees(FeeID)
);


--multer file table
CREATE TABLE files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  originalname VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);