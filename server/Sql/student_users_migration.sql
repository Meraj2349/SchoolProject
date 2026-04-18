-- ============================================================
-- Student Users table — for the Quicker Education student portal.
-- Self-registered students log in here to take quizzes and track
-- their own progress. Independent of the admin-managed Students
-- table; an optional FK to Students.StudentID allows future linking.
-- ============================================================

CREATE TABLE IF NOT EXISTS StudentUsers (
  StudentUserID INT PRIMARY KEY AUTO_INCREMENT,
  Email VARCHAR(150) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  FirstName VARCHAR(80) NOT NULL,
  LastName VARCHAR(80) NOT NULL,
  ClassName VARCHAR(50) DEFAULT NULL,
  Section VARCHAR(20) DEFAULT NULL,
  RollNumber VARCHAR(20) DEFAULT NULL,
  branch_id INT DEFAULT NULL,
  StudentID INT DEFAULT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_studentusers_branch
    FOREIGN KEY (branch_id) REFERENCES Branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_studentusers_student
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE SET NULL,
  INDEX idx_studentusers_branch (branch_id),
  INDEX idx_studentusers_class (ClassName, Section)
);

-- Link QuizSessions to the logged-in student user (nullable for legacy rows).
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizSessions' AND COLUMN_NAME = 'StudentUserID'
);
SET @sql := IF(@has_col = 0, 'ALTER TABLE QuizSessions ADD COLUMN StudentUserID INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizSessions' AND COLUMN_NAME = 'branch_id'
);
SET @sql := IF(@has_col = 0, 'ALTER TABLE QuizSessions ADD COLUMN branch_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizSessions'
    AND CONSTRAINT_NAME = 'fk_quizsessions_studentuser'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE QuizSessions ADD CONSTRAINT fk_quizsessions_studentuser FOREIGN KEY (StudentUserID) REFERENCES StudentUsers(StudentUserID) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizSessions'
    AND CONSTRAINT_NAME = 'fk_quizsessions_branch'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE QuizSessions ADD CONSTRAINT fk_quizsessions_branch FOREIGN KEY (branch_id) REFERENCES Branches(id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
