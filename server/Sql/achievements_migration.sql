-- ============================================================
-- Achievements for the website's honours board (MySQL 8, safe to re-run).
-- Fresh installs get this from database.sql.
-- ============================================================

CREATE TABLE
    IF NOT EXISTS Achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title_en VARCHAR(255) NOT NULL,
        title_bn VARCHAR(255) NOT NULL,
        description_en TEXT,
        description_bn TEXT,
        category ENUM ('board_result', 'academic', 'sports', 'cultural', 'competition', 'award') NOT NULL,
        year SMALLINT NOT NULL,
        image_url VARCHAR(500),
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        exam_name VARCHAR(30) NULL COMMENT 'Board results only, e.g. SSC',
        examinees INT NULL,
        passed INT NULL,
        gpa5 INT NULL,
        branch_id INT NULL COMMENT 'Owning branch; NULL = whole school',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_achievements_showcase (is_published, is_featured, year)
    );

-- MySQL 8 has no "ADD CONSTRAINT IF NOT EXISTS", so check information_schema.
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Achievements' AND CONSTRAINT_NAME = 'fk_achievements_branch');
SET @sql := IF(@missing, 'ALTER TABLE Achievements ADD CONSTRAINT fk_achievements_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
