-- ============================================================
-- Quiz question bank (MySQL 8 compatible, safe to re-run).
-- Adds class, Bangla text, hide/show and import tracking to QuizQuestions.
-- Fresh installs already get all of this from database.sql.
--
-- MySQL 8 has no "ADD COLUMN IF NOT EXISTS" (MariaDB-only), so each change
-- checks information_schema and runs a prepared statement.
--
-- After running it, import the BEnQA questions (Class 8 and 10):
--   cd server && npm run seed:quiz
-- ============================================================

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND COLUMN_NAME = 'SourceKey');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD COLUMN SourceKey VARCHAR(120) DEFAULT NULL', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND COLUMN_NAME = 'ClassKey');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD COLUMN ClassKey VARCHAR(20) DEFAULT NULL', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND COLUMN_NAME = 'PromptBn');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD COLUMN PromptBn TEXT DEFAULT NULL', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND COLUMN_NAME = 'OptionsBnJSON');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD COLUMN OptionsBnJSON JSON DEFAULT NULL', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND COLUMN_NAME = 'Active');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD COLUMN Active BOOLEAN NOT NULL DEFAULT TRUE', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND COLUMN_NAME = 'CreatedBy');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD COLUMN CreatedBy INT DEFAULT NULL', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND COLUMN_NAME = 'UpdatedBy');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD COLUMN UpdatedBy INT DEFAULT NULL', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND INDEX_NAME = 'uq_quiz_question_source');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD CONSTRAINT uq_quiz_question_source UNIQUE (SourceKey)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' AND INDEX_NAME = 'idx_quiz_question_class_subject');
SET @sql := IF(@missing, 'ALTER TABLE QuizQuestions ADD INDEX idx_quiz_question_class_subject (ClassKey, Subject)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Older rows only have a free-text Grade ("10th", "8", "Class 5").
UPDATE QuizQuestions
SET ClassKey = CAST(CAST(REGEXP_SUBSTR(Grade, '[0-9]+') AS UNSIGNED) AS CHAR)
WHERE ClassKey IS NULL
  AND Grade REGEXP '^(class[ _-]*)?[0-9]{1,2}(st|nd|rd|th)?$';
