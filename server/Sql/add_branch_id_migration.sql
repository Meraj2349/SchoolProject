-- ============================================================
-- Branch-wise Multi-tenant Migration (MySQL 8 compatible, safe to re-run)
-- Run once against an existing database created from an older
-- database.sql. Fresh installs already get all of this from database.sql.
--
-- MySQL 8 has no "ADD COLUMN IF NOT EXISTS" (that is MariaDB-only), so each
-- change checks information_schema first and runs a prepared statement.
-- ============================================================

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_fk_if_missing;

DELIMITER //

CREATE PROCEDURE add_column_if_missing(IN tbl VARCHAR(64), IN col VARCHAR(64), IN definition TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', definition);
    PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  END IF;
END //

CREATE PROCEDURE add_fk_if_missing(IN tbl VARCHAR(64), IN fk VARCHAR(64), IN definition TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl
      AND CONSTRAINT_NAME = fk AND CONSTRAINT_TYPE = 'FOREIGN KEY'
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD CONSTRAINT `', fk, '` ', definition);
    PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  END IF;
END //

DELIMITER ;

-- 1. Admins: role + branch (NULL branch = super_admin)
CALL add_column_if_missing('Admin', 'role', "ENUM('super_admin', 'branch_admin') NOT NULL DEFAULT 'branch_admin'");
CALL add_column_if_missing('Admin', 'branch_id', 'INT NULL');
CALL add_fk_if_missing('Admin', 'fk_admins_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id) ON DELETE SET NULL');

-- 2. Branch-owned tables (existing rows go to branch 1)
CALL add_column_if_missing('Students', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Students', 'fk_students_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

CALL add_column_if_missing('Teachers', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Teachers', 'fk_teachers_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

CALL add_column_if_missing('Classes', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Classes', 'fk_classes_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

CALL add_column_if_missing('Subjects', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Subjects', 'fk_subjects_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

CALL add_column_if_missing('Attendance', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Attendance', 'fk_attendance_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

CALL add_column_if_missing('Exams', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Exams', 'fk_exams_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

CALL add_column_if_missing('Results', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Results', 'fk_results_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

CALL add_column_if_missing('Routines', 'branch_id', 'INT NOT NULL DEFAULT 1');
CALL add_fk_if_missing('Routines', 'fk_routines_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

-- 3. Events: NULL branch = school-wide event shown in every branch
CALL add_column_if_missing('Events', 'branch_id', 'INT NULL');
CALL add_fk_if_missing('Events', 'fk_events_branch', 'FOREIGN KEY (branch_id) REFERENCES Branches(id)');

-- 4. Quiz sessions are scoped to the student's branch
CALL add_column_if_missing('QuizSessions', 'branch_id', 'INT NULL');

DROP PROCEDURE add_column_if_missing;
DROP PROCEDURE add_fk_if_missing;

-- 5. Per-branch uniqueness: each branch has its own (ClassName, Section) namespace.
-- Drops the legacy global unique (if present) then adds the scoped one.
SET @has_legacy := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Classes' AND INDEX_NAME = 'ClassName'
);
SET @sql := IF(@has_legacy > 0, 'ALTER TABLE Classes DROP INDEX ClassName', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_scoped := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Classes' AND INDEX_NAME = 'uq_class_section_branch'
);
SET @sql := IF(@has_scoped = 0,
  'ALTER TABLE Classes ADD CONSTRAINT uq_class_section_branch UNIQUE (ClassName, Section, branch_id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
