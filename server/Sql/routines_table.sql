-- Routines Table for School Management System
-- This table stores class-wise and section-wise routine information using ClassID from Classes table
-- Following Classes table structure: ClassID, ClassName, Section
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
        FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE CASCADE,
        INDEX idx_class_id (ClassID),
        INDEX idx_routine_date (RoutineDate),
        INDEX idx_active (IsActive)
    );

-- First, ensure sample classes exist in Classes table (matching Classes table structure)
INSERT IGNORE INTO Classes (ClassID, ClassName, Section, TeacherID)
VALUES
    (1, 'Class 6', 'A', 1),
    (2, 'Class 6', 'B', 2),
    (3, 'Class 7', 'A', 3),
    (4, 'Class 7', 'B', 4),
    (5, 'Class 8', 'A', 5),
    (6, 'Class 8', 'B', 6),
    (7, 'Class 9', 'A', 7),
    (8, 'Class 9', 'B', 8),
    (9, 'Class 9', 'C', 9),
    (10, 'Class 10', 'A', 10);

-- Insert sample routine data using ClassID (following Classes table structure)
INSERT INTO
    Routines (
        RoutineTitle,
        ClassID,
        RoutineDate,
        Description,
        FileType,
        IsActive
    )
VALUES
    (
        'Weekly Routine - Class 6 Section A',
        1,
        '2025-01-15',
        'Weekly routine for Class 6 Section A students including all subjects and break times',
        'pdf',
        TRUE
    ),
    (
        'Daily Time Table - Class 7 Section B',
        4,
        '2025-01-15',
        'Daily time table for Class 7 Section B with subject-wise schedule',
        'image',
        TRUE
    ),
    (
        'Final Exam Routine - Class 8 Section A',
        5,
        '2025-02-01',
        'Final examination routine for Class 8 Section A with exam dates and timings',
        'pdf',
        TRUE
    ),
    (
        'Science Special Schedule - Class 9 Section C',
        9,
        '2025-01-20',
        'Special class schedule for Science students with lab sessions',
        'pdf',
        TRUE
    ),
    (
        'SSC Board Exam Routine - Class 10 Section A',
        10,
        '2025-03-01',
        'SSC Board examination routine with all subject exam dates',
        'pdf',
        TRUE
    ),
    (
        'Monthly Test Schedule - Class 6 Section B',
        2,
        '2025-01-25',
        'Monthly test routine for Class 6 Section B students',
        'pdf',
        TRUE
    ),
    (
        'Sports Day Schedule - Class 8 Section B',
        6,
        '2025-02-15',
        'Annual sports day event schedule for Class 8 Section B',
        'image',
        TRUE
    );