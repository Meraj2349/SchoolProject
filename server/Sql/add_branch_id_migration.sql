-- ============================================================
-- Branch-wise Multi-tenant Migration
-- Run this file once against your existing database.
-- All operational tables get a branch_id FK to Branches(id).
-- Admins table gets role + branch_id.
-- ============================================================

-- 1. Admins: add role and branch_id
ALTER TABLE Admin
  ADD COLUMN IF NOT EXISTS role ENUM('super_admin', 'branch_admin') NOT NULL DEFAULT 'branch_admin',
  ADD COLUMN IF NOT EXISTS branch_id INT NULL;

ALTER TABLE Admin
  ADD CONSTRAINT fk_admins_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id) ON DELETE SET NULL;

-- 2. Students
ALTER TABLE Students
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Students
  ADD CONSTRAINT fk_students_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 3. Teachers
ALTER TABLE Teachers
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Teachers
  ADD CONSTRAINT fk_teachers_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 4. Classes
ALTER TABLE Classes
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Classes
  ADD CONSTRAINT fk_classes_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 5. Subjects
ALTER TABLE Subjects
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Subjects
  ADD CONSTRAINT fk_subjects_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 6. Attendance
ALTER TABLE Attendance
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Attendance
  ADD CONSTRAINT fk_attendance_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 7. Exams
ALTER TABLE Exams
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Exams
  ADD CONSTRAINT fk_exams_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 8. Results
ALTER TABLE Results
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Results
  ADD CONSTRAINT fk_results_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 9. Events (nullable — school-wide events have NULL branch_id)
ALTER TABLE Events
  ADD COLUMN IF NOT EXISTS branch_id INT NULL;

ALTER TABLE Events
  ADD CONSTRAINT fk_events_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);

-- 10. Routines
ALTER TABLE Routines
  ADD COLUMN IF NOT EXISTS branch_id INT NOT NULL DEFAULT 1;

ALTER TABLE Routines
  ADD CONSTRAINT fk_routines_branch
  FOREIGN KEY (branch_id) REFERENCES Branches(id);
