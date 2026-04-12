-- Notice Announcements Table for School Management System
CREATE TABLE IF NOT EXISTS NoticeAnnouncements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title_bn VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    category ENUM('Admission', 'Exam', 'Notice', 'Event') NOT NULL,
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
