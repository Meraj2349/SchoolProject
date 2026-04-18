-- ============================================================
-- Fix: make (ClassName, Section) unique per branch, not globally
-- The old UNIQUE(ClassName, Section) blocked Branch B from having
-- the same ClassName+Section that Branch A already had.
-- Safe to re-run (idempotent).
-- ============================================================

-- Drop legacy global unique index (implicit name = first column).
SET @has_legacy := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Classes' AND INDEX_NAME = 'ClassName'
);
SET @sql := IF(@has_legacy > 0, 'ALTER TABLE Classes DROP INDEX ClassName', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add per-branch unique if not already present.
SET @has_scoped := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Classes' AND INDEX_NAME = 'uq_class_section_branch'
);
SET @sql := IF(@has_scoped = 0,
  'ALTER TABLE Classes ADD CONSTRAINT uq_class_section_branch UNIQUE (ClassName, Section, branch_id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
