-- Comments below hold Bangla text: read the file as UTF-8 whatever the client default.
SET NAMES utf8mb4;

-- ============================================================
-- Attendance v2 (MySQL 8, safe to re-run). Fresh installs get this from database.sql.
--   * one row per student per day (the old key let a student hold two rows for
--     one day under another or a NULL class); the newest row is kept
--   * the Leave (ছুটি) status
--   * who marked the day and when (an admin, or a class teacher in the app)
--   * teachers' sign-in for the attendance app
--   * the queue of absence SMS to parents
-- MySQL 8 has no "ADD COLUMN IF NOT EXISTS", so each step checks information_schema.
-- ============================================================

-- ── Attendance ───────────────────────────────────────────────
ALTER TABLE Attendance MODIFY Status ENUM ('Present', 'Absent', 'Late', 'Leave') NOT NULL;

-- Keep the newest row (highest id) of every student and day.
DELETE older FROM Attendance older
  JOIN Attendance newer
    ON newer.StudentID = older.StudentID AND newer.ClassDate = older.ClassDate AND newer.AttendanceID > older.AttendanceID;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Attendance' AND INDEX_NAME = 'uq_attendance_student_day');
SET @sql := IF(@missing, 'ALTER TABLE Attendance ADD CONSTRAINT uq_attendance_student_day UNIQUE (StudentID, ClassDate)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- The old unique key (StudentID, ClassID, ClassDate), whatever it was named.
SET @old := (SELECT INDEX_NAME FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Attendance' AND NON_UNIQUE = 0 AND COLUMN_NAME = 'ClassID' LIMIT 1);
SET @sql := IF(@old IS NULL, 'DO 0', CONCAT('ALTER TABLE Attendance DROP INDEX `', @old, '`'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Attendance' AND INDEX_NAME = 'idx_attendance_class_day');
SET @sql := IF(@missing, 'ALTER TABLE Attendance ADD INDEX idx_attendance_class_day (ClassID, ClassDate)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Attendance' AND COLUMN_NAME = 'MarkedByType');
SET @sql := IF(@missing, 'ALTER TABLE Attendance
  ADD COLUMN MarkedByType ENUM (''admin'', ''teacher'') NULL,
  ADD COLUMN MarkedBy INT NULL COMMENT ''Admin.AdminID or Teachers.TeacherID, by MarkedByType'',
  ADD COLUMN MarkedAt TIMESTAMP NULL COMMENT ''When the day was taken; a save taken earlier never overwrites it'',
  ADD COLUMN UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Teachers: sign-in for the attendance app ─────────────────
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Teachers' AND COLUMN_NAME = 'AppPhone');
SET @sql := IF(@missing, 'ALTER TABLE Teachers
  ADD COLUMN AppPhone CHAR(11) NULL COMMENT ''Mobile number the teacher signs in with'',
  ADD COLUMN AppPasswordHash VARCHAR(100) NULL,
  ADD COLUMN AppEnabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN TokenVersion INT NOT NULL DEFAULT 0 COMMENT ''Bumped to sign the teacher out everywhere'',
  ADD COLUMN LastLoginAt TIMESTAMP NULL,
  ADD COLUMN FailedLogins TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN LockedUntil TIMESTAMP NULL,
  ADD CONSTRAINT uq_teachers_app_phone UNIQUE (AppPhone)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Absence SMS to parents: at most one per student per day ──
CREATE TABLE
    IF NOT EXISTS AttendanceSms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        class_date DATE NOT NULL,
        phone VARCHAR(20) NULL COMMENT 'The parent number it was sent to',
        due_at TIMESTAMP NOT NULL COMMENT 'Sent from this time on, if the student is still absent',
        status ENUM ('pending', 'sending', 'sent', 'failed', 'cancelled', 'skipped') NOT NULL DEFAULT 'pending',
        attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
        provider_ref VARCHAR(100) NULL,
        sent_at TIMESTAMP NULL,
        error VARCHAR(255) NULL,
        branch_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_attendance_sms_day UNIQUE (student_id, class_date),
        INDEX idx_attendance_sms_due (status, due_at),
        INDEX idx_attendance_sms_branch_day (branch_id, class_date)
    );

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AttendanceSms' AND CONSTRAINT_NAME = 'fk_attendance_sms_student');
SET @sql := IF(@missing, 'ALTER TABLE AttendanceSms ADD CONSTRAINT fk_attendance_sms_student FOREIGN KEY (student_id) REFERENCES Students (StudentID) ON DELETE CASCADE', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AttendanceSms' AND CONSTRAINT_NAME = 'fk_attendance_sms_branch');
SET @sql := IF(@missing, 'ALTER TABLE AttendanceSms ADD CONSTRAINT fk_attendance_sms_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
