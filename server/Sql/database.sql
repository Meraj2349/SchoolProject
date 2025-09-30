-- School Management System Database
-- Students Table
CREATE TABLE
    Students (
        StudentID INT PRIMARY KEY AUTO_INCREMENT,
        FirstName VARCHAR(50) NOT NULL,
        LastName VARCHAR(50) NOT NULL,
        RollNumber VARCHAR(20) NOT NULL,
        DateOfBirth DATE NOT NULL,
        Gender ENUM ('Male', 'Female') NOT NULL,
        ClassID INT NOT NULL,
        AdmissionDate DATE NOT NULL,
        Address TEXT,
        ParentContact VARCHAR(15),
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
    );

-- Teachers Table  
CREATE TABLE
    Teachers (
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
CREATE TABLE
    Classes (
        ClassID INT PRIMARY KEY AUTO_INCREMENT,
        ClassName VARCHAR(20),
        Section VARCHAR(10),
        TeacherID INT,
        UNIQUE (className, Section),
        FOREIGN KEY (TeacherID) REFERENCES Teachers (TeacherID)
    );

-- Subjects Table
CREATE TABLE
    Subjects (
        SubjectID INT PRIMARY KEY AUTO_INCREMENT,
        SubjectName VARCHAR(50),
        ClassID INT,
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
    );

CREATE TABLE
    Attendance (
        AttendanceID INT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT NOT NULL,
        ClassID INT NOT NULL,
        ClassDate DATE NOT NULL,
        Status ENUM ('Present', 'Absent') NOT NULL,
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID),
        UNIQUE (StudentID, ClassID, ClassDate) -- prevent duplicate entries
    );

-- Exams Table
CREATE TABLE
    Exams (
        ExamID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        ExamType ENUM (
            'Monthly',
            'Quarterly',
            'Half-Yearly',
            'Annual',
            'Final'
        ) NOT NULL,
        ExamName VARCHAR(50) NOT NULL,
        ClassID INT NOT NULL,
        ExamDate DATE NOT NULL,
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
    );

-- Results Table
CREATE TABLE
    Results (
        ResultID INT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT NOT NULL,
        ExamID INT NOT NULL,
        SubjectID INT NOT NULL,
        ClassID INT NOT NULL,
        MarksObtained INT NOT NULL,
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
        FOREIGN KEY (ExamID) REFERENCES Exams (ExamID),
        FOREIGN KEY (SubjectID) REFERENCES Subjects (SubjectID),
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
    );

-- Fee Structure Table
CREATE TABLE
    FeeStructure (
        FeeStructureID INT PRIMARY KEY AUTO_INCREMENT,
        ClassID INT,
        FeeType ENUM (
            'Tuition',
            'Exam',
            'Library',
            'Transport',
            'Sports',
            'Lab',
            'Hostel',
            'Other'
        ),
        Amount DECIMAL(10, 2),
        AcademicYear YEAR,
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
    );

-- Fees Payment Table
CREATE TABLE
    Fees (
        FeeID INT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT,
        FeeStructureID INT,
        AmountDue DECIMAL(10, 2),
        AmountPaid DECIMAL(10, 2),
        PaymentDate DATE,
        DueDate DATE,
        PaymentStatus ENUM ('Paid', 'Pending', 'Overdue'),
        PaymentMethod ENUM (
            'Cash',
            'Bank Transfer',
            'Credit Card',
            'Mobile Payment'
        ),
        ReceiptNumber VARCHAR(50) UNIQUE,
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
        FOREIGN KEY (FeeStructureID) REFERENCES FeeStructure (FeeStructureID)
    );

-- Scholarships/Discounts Table
CREATE TABLE
    Scholarships (
        ScholarshipID INT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT,
        FeeStructureID INT,
        DiscountAmount DECIMAL(10, 2),
        Reason VARCHAR(255),
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
        FOREIGN KEY (FeeStructureID) REFERENCES FeeStructure (FeeStructureID)
    );

-- Late Payment Fine Table
CREATE TABLE
    LatePaymentFines (
        FineID INT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT,
        FeeID INT,
        FineAmount DECIMAL(10, 2),
        FineReason VARCHAR(255),
        FineDate DATE,
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
        FOREIGN KEY (FeeID) REFERENCES Fees (FeeID)
    );

--admin
CREATE TABLE
    Admin (
        AdminID INT PRIMARY KEY AUTO_INCREMENT,
        Username VARCHAR(50),
        Email VARCHAR(100),
        Password VARCHAR(255)
    );

CREATE TABLE
    Notices (
        NoticeID INT PRIMARY KEY AUTO_INCREMENT, -- Unique identifier for each notice
        Title VARCHAR(255) NOT NULL, -- Title of the notice
        Description TEXT NOT NULL, -- Description of the notice
        `Show` BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the notice is visible or not
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the notice was created
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp for when the notice was last updated
    );

CREATE TABLE
    Messages (
        MessageID INT PRIMARY KEY AUTO_INCREMENT, -- Unique identifier for each message
        Messages TEXT NOT NULL, -- The message content
        Show BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the message is visible or not
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the message was created
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp for when the message was last updated
    );

-- Image Storage Table (for all images)
CREATE TABLE Images (
    ImageID INT PRIMARY KEY AUTO_INCREMENT,
    ImagePath VARCHAR(255) NOT NULL,
    PublicID VARCHAR(255) NOT NULL,
    Description TEXT,
    UploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UploadedBy INT COMMENT 'AdminID or TeacherID who uploaded',
    ImageType ENUM ('student', 'teacher', 'school', 'event', 'notice') NOT NULL,
    StudentID INT NULL COMMENT 'Reference to Students table if image belongs to student',
    TeacherID INT NULL COMMENT 'Reference to Teachers table if image belongs to teacher',
    AssociatedID INT COMMENT 'ID of the associated entity (for other types)',
    FOREIGN KEY (StudentID) REFERENCES Students (StudentID) ON DELETE CASCADE,
    FOREIGN KEY (TeacherID) REFERENCES Teachers (TeacherID) ON DELETE CASCADE
);

-- Teacher Images (connects teachers to images)
CREATE TABLE
    TeacherImages (
        TeacherImageID INT PRIMARY KEY AUTO_INCREMENT,
        TeacherID INT NOT NULL,
        ImageID INT NOT NULL,
        ImageCategory ENUM (
            'profile',
            'class_photo',
            'id_card',
            'training',
            'meeting',
            'event_organization'
        ) NOT NULL,
        AcademicYear YEAR,
        FOREIGN KEY (TeacherID) REFERENCES Teachers (TeacherID),
        FOREIGN KEY (ImageID) REFERENCES Images (ImageID)
    );

-- School Event Images (for general school photos)
CREATE TABLE
    SchoolEventImages (
        EventImageID INT PRIMARY KEY AUTO_INCREMENT,
        ImageID INT NOT NULL,
        EventName VARCHAR(100) NOT NULL,
        EventType ENUM (
            'sports_day',
            'annual_function',
            'cultural_program',
            'science_fair',
            'independence_day',
            'victory_day',
            'language_day',
            'other'
        ) NOT NULL,
        EventDate DATE,
        AcademicYear YEAR,
        FOREIGN KEY (ImageID) REFERENCES Images (ImageID)
    );