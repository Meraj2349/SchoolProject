-- The file holds Bangla text: read it as UTF-8 whatever the client default.
SET NAMES utf8mb4;

-- ============================================================
-- Online applications to job circulars (MySQL 8, safe to re-run).
-- Run after job_circulars_migration.sql. Fresh installs get this from database.sql.
-- ============================================================

CREATE TABLE
    IF NOT EXISTS JobApplications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        circular_id INT NOT NULL,
        post_index TINYINT UNSIGNED NOT NULL COMMENT 'Position in JobCirculars.posts',
        post_title_en VARCHAR(255) NOT NULL COMMENT 'Copied, so the application reads the same if the circular changes',
        post_title_bn VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone CHAR(11) NOT NULL,
        email VARCHAR(150) NULL,
        address TEXT NOT NULL,
        education VARCHAR(255) NOT NULL,
        experience TEXT NULL,
        cv_file VARCHAR(255) NULL COMMENT 'Stored in private_uploads, never served publicly',
        status ENUM ('new', 'shortlisted', 'rejected', 'hired') NOT NULL DEFAULT 'new',
        branch_id INT NULL COMMENT 'The circular''s branch',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_job_application_phone (circular_id, post_index, phone),
        INDEX idx_job_applications_status (circular_id, status)
    );

-- MySQL 8 has no "ADD CONSTRAINT IF NOT EXISTS", so check information_schema.
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'JobApplications' AND CONSTRAINT_NAME = 'fk_job_applications_branch');
SET @sql := IF(@missing, 'ALTER TABLE JobApplications ADD CONSTRAINT fk_job_applications_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'JobApplications' AND CONSTRAINT_NAME = 'fk_job_applications_circular');
SET @sql := IF(@missing, 'ALTER TABLE JobApplications ADD CONSTRAINT fk_job_applications_circular FOREIGN KEY (circular_id) REFERENCES JobCirculars (id) ON DELETE CASCADE', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
