-- The file holds Bangla text: read it as UTF-8 whatever the client default.
SET NAMES utf8mb4;

-- ============================================================
-- Job circulars (নিয়োগ বিজ্ঞপ্তি) for the website (MySQL 8, safe to re-run).
-- Fresh installs get this from database.sql.
-- ============================================================

CREATE TABLE
    IF NOT EXISTS JobCirculars (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_en VARCHAR(255) NOT NULL,
        title_bn VARCHAR(255) NOT NULL,
        circular_date DATE NOT NULL,
        deadline DATE NULL COMMENT 'Last date to apply; NULL = until closed',
        posts JSON NOT NULL COMMENT '[{title_en, title_bn, vacancies, qualification_en, qualification_bn, salary_min, salary_max}]',
        how_to_apply_en TEXT,
        how_to_apply_bn TEXT,
        image_url VARCHAR(500) COMMENT 'Poster: an image or a PDF',
        is_open BOOLEAN NOT NULL DEFAULT TRUE,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        branch_id INT NULL COMMENT 'Owning branch; NULL = whole school',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_job_circulars_list (is_published, is_open, circular_date)
    );

-- MySQL 8 has no "ADD CONSTRAINT IF NOT EXISTS", so check information_schema.
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'JobCirculars' AND CONSTRAINT_NAME = 'fk_job_circulars_branch');
SET @sql := IF(@missing, 'ALTER TABLE JobCirculars ADD CONSTRAINT fk_job_circulars_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- The school's two 2025 circulars, closed (applications were by hand).
-- Added when missing (matched by title and date); an admin may edit, reopen or
-- delete them, though running this script again restores a deleted one.
INSERT INTO JobCirculars (title_en, title_bn, circular_date, posts, image_url, is_open, is_published, branch_id)
SELECT 'Urgent recruitment: Accountant', 'জরুরি নিয়োগ বিজ্ঞপ্তি: অ্যাকাউন্টেন্ট', '2025-06-28',
       JSON_ARRAY(JSON_OBJECT('title_en', 'Accountant', 'title_bn', 'অ্যাকাউন্টেন্ট', 'vacancies', 1,
         'qualification_en', 'Honours / Masters (Accounting)', 'qualification_bn', 'স্নাতক সম্মান / স্নাতকোত্তর (অ্যাকাউন্টিং)',
         'salary_min', 10000, 'salary_max', 20000)),
       '/images/circulars/accountant-2025-06-28.jpg', FALSE, TRUE,
       (SELECT id FROM Branches WHERE name_en LIKE '%Natiapara%' ORDER BY id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM JobCirculars WHERE title_en = 'Urgent recruitment: Accountant' AND circular_date = '2025-06-28');

INSERT INTO JobCirculars (title_en, title_bn, circular_date, posts, image_url, is_open, is_published, branch_id)
SELECT 'Urgent recruitment: Assistant Teacher (Bangla)', 'জরুরি নিয়োগ বিজ্ঞপ্তি: সহকারি শিক্ষক (বাংলা)', '2025-07-29',
       JSON_ARRAY(JSON_OBJECT('title_en', 'Assistant Teacher (Bangla)', 'title_bn', 'সহকারি শিক্ষক (বাংলা)', 'vacancies', 1,
         'qualification_en', 'Honours / Masters (Bangla)', 'qualification_bn', 'স্নাতক সম্মান / স্নাতকোত্তর (বাংলা)',
         'salary_min', 10000, 'salary_max', 20000)),
       '/images/circulars/assistant-teacher-bangla-2025-07-29.jpg', FALSE, TRUE,
       (SELECT id FROM Branches WHERE name_en LIKE '%Natiapara%' ORDER BY id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM JobCirculars WHERE title_en = 'Urgent recruitment: Assistant Teacher (Bangla)' AND circular_date = '2025-07-29');
