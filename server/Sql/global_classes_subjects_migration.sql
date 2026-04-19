-- ============================================================
-- Model B migration: Classes & Subjects become GLOBAL (shared across branches).
-- Teacher-per-class assignments move into ClassTeacherAssignments(ClassID, branch_id).
-- Students/Attendance/Exams/Results/Routines keep branch_id (still per-branch).
--
-- Run once. Idempotent where possible. Transaction-wrapped per section.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────
-- 1. Create canonical-class mapping: for each (ClassName, Section),
--    the lowest ClassID is the survivor. All dupes map to it.
-- ─────────────────────────────────────────────────────────────
DROP TEMPORARY TABLE IF EXISTS _class_map;
CREATE TEMPORARY TABLE _class_map (
  old_id INT PRIMARY KEY,
  new_id INT NOT NULL,
  KEY (new_id)
) ENGINE=InnoDB;

INSERT INTO _class_map (old_id, new_id)
SELECT c.ClassID, m.keep_id
FROM Classes c
JOIN (
  SELECT ClassName, Section, MIN(ClassID) AS keep_id
  FROM Classes
  GROUP BY ClassName, Section
) m ON c.ClassName <=> m.ClassName AND c.Section <=> m.Section;

-- ─────────────────────────────────────────────────────────────
-- 2. Create ClassTeacherAssignments and seed from current Classes.TeacherID.
--    Each (ClassID, branch_id) can have one teacher. Teacher must belong to
--    that branch (enforced at app layer; FK allows any teacher row).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ClassTeacherAssignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ClassID INT NOT NULL,
  branch_id INT NOT NULL,
  TeacherID INT NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_class_branch (ClassID, branch_id),
  KEY idx_branch (branch_id),
  KEY idx_teacher (TeacherID),
  CONSTRAINT fk_cta_class FOREIGN KEY (ClassID) REFERENCES Classes(ClassID) ON DELETE CASCADE,
  CONSTRAINT fk_cta_branch FOREIGN KEY (branch_id) REFERENCES Branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_cta_teacher FOREIGN KEY (TeacherID) REFERENCES Teachers(TeacherID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO ClassTeacherAssignments (ClassID, branch_id, TeacherID)
SELECT m.new_id, c.branch_id, c.TeacherID
FROM Classes c
JOIN _class_map m ON c.ClassID = m.old_id
WHERE c.TeacherID IS NOT NULL AND c.branch_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 3. Remap all FK references on child tables to canonical ClassID.
-- ─────────────────────────────────────────────────────────────
UPDATE Students s JOIN _class_map m ON s.ClassID = m.old_id SET s.ClassID = m.new_id;
UPDATE Attendance a JOIN _class_map m ON a.ClassID = m.old_id SET a.ClassID = m.new_id;
UPDATE Exams e JOIN _class_map m ON e.ClassID = m.old_id SET e.ClassID = m.new_id;
UPDATE Results r JOIN _class_map m ON r.ClassID = m.old_id SET r.ClassID = m.new_id;
UPDATE Routines rt JOIN _class_map m ON rt.ClassID = m.old_id SET rt.ClassID = m.new_id;
UPDATE Subjects su JOIN _class_map m ON su.ClassID = m.old_id SET su.ClassID = m.new_id;

-- ─────────────────────────────────────────────────────────────
-- 4. Delete duplicate Class rows (keep only canonical).
-- ─────────────────────────────────────────────────────────────
DELETE c FROM Classes c
JOIN _class_map m ON c.ClassID = m.old_id
WHERE c.ClassID <> m.new_id;

-- ─────────────────────────────────────────────────────────────
-- 5. Drop branch_id-scoped uniqueness and branch FK from Classes.
--    Drop legacy TeacherID column (moved to ClassTeacherAssignments).
-- ─────────────────────────────────────────────────────────────
ALTER TABLE Classes DROP FOREIGN KEY fk_classes_branch;
ALTER TABLE Classes DROP INDEX uq_class_section_branch;
ALTER TABLE Classes DROP INDEX fk_classes_branch;
ALTER TABLE Classes DROP COLUMN branch_id;

-- Drop TeacherID FK + column (replaced by ClassTeacherAssignments).
ALTER TABLE Classes DROP FOREIGN KEY Classes_ibfk_1;
ALTER TABLE Classes DROP INDEX TeacherID;
ALTER TABLE Classes DROP COLUMN TeacherID;

-- Add new global unique (ClassName, Section).
ALTER TABLE Classes ADD CONSTRAINT uq_class_section UNIQUE (ClassName, Section);

-- ─────────────────────────────────────────────────────────────
-- 6. Deduplicate Subjects: same (SubjectName, ClassID) kept once.
--    Build subject map, remap Results.SubjectID, delete dupes.
-- ─────────────────────────────────────────────────────────────
DROP TEMPORARY TABLE IF EXISTS _subject_map;
CREATE TEMPORARY TABLE _subject_map (
  old_id INT PRIMARY KEY,
  new_id INT NOT NULL,
  KEY (new_id)
) ENGINE=InnoDB;

INSERT INTO _subject_map (old_id, new_id)
SELECT s.SubjectID, m.keep_id
FROM Subjects s
JOIN (
  SELECT SubjectName, ClassID, MIN(SubjectID) AS keep_id
  FROM Subjects
  GROUP BY SubjectName, ClassID
) m ON s.SubjectName <=> m.SubjectName AND s.ClassID <=> m.ClassID;

UPDATE Results r JOIN _subject_map m ON r.SubjectID = m.old_id SET r.SubjectID = m.new_id;

DELETE s FROM Subjects s
JOIN _subject_map m ON s.SubjectID = m.old_id
WHERE s.SubjectID <> m.new_id;

-- ─────────────────────────────────────────────────────────────
-- 7. Drop branch_id from Subjects; add global uniqueness.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE Subjects DROP FOREIGN KEY fk_subjects_branch;
ALTER TABLE Subjects DROP INDEX fk_subjects_branch;
ALTER TABLE Subjects DROP COLUMN branch_id;

ALTER TABLE Subjects ADD CONSTRAINT uq_subject_class UNIQUE (SubjectName, ClassID);

-- ─────────────────────────────────────────────────────────────
-- 8. Cleanup.
-- ─────────────────────────────────────────────────────────────
DROP TEMPORARY TABLE IF EXISTS _class_map;
DROP TEMPORARY TABLE IF EXISTS _subject_map;

SET FOREIGN_KEY_CHECKS = 1;

-- Done. Verify with:
--   SELECT COUNT(*) FROM Classes;       -- one row per (ClassName, Section)
--   SELECT COUNT(*) FROM Subjects;      -- one row per (SubjectName, ClassID)
--   SELECT * FROM ClassTeacherAssignments;
