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
