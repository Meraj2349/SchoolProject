-- School Management System Database
SET
    FOREIGN_KEY_CHECKS = 0;

-- Routines Table (Using ClassID from Classes table - following Classes table structure)
CREATE TABLE
    Routines (
        RoutineID INT PRIMARY KEY AUTO_INCREMENT,
        RoutineTitle VARCHAR(255) NOT NULL,
        ClassID INT NOT NULL, -- Foreign key to Classes table
        RoutineDate DATE NOT NULL,
        Description TEXT,
        FileURL VARCHAR(500), -- Cloudinary URL for PDF/Image
        FileType ENUM ('pdf', 'image') DEFAULT 'pdf',
        FilePublicID VARCHAR(255), -- Cloudinary public_id for deletion
        IsActive BOOLEAN DEFAULT TRUE,
        CreatedBy INT, -- Admin user ID (Foreign key to Users/Admin table)
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        branch_id INT NOT NULL DEFAULT 1,
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE CASCADE,
        INDEX idx_class_id (ClassID),
        INDEX idx_routine_date (RoutineDate),
        INDEX idx_active (IsActive)
    );

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
        branch_id INT NOT NULL DEFAULT 1,
        -- ON DELETE RESTRICT: students must not silently lose their class
        CONSTRAINT fk_students_class FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE RESTRICT
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
        Address TEXT,
        branch_id INT NOT NULL DEFAULT 1
    );

-- Classes Table
-- NOTE: (ClassName, Section) uniqueness is scoped per branch.
-- The per-branch UNIQUE is added by add_branch_id_migration.sql once branch_id exists.
CREATE TABLE
    Classes (
        ClassID INT PRIMARY KEY AUTO_INCREMENT,
        ClassName VARCHAR(20),
        Section VARCHAR(10),
        TeacherID INT,
        branch_id INT NOT NULL DEFAULT 1,
        FOREIGN KEY (TeacherID) REFERENCES Teachers (TeacherID),
        CONSTRAINT uq_class_section_branch UNIQUE (ClassName, Section, branch_id)
    );

-- Subjects Table
CREATE TABLE
    Subjects (
        SubjectID INT PRIMARY KEY AUTO_INCREMENT,
        SubjectName VARCHAR(50),
        ClassID INT,
        branch_id INT NOT NULL DEFAULT 1,
        CONSTRAINT fk_subjects_class FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE SET NULL
    );

CREATE TABLE
    Attendance (
        AttendanceID INT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT NOT NULL,
        ClassID INT NULL, -- nullable so ON DELETE SET NULL works
        ClassDate DATE NOT NULL,
        Status ENUM ('Present', 'Absent', 'Late') NOT NULL,
        branch_id INT NOT NULL DEFAULT 1,
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
        CONSTRAINT fk_attendance_class FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE SET NULL,
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
        ClassID INT NULL, -- nullable so ON DELETE SET NULL works
        ExamDate DATE NOT NULL,
        branch_id INT NOT NULL DEFAULT 1,
        CONSTRAINT fk_exams_class FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE SET NULL
    );

-- Results Table
CREATE TABLE
    Results (
        ResultID INT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT NOT NULL,
        ExamID INT NOT NULL,
        SubjectID INT NOT NULL,
        ClassID INT NULL, -- nullable so ON DELETE SET NULL works
        MarksObtained INT NOT NULL,
        branch_id INT NOT NULL DEFAULT 1,
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
        FOREIGN KEY (ExamID) REFERENCES Exams (ExamID),
        FOREIGN KEY (SubjectID) REFERENCES Subjects (SubjectID),
        CONSTRAINT fk_results_class FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE SET NULL
    );

-- admin
CREATE TABLE
    Admin (
        AdminID INT PRIMARY KEY AUTO_INCREMENT,
        Username VARCHAR(50),
        Email VARCHAR(100),
        Password VARCHAR(255),
        Language VARCHAR(2) NOT NULL DEFAULT 'bn' COMMENT 'UI language preference: bn (default) or en',
        role ENUM ('super_admin', 'branch_admin') NOT NULL DEFAULT 'branch_admin',
        branch_id INT NULL COMMENT 'NULL for super_admin'
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
        `Show` BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the message is visible or not
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the message was created
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp for when the message was last updated
    );

-- Image Storage Table (for all images)
CREATE TABLE
    Images (
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

-- -- Fee Structure Table
-- CREATE TABLE
--     FeeStructure (
--         FeeStructureID INT PRIMARY KEY AUTO_INCREMENT,
--         ClassID INT,
--         FeeType ENUM (
--             'Tuition',
--             'Exam',
--             'Library',
--             'Transport',
--             'Sports',
--             'Lab',
--             'Hostel',
--             'Other'
--         ),
--         Amount DECIMAL(10, 2),
--         AcademicYear YEAR,
--         FOREIGN KEY (ClassID) REFERENCES Classes (ClassID)
--     );
-- -- Fees Payment Table
-- CREATE TABLE
--     Fees (
--         FeeID INT PRIMARY KEY AUTO_INCREMENT,
--         StudentID INT,
--         FeeStructureID INT,
--         AmountDue DECIMAL(10, 2),
--         AmountPaid DECIMAL(10, 2),
--         PaymentDate DATE,
--         DueDate DATE,
--         PaymentStatus ENUM ('Paid', 'Pending', 'Overdue'),
--         PaymentMethod ENUM (
--             'Cash',
--             'Bank Transfer',
--             'Credit Card',
--             'Mobile Payment'
--         ),
--         ReceiptNumber VARCHAR(50) UNIQUE,
--         FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
--         FOREIGN KEY (FeeStructureID) REFERENCES FeeStructure (FeeStructureID)
--     );
-- -- Scholarships/Discounts Table
-- CREATE TABLE
--     Scholarships (
--         ScholarshipID INT PRIMARY KEY AUTO_INCREMENT,
--         StudentID INT,
--         FeeStructureID INT,
--         DiscountAmount DECIMAL(10, 2),
--         Reason VARCHAR(255),
--         FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
--         FOREIGN KEY (FeeStructureID) REFERENCES FeeStructure (FeeStructureID)
--     );
-- -- Late Payment Fine Table
-- CREATE TABLE
--     LatePaymentFines (
--         FineID INT PRIMARY KEY AUTO_INCREMENT,
--         StudentID INT,
--         FeeID INT,
--         FineAmount DECIMAL(10, 2),
--         FineReason VARCHAR(255),
--         FineDate DATE,
--         FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
--         FOREIGN KEY (FeeID) REFERENCES Fees (FeeID)
--     );
SET
    FOREIGN_KEY_CHECKS = 1;

-- Events Table for School Management System
-- Simple Event Management with basic fields
CREATE TABLE
    Events (
        EventID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        EventName VARCHAR(100) NOT NULL,
        EventType ENUM ('Academic', 'Sports', 'Cultural', 'Other') NOT NULL DEFAULT 'Other',
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        Venue VARCHAR(100),
        Description TEXT,
        branch_id INT NULL COMMENT 'NULL = school-wide event shown in every branch',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Sample data for testing (optional)
INSERT INTO
    Events (
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description
    )
VALUES
    (
        'Annual Sports Day',
        'Sports',
        '2025-10-15',
        '2025-10-15',
        'School Playground',
        'Annual sports competition for all students'
    ),
    (
        'Parent Teacher Meeting',
        'Academic',
        '2025-10-20',
        '2025-10-20',
        'School Hall',
        'Monthly parent teacher interaction meeting'
    ),
    (
        'Cultural Program',
        'Cultural',
        '2025-10-25',
        '2025-10-26',
        'School Auditorium',
        'Annual cultural program with dance, music and drama'
    ),
    (
        'Science Fair',
        'Academic',
        '2025-11-05',
        '2025-11-07',
        'Science Lab',
        'Student science project exhibition'
    );

-- Index for better performance
CREATE INDEX idx_events_date ON Events (StartDate, EndDate);

CREATE INDEX idx_events_type ON Events (EventType);

-- News Table for School Management System
CREATE TABLE
    IF NOT EXISTS News (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_bn VARCHAR(500) NOT NULL,
        title_en VARCHAR(500) NOT NULL,
        date DATE NOT NULL,
        link VARCHAR(500) NOT NULL DEFAULT '/events',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Index for performance on active news ordered by date
CREATE INDEX idx_news_active_date ON News (is_active, date DESC);

-- Sample data for testing
INSERT INTO
    News (title_bn, title_en, date, link, is_active)
VALUES
    (
        'সিলেট ক্যান্টনমেন্ট পাবলিক স্কুলে নবীন বরণ অনুষ্ঠান',
        'Nobin Boron Program held in Sylhet Cantonment Public School',
        '2023-10-11',
        '/events',
        TRUE
    ),
    (
        'একাদশ শ্রেণি ভর্তি বিজ্ঞপ্তি-২০২৫',
        'Class XI Admission Notice-2025',
        '2025-07-26',
        '/events',
        TRUE
    ),
    (
        '২১ সেপ্টেম্বর ২০২৪ লিখিত পরীক্ষার প্রার্থী তালিকা',
        'Candidates list for Written Exam 21 September 2024',
        '2024-09-19',
        '/events',
        TRUE
    ),
    (
        'শিক্ষা বীমা',
        'Education Insurance',
        '2024-08-14',
        '/events',
        TRUE
    );

-- Notice Announcements Table for School Management System
CREATE TABLE
    IF NOT EXISTS NoticeAnnouncements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_bn VARCHAR(500) NOT NULL,
        title_en VARCHAR(500) NOT NULL,
        image_url VARCHAR(500),
        category ENUM ('Admission', 'Exam', 'Notice', 'Event') NOT NULL,
        date DATE NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Index for performance on published announcements ordered by date
CREATE INDEX idx_notice_announcements_published_date ON NoticeAnnouncements (is_published, date DESC);

-- Index for filtering by category
CREATE INDEX idx_notice_announcements_category ON NoticeAnnouncements (category);

-- Ensure upload directory exists (run manually): mkdir -p server/public/uploads/notice-announcements
-- Branches Table for School Management System
CREATE TABLE
    IF NOT EXISTS Branches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name_bn VARCHAR(255),
        name_en VARCHAR(255),
        description_bn TEXT,
        description_en TEXT,
        image_url VARCHAR(500),
        image_public_id VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address_bn VARCHAR(500),
        address_en VARCHAR(500),
        is_proposed BOOLEAN DEFAULT FALSE,
        established_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS Applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        applicant_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM ('male', 'female', 'other') NOT NULL,
        applying_for_class VARCHAR(100) NOT NULL,
        previous_school VARCHAR(255),
        previous_class VARCHAR(100),
        parent_name VARCHAR(255) NOT NULL,
        parent_contact VARCHAR(20) NOT NULL,
        parent_email VARCHAR(255),
        address TEXT,
        additional_info TEXT,
        status ENUM ('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
        student_id INT NULL COMMENT 'Student created when the application was accepted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Quiz Tables
CREATE TABLE
    IF NOT EXISTS QuizQuestions (
        QuestionID INT PRIMARY KEY AUTO_INCREMENT,
        SourceQuestionID INT DEFAULT NULL,
        Prompt TEXT NOT NULL,
        OptionsJSON JSON NOT NULL,
        CorrectAnswer CHAR(1) NOT NULL,
        Subject VARCHAR(100) DEFAULT NULL,
        Grade VARCHAR(50) DEFAULT NULL,
        Difficulty VARCHAR(50) DEFAULT NULL,
        SourceFile VARCHAR(255) DEFAULT NULL,
        Language VARCHAR(20) DEFAULT 'en',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS QuizSessions (
        SessionID BIGINT PRIMARY KEY AUTO_INCREMENT,
        UserID INT DEFAULT NULL,
        StudentID INT DEFAULT NULL,
        StudentName VARCHAR(120) DEFAULT NULL,
        ClassName VARCHAR(50) DEFAULT NULL,
        Section VARCHAR(20) DEFAULT NULL,
        Subject VARCHAR(100) DEFAULT NULL,
        Grade VARCHAR(50) DEFAULT NULL,
        TotalQuestions INT NOT NULL,
        CorrectAnswers INT NOT NULL,
        ScorePercentage DECIMAL(5, 2) NOT NULL,
        TimeTakenSeconds INT NOT NULL,
        branch_id INT DEFAULT NULL,
        StartedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CompletedAt DATETIME DEFAULT NULL,
        INDEX idx_quiz_session_user (UserID),
        INDEX idx_quiz_session_student (StudentID),
        INDEX idx_quiz_session_subject (Subject),
        INDEX idx_quiz_session_grade (Grade),
        FOREIGN KEY (StudentID) REFERENCES Students (StudentID) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS QuizAttempts (
        AttemptID BIGINT PRIMARY KEY AUTO_INCREMENT,
        SessionID BIGINT NOT NULL,
        QuestionID INT NOT NULL,
        UserAnswer CHAR(1) DEFAULT NULL,
        CorrectAnswer CHAR(1) NOT NULL,
        IsCorrect TINYINT (1) NOT NULL,
        TimeSpentSeconds INT DEFAULT NULL,
        FOREIGN KEY (SessionID) REFERENCES QuizSessions (SessionID) ON DELETE CASCADE,
        FOREIGN KEY (QuestionID) REFERENCES QuizQuestions (QuestionID) ON DELETE CASCADE
    );

-- Chairman Profile Table
-- Single-row table (id=1) for the school chairman's public profile.
CREATE TABLE
    IF NOT EXISTS ChairmanProfile (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name_en VARCHAR(255) NOT NULL DEFAULT 'Md. Rashedul Islam',
        name_bn VARCHAR(255) NOT NULL DEFAULT 'মোঃ রাশেদুল ইসলাম',
        title_en VARCHAR(255) NOT NULL DEFAULT 'Chairman',
        title_bn VARCHAR(255) NOT NULL DEFAULT 'চেয়ারম্যান',
        institution_en VARCHAR(255) NOT NULL DEFAULT 'Star Shikkha Poribar',
        institution_bn VARCHAR(255) NOT NULL DEFAULT 'স্টার শিক্ষা পরিবার',
        image_url VARCHAR(500),
        image_public_id VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Seed the single row (only if the table is empty)
INSERT IGNORE INTO ChairmanProfile (id, name_en, name_bn, title_en, title_bn, institution_en, institution_bn)
VALUES (1, 'Md. Rashedul Islam', 'মোঃ রাশেদুল ইসলাম', 'Chairman', 'চেয়ারম্যান', 'Star Shikkha Poribar', 'স্টার শিক্ষা পরিবার');

-- ============================================================
-- Shared class names (same for every branch; sections differ per branch).
-- Kept in sync with class_names.sql.
-- ============================================================
CREATE TABLE
    IF NOT EXISTS ClassNames (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        sort_order INT NOT NULL DEFAULT 0
    );

INSERT IGNORE INTO ClassNames (name, sort_order) VALUES
    ('Play', 1), ('Nursery', 2), ('KG', 3),
    ('Class 1', 4), ('Class 2', 5), ('Class 3', 6), ('Class 4', 7),
    ('Class 5', 8), ('Class 6', 9), ('Class 7', 10), ('Class 8', 11),
    ('Class 9', 12), ('Class 10', 13);

-- ============================================================
-- Branch foreign keys. Added last because Branches is created above.
-- Existing databases get the same result from add_branch_id_migration.sql.
-- ============================================================
ALTER TABLE Admin ADD CONSTRAINT fk_admins_branch FOREIGN KEY (branch_id) REFERENCES Branches (id) ON DELETE SET NULL;
ALTER TABLE Students ADD CONSTRAINT fk_students_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Teachers ADD CONSTRAINT fk_teachers_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Classes ADD CONSTRAINT fk_classes_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Subjects ADD CONSTRAINT fk_subjects_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Attendance ADD CONSTRAINT fk_attendance_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Exams ADD CONSTRAINT fk_exams_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Results ADD CONSTRAINT fk_results_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Events ADD CONSTRAINT fk_events_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);
ALTER TABLE Routines ADD CONSTRAINT fk_routines_branch FOREIGN KEY (branch_id) REFERENCES Branches (id);

-- ============================================================
-- Fees: monthly tuition + extra fee heads, discounts, invoices,
-- payments and receipts. Existing databases: add_fees_migration.sql
-- ============================================================
-- Branch fee settings: due day of each month, late fine and receipt prefix.
CREATE TABLE
    IF NOT EXISTS FeeSettings (
        branch_id INT PRIMARY KEY,
        due_day TINYINT NOT NULL DEFAULT 10,
        late_fine DECIMAL(10, 2) NOT NULL DEFAULT 0,
        receipt_prefix VARCHAR(10) NOT NULL DEFAULT 'RCT',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_fee_settings_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );

-- Monthly tuition per class name (all sections share it) and academic year.
CREATE TABLE
    IF NOT EXISTS FeeStructures (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        class_name VARCHAR(20) NOT NULL,
        academic_year SMALLINT NOT NULL,
        monthly_tuition DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fee_structure UNIQUE (branch_id, class_name, academic_year),
        CONSTRAINT fk_fee_structures_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );

-- Extra fees added to a month's invoices on demand (exam fee, transport...).
CREATE TABLE
    IF NOT EXISTS FeeHeads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        name_en VARCHAR(100),
        name_bn VARCHAR(100),
        default_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_fee_heads_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );

-- Scholarships, sibling discounts and waivers (100%).
CREATE TABLE
    IF NOT EXISTS StudentDiscounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        student_id INT NOT NULL,
        kind ENUM ('percent', 'fixed') NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        applies_to ENUM ('tuition', 'all') NOT NULL DEFAULT 'tuition',
        reason VARCHAR(255),
        valid_from DATE NULL,
        valid_to DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_discounts_student (student_id),
        CONSTRAINT fk_discounts_branch FOREIGN KEY (branch_id) REFERENCES Branches (id),
        CONSTRAINT fk_discounts_student FOREIGN KEY (student_id) REFERENCES Students (StudentID) ON DELETE CASCADE
    );

-- One invoice per student per month. Students with fee history cannot be
-- deleted (RESTRICT) so payment records are never lost.
CREATE TABLE
    IF NOT EXISTS FeeInvoices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        student_id INT NOT NULL,
        year SMALLINT NOT NULL,
        month TINYINT NOT NULL,
        class_name VARCHAR(20) NOT NULL COMMENT 'Class and section when billed, so reports survive promotions',
        section VARCHAR(10),
        due_date DATE NOT NULL,
        status ENUM ('unpaid', 'partial', 'paid') NOT NULL DEFAULT 'unpaid',
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_invoice_student_month UNIQUE (student_id, year, month),
        INDEX idx_invoices_branch_period (branch_id, year, month),
        CONSTRAINT fk_invoices_branch FOREIGN KEY (branch_id) REFERENCES Branches (id),
        CONSTRAINT fk_invoices_student FOREIGN KEY (student_id) REFERENCES Students (StudentID) ON DELETE RESTRICT
    );

-- Invoice lines are copied at billing time; discounts are stored negative.
CREATE TABLE
    IF NOT EXISTS FeeInvoiceItems (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoice_id INT NOT NULL,
        kind ENUM ('tuition', 'extra', 'discount', 'late_fine') NOT NULL,
        label VARCHAR(150) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES FeeInvoices (id) ON DELETE CASCADE
    );

-- Payments are never deleted, only voided, so the history stays auditable.
CREATE TABLE
    IF NOT EXISTS FeePayments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        invoice_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method ENUM ('cash', 'bkash', 'nagad', 'bank', 'other') NOT NULL,
        paid_on DATE NOT NULL,
        receipt_no VARCHAR(30) NOT NULL,
        received_by INT NULL,
        note VARCHAR(255),
        voided_at DATETIME NULL,
        voided_by INT NULL,
        void_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_payment_receipt UNIQUE (branch_id, receipt_no),
        INDEX idx_payments_invoice (invoice_id),
        CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id) REFERENCES Branches (id),
        CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES FeeInvoices (id)
    );

-- Last receipt number issued per branch and year (locked while issuing one).
CREATE TABLE
    IF NOT EXISTS FeeReceiptCounters (
        branch_id INT NOT NULL,
        year SMALLINT NOT NULL,
        last_seq INT NOT NULL DEFAULT 0,
        PRIMARY KEY (branch_id, year),
        CONSTRAINT fk_receipt_counters_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );
