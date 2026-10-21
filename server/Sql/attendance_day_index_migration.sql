SET NAMES utf8mb4;

-- ============================================================
-- An index on the attendance day, for the attendance overview, which reads
-- one day of every branch. Safe to run again: it adds the index only when
-- it is missing.
--
-- Run: mysql -u <user> -p <database> < attendance_day_index_migration.sql
-- ============================================================

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Attendance' AND INDEX_NAME = 'idx_attendance_day');
SET @sql := IF(@missing, 'ALTER TABLE Attendance ADD INDEX idx_attendance_day (ClassDate)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
