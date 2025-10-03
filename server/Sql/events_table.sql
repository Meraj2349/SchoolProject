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