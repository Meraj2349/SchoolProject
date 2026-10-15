-- ============================================================
-- Website content and applications per branch (MySQL 8, safe to re-run).
-- Adds an optional branch_id to Notices, NoticeAnnouncements, News, Messages,
-- Images and Applications. NULL means the whole school, so every existing row
-- stays visible everywhere, as before. Fresh installs get this from database.sql.
--
-- MySQL 8 has no "ADD COLUMN IF NOT EXISTS" (MariaDB-only), so each change
-- checks information_schema and runs a prepared statement.
-- ============================================================

-- Notices
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notices' AND COLUMN_NAME = 'branch_id');
SET @sql := IF(@missing, 'ALTER TABLE Notices ADD COLUMN branch_id INT NULL COMMENT ''Owning branch; NULL = whole school''', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notices' AND CONSTRAINT_NAME = 'fk_notices_branch');
SET @sql := IF(@missing, 'ALTER TABLE Notices ADD CONSTRAINT fk_notices_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- NoticeAnnouncements
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'NoticeAnnouncements' AND COLUMN_NAME = 'branch_id');
SET @sql := IF(@missing, 'ALTER TABLE NoticeAnnouncements ADD COLUMN branch_id INT NULL COMMENT ''Owning branch; NULL = whole school''', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'NoticeAnnouncements' AND CONSTRAINT_NAME = 'fk_notice_announcements_branch');
SET @sql := IF(@missing, 'ALTER TABLE NoticeAnnouncements ADD CONSTRAINT fk_notice_announcements_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- News
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'News' AND COLUMN_NAME = 'branch_id');
SET @sql := IF(@missing, 'ALTER TABLE News ADD COLUMN branch_id INT NULL COMMENT ''Owning branch; NULL = whole school''', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'News' AND CONSTRAINT_NAME = 'fk_news_branch');
SET @sql := IF(@missing, 'ALTER TABLE News ADD CONSTRAINT fk_news_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Messages (chairman's messages)
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Messages' AND COLUMN_NAME = 'branch_id');
SET @sql := IF(@missing, 'ALTER TABLE Messages ADD COLUMN branch_id INT NULL COMMENT ''Owning branch; NULL = whole school''', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Messages' AND CONSTRAINT_NAME = 'fk_messages_branch');
SET @sql := IF(@missing, 'ALTER TABLE Messages ADD CONSTRAINT fk_messages_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Images (gallery)
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Images' AND COLUMN_NAME = 'branch_id');
SET @sql := IF(@missing, 'ALTER TABLE Images ADD COLUMN branch_id INT NULL COMMENT ''Owning branch (a student/teacher photo: their branch); NULL = whole school''', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Images' AND CONSTRAINT_NAME = 'fk_images_branch');
SET @sql := IF(@missing, 'ALTER TABLE Images ADD CONSTRAINT fk_images_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Applications
SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Applications' AND COLUMN_NAME = 'branch_id');
SET @sql := IF(@missing, 'ALTER TABLE Applications ADD COLUMN branch_id INT NULL COMMENT ''Branch applied to; the student is enrolled there''', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @missing := (SELECT COUNT(*) = 0 FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Applications' AND CONSTRAINT_NAME = 'fk_applications_branch');
SET @sql := IF(@missing, 'ALTER TABLE Applications ADD CONSTRAINT fk_applications_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- A student's or teacher's photo belongs to that person's branch.
UPDATE Images i
  JOIN Students s ON s.StudentID = i.StudentID
   SET i.branch_id = s.branch_id
 WHERE i.branch_id IS NULL OR i.branch_id <> s.branch_id;

UPDATE Images i
  JOIN Teachers t ON t.TeacherID = i.TeacherID
   SET i.branch_id = t.branch_id
 WHERE i.StudentID IS NULL AND (i.branch_id IS NULL OR i.branch_id <> t.branch_id);
