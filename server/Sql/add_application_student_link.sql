-- Links an accepted application to the student it created, so accepting the
-- same application again does not enrol the child twice. Safe to re-run.
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Applications' AND COLUMN_NAME = 'student_id'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE Applications ADD COLUMN student_id INT NULL COMMENT ''Student created when the application was accepted'' AFTER status',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
