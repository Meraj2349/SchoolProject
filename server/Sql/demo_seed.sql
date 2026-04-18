-- ============================================================
-- demo_seed.sql  —  School Management System Demo Data
-- Clears data tables (keeps schema + branches + admin accounts)
-- then re-seeds with realistic Bangladeshi demo data.
-- 3 branches × 11 classes × 3 sections × 5 students = 495 students
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. DELETE DATA (correct FK order) ──────────────────────
DELETE FROM Results;
DELETE FROM Attendance;
DELETE FROM Exams;
DELETE FROM Subjects;
DELETE FROM Students;
DELETE FROM Classes;
DELETE FROM Teachers;
-- Reset auto-increment counters
ALTER TABLE Results    AUTO_INCREMENT = 1;
ALTER TABLE Attendance AUTO_INCREMENT = 1;
ALTER TABLE Exams      AUTO_INCREMENT = 1;
ALTER TABLE Subjects   AUTO_INCREMENT = 1;
ALTER TABLE Students   AUTO_INCREMENT = 1;
ALTER TABLE Classes    AUTO_INCREMENT = 1;
ALTER TABLE Teachers   AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ── 2. TEACHERS (15 total — 5 per branch) ──────────────────
INSERT INTO Teachers (FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, Address, branch_id) VALUES
-- Branch 1
('Md. Rafiqul',  'Islam',       'Mathematics',      '01711000001', 'rafiqul.islam@starsikkha.edu.bd',    '2018-01-10', 'Natiapara, Sylhet',   1),
('Fatema',       'Begum',       'English',          '01711000002', 'fatema.begum@starsikkha.edu.bd',     '2019-03-15', 'Natiapara, Sylhet',   1),
('Md. Karim',    'Hossain',     'Bangla',           '01711000003', 'karim.hossain@starsikkha.edu.bd',    '2017-06-01', 'Natiapara, Sylhet',   1),
('Shahanaz',     'Parvin',      'Science',          '01711000004', 'shahanaz.parvin@starsikkha.edu.bd',  '2020-08-20', 'Natiapara, Sylhet',   1),
('Md. Jahangir', 'Alam',        'Social Studies',   '01711000005', 'jahangir.alam@starsikkha.edu.bd',    '2016-11-05', 'Natiapara, Sylhet',   1),
-- Branch 2
('Nasrin',       'Sultana',     'Mathematics',      '01711000006', 'nasrin.sultana@starsikkha.edu.bd',   '2018-02-14', 'Pakullah Bazar, Sylhet', 2),
('Md. Shafiqul', 'Haque',       'English',          '01711000007', 'shafiqul.haque@starsikkha.edu.bd',   '2019-04-10', 'Pakullah Bazar, Sylhet', 2),
('Rokeya',       'Khatun',      'Bangla',           '01711000008', 'rokeya.khatun@starsikkha.edu.bd',    '2017-07-25', 'Pakullah Bazar, Sylhet', 2),
('Md. Anisur',   'Rahman',      'Science',          '01711000009', 'anisur.rahman@starsikkha.edu.bd',    '2021-01-03', 'Pakullah Bazar, Sylhet', 2),
('Halima',       'Akter',       'Religion',         '01711000010', 'halima.akter@starsikkha.edu.bd',     '2020-09-12', 'Pakullah Bazar, Sylhet', 2),
-- Branch 3
('Md. Belal',    'Hossain',     'Mathematics',      '01711000011', 'belal.hossain@starsikkha.edu.bd',    '2018-03-18', 'Mirjapur, Sylhet',    3),
('Taslima',      'Khanam',      'English',          '01711000012', 'taslima.khanam@starsikkha.edu.bd',   '2019-05-22', 'Mirjapur, Sylhet',    3),
('Md. Nurul',    'Islam',       'Bangla',           '01711000013', 'nurul.islam@starsikkha.edu.bd',      '2017-08-08', 'Mirjapur, Sylhet',    3),
('Morsheda',     'Begum',       'Science',          '01711000014', 'morsheda.begum@starsikkha.edu.bd',   '2021-02-17', 'Mirjapur, Sylhet',    3),
('Md. Lutfor',   'Rahman',      'Social Studies',   '01711000015', 'lutfor.rahman@starsikkha.edu.bd',    '2016-12-01', 'Mirjapur, Sylhet',    3);

-- ── 3. CLASSES (11 classes × 3 sections × 3 branches = 99) ─
-- Branch 1
INSERT INTO Classes (ClassName, Section, branch_id) VALUES
('Nursery','Better',1),('Nursery','Good',1),('Nursery','General',1),
('1','Better',1),('1','Good',1),('1','General',1),
('2','Better',1),('2','Good',1),('2','General',1),
('3','Better',1),('3','Good',1),('3','General',1),
('4','Better',1),('4','Good',1),('4','General',1),
('5','Better',1),('5','Good',1),('5','General',1),
('6','Better',1),('6','Good',1),('6','General',1),
('7','Better',1),('7','Good',1),('7','General',1),
('8','Better',1),('8','Good',1),('8','General',1),
('9','Better',1),('9','Good',1),('9','General',1),
('10','Better',1),('10','Good',1),('10','General',1);
-- Branch 2
INSERT INTO Classes (ClassName, Section, branch_id) VALUES
('Nursery','Better',2),('Nursery','Good',2),('Nursery','General',2),
('1','Better',2),('1','Good',2),('1','General',2),
('2','Better',2),('2','Good',2),('2','General',2),
('3','Better',2),('3','Good',2),('3','General',2),
('4','Better',2),('4','Good',2),('4','General',2),
('5','Better',2),('5','Good',2),('5','General',2),
('6','Better',2),('6','Good',2),('6','General',2),
('7','Better',2),('7','Good',2),('7','General',2),
('8','Better',2),('8','Good',2),('8','General',2),
('9','Better',2),('9','Good',2),('9','General',2),
('10','Better',2),('10','Good',2),('10','General',2);
-- Branch 3
INSERT INTO Classes (ClassName, Section, branch_id) VALUES
('Nursery','Better',3),('Nursery','Good',3),('Nursery','General',3),
('1','Better',3),('1','Good',3),('1','General',3),
('2','Better',3),('2','Good',3),('2','General',3),
('3','Better',3),('3','Good',3),('3','General',3),
('4','Better',3),('4','Good',3),('4','General',3),
('5','Better',3),('5','Good',3),('5','General',3),
('6','Better',3),('6','Good',3),('6','General',3),
('7','Better',3),('7','Good',3),('7','General',3),
('8','Better',3),('8','Good',3),('8','General',3),
('9','Better',3),('9','Good',3),('9','General',3),
('10','Better',3),('10','Good',3),('10','General',3);

-- ── 4. SUBJECTS ─────────────────────────────────────────────
-- We create subjects for EACH class in EACH branch.
-- Nursery: English, Math, Drawing (3 subjects)
-- Class 1-5: English, Bangla, Math, Science (4 subjects)
-- Class 6-10: English, Bangla, Math, Science, Social Studies, Religion (6 subjects)

-- Helper: insert subjects for a given class_id list
-- We'll do it per branch and class combination using class lookups.

-- Branch 1 subjects
INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT 'Nursery' AS cn, 'English'   AS SubjectName UNION ALL
  SELECT 'Nursery',       'Math'                     UNION ALL
  SELECT 'Nursery',       'Drawing'
) s ON c.ClassName = s.cn AND c.branch_id = 1;

INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT '1' AS cn, 'English' AS SubjectName UNION ALL SELECT '1','Bangla' UNION ALL SELECT '1','Math' UNION ALL SELECT '1','Science' UNION ALL
  SELECT '2',       'English'                UNION ALL SELECT '2','Bangla' UNION ALL SELECT '2','Math' UNION ALL SELECT '2','Science' UNION ALL
  SELECT '3',       'English'                UNION ALL SELECT '3','Bangla' UNION ALL SELECT '3','Math' UNION ALL SELECT '3','Science' UNION ALL
  SELECT '4',       'English'                UNION ALL SELECT '4','Bangla' UNION ALL SELECT '4','Math' UNION ALL SELECT '4','Science' UNION ALL
  SELECT '5',       'English'                UNION ALL SELECT '5','Bangla' UNION ALL SELECT '5','Math' UNION ALL SELECT '5','Science'
) s ON c.ClassName = s.cn AND c.branch_id = 1;

INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT '6'  AS cn, 'English' AS SubjectName UNION ALL SELECT '6', 'Bangla' UNION ALL SELECT '6', 'Math' UNION ALL SELECT '6', 'Science' UNION ALL SELECT '6', 'Social Studies' UNION ALL SELECT '6', 'Religion' UNION ALL
  SELECT '7',        'English'                UNION ALL SELECT '7', 'Bangla' UNION ALL SELECT '7', 'Math' UNION ALL SELECT '7', 'Science' UNION ALL SELECT '7', 'Social Studies' UNION ALL SELECT '7', 'Religion' UNION ALL
  SELECT '8',        'English'                UNION ALL SELECT '8', 'Bangla' UNION ALL SELECT '8', 'Math' UNION ALL SELECT '8', 'Science' UNION ALL SELECT '8', 'Social Studies' UNION ALL SELECT '8', 'Religion' UNION ALL
  SELECT '9',        'English'                UNION ALL SELECT '9', 'Bangla' UNION ALL SELECT '9', 'Math' UNION ALL SELECT '9', 'Science' UNION ALL SELECT '9', 'Social Studies' UNION ALL SELECT '9', 'Religion' UNION ALL
  SELECT '10',       'English'                UNION ALL SELECT '10','Bangla' UNION ALL SELECT '10','Math' UNION ALL SELECT '10','Science' UNION ALL SELECT '10','Social Studies' UNION ALL SELECT '10','Religion'
) s ON c.ClassName = s.cn AND c.branch_id = 1;

-- Branch 2 subjects (same pattern)
INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT 'Nursery' AS cn, 'English' AS SubjectName UNION ALL
  SELECT 'Nursery',       'Math'                   UNION ALL
  SELECT 'Nursery',       'Drawing'
) s ON c.ClassName = s.cn AND c.branch_id = 2;

INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT '1' AS cn, 'English' AS SubjectName UNION ALL SELECT '1','Bangla' UNION ALL SELECT '1','Math' UNION ALL SELECT '1','Science' UNION ALL
  SELECT '2',       'English'                UNION ALL SELECT '2','Bangla' UNION ALL SELECT '2','Math' UNION ALL SELECT '2','Science' UNION ALL
  SELECT '3',       'English'                UNION ALL SELECT '3','Bangla' UNION ALL SELECT '3','Math' UNION ALL SELECT '3','Science' UNION ALL
  SELECT '4',       'English'                UNION ALL SELECT '4','Bangla' UNION ALL SELECT '4','Math' UNION ALL SELECT '4','Science' UNION ALL
  SELECT '5',       'English'                UNION ALL SELECT '5','Bangla' UNION ALL SELECT '5','Math' UNION ALL SELECT '5','Science'
) s ON c.ClassName = s.cn AND c.branch_id = 2;

INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT '6'  AS cn, 'English' AS SubjectName UNION ALL SELECT '6', 'Bangla' UNION ALL SELECT '6', 'Math' UNION ALL SELECT '6', 'Science' UNION ALL SELECT '6', 'Social Studies' UNION ALL SELECT '6', 'Religion' UNION ALL
  SELECT '7',        'English'                UNION ALL SELECT '7', 'Bangla' UNION ALL SELECT '7', 'Math' UNION ALL SELECT '7', 'Science' UNION ALL SELECT '7', 'Social Studies' UNION ALL SELECT '7', 'Religion' UNION ALL
  SELECT '8',        'English'                UNION ALL SELECT '8', 'Bangla' UNION ALL SELECT '8', 'Math' UNION ALL SELECT '8', 'Science' UNION ALL SELECT '8', 'Social Studies' UNION ALL SELECT '8', 'Religion' UNION ALL
  SELECT '9',        'English'                UNION ALL SELECT '9', 'Bangla' UNION ALL SELECT '9', 'Math' UNION ALL SELECT '9', 'Science' UNION ALL SELECT '9', 'Social Studies' UNION ALL SELECT '9', 'Religion' UNION ALL
  SELECT '10',       'English'                UNION ALL SELECT '10','Bangla' UNION ALL SELECT '10','Math' UNION ALL SELECT '10','Science' UNION ALL SELECT '10','Social Studies' UNION ALL SELECT '10','Religion'
) s ON c.ClassName = s.cn AND c.branch_id = 2;

-- Branch 3 subjects (same pattern)
INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT 'Nursery' AS cn, 'English' AS SubjectName UNION ALL
  SELECT 'Nursery',       'Math'                   UNION ALL
  SELECT 'Nursery',       'Drawing'
) s ON c.ClassName = s.cn AND c.branch_id = 3;

INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT '1' AS cn, 'English' AS SubjectName UNION ALL SELECT '1','Bangla' UNION ALL SELECT '1','Math' UNION ALL SELECT '1','Science' UNION ALL
  SELECT '2',       'English'                UNION ALL SELECT '2','Bangla' UNION ALL SELECT '2','Math' UNION ALL SELECT '2','Science' UNION ALL
  SELECT '3',       'English'                UNION ALL SELECT '3','Bangla' UNION ALL SELECT '3','Math' UNION ALL SELECT '3','Science' UNION ALL
  SELECT '4',       'English'                UNION ALL SELECT '4','Bangla' UNION ALL SELECT '4','Math' UNION ALL SELECT '4','Science' UNION ALL
  SELECT '5',       'English'                UNION ALL SELECT '5','Bangla' UNION ALL SELECT '5','Math' UNION ALL SELECT '5','Science'
) s ON c.ClassName = s.cn AND c.branch_id = 3;

INSERT INTO Subjects (SubjectName, ClassID)
SELECT s.SubjectName, c.ClassID
FROM Classes c
JOIN (
  SELECT '6'  AS cn, 'English' AS SubjectName UNION ALL SELECT '6', 'Bangla' UNION ALL SELECT '6', 'Math' UNION ALL SELECT '6', 'Science' UNION ALL SELECT '6', 'Social Studies' UNION ALL SELECT '6', 'Religion' UNION ALL
  SELECT '7',        'English'                UNION ALL SELECT '7', 'Bangla' UNION ALL SELECT '7', 'Math' UNION ALL SELECT '7', 'Science' UNION ALL SELECT '7', 'Social Studies' UNION ALL SELECT '7', 'Religion' UNION ALL
  SELECT '8',        'English'                UNION ALL SELECT '8', 'Bangla' UNION ALL SELECT '8', 'Math' UNION ALL SELECT '8', 'Science' UNION ALL SELECT '8', 'Social Studies' UNION ALL SELECT '8', 'Religion' UNION ALL
  SELECT '9',        'English'                UNION ALL SELECT '9', 'Bangla' UNION ALL SELECT '9', 'Math' UNION ALL SELECT '9', 'Science' UNION ALL SELECT '9', 'Social Studies' UNION ALL SELECT '9', 'Religion' UNION ALL
  SELECT '10',       'English'                UNION ALL SELECT '10','Bangla' UNION ALL SELECT '10','Math' UNION ALL SELECT '10','Science' UNION ALL SELECT '10','Social Studies' UNION ALL SELECT '10','Religion'
) s ON c.ClassName = s.cn AND c.branch_id = 3;

-- ── 5. STUDENTS ──────────────────────────────────────────────
-- 5 students per class per section per branch = 495 total
-- Names: mix of Bangladeshi male & female names
-- Roll numbers: B<branch>-<class_abbr>-<section_abbr>-<01..05>
-- We use a stored procedure to loop over all 99 classes and insert 5 students each.

DROP PROCEDURE IF EXISTS seed_students;
DELIMITER //
CREATE PROCEDURE seed_students()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE cid INT;
  DECLARE cname VARCHAR(20);
  DECLARE csec VARCHAR(10);
  DECLARE cbranch INT;

  -- Name pools (10 male, 10 female)
  DECLARE male_names   VARCHAR(500) DEFAULT 'Arif,Rifat,Shahriar,Mahfuz,Tanvir,Imran,Sabbir,Nabil,Rakib,Fahim';
  DECLARE female_names VARCHAR(500) DEFAULT 'Sadia,Nusrat,Tasmia,Fahmida,Aysha,Sumaiya,Ripa,Maliha,Tahira,Bristy';

  DECLARE cur CURSOR FOR
    SELECT ClassID, ClassName, Section, branch_id FROM Classes ORDER BY branch_id, ClassID;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO cid, cname, csec, cbranch;
    IF done THEN LEAVE read_loop; END IF;

    -- Insert 5 students for this class
    SET @roll_prefix = CONCAT('B', cbranch, '-',
      CASE cname
        WHEN 'Nursery' THEN 'N'
        ELSE cname
      END, '-',
      LEFT(csec,2));

    -- Student 1 (Male)
    INSERT INTO Students (FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id)
    VALUES (
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(male_names,   ',', 1 + MOD(cid*1+0,10)), ',', -1)),
      CONCAT('Ahmed-', cid, 'A'),
      CONCAT(@roll_prefix, '-01'),
      DATE_SUB(CURDATE(), INTERVAL (CASE WHEN cname = 'Nursery' THEN 5 ELSE 5 + CAST(cname AS UNSIGNED) END) YEAR),
      'Male', cid, DATE_SUB(CURDATE(), INTERVAL 1 YEAR),
      CONCAT('House ', cid, ', Village Road, Sylhet'),
      CONCAT('017', LPAD(cbranch * 10000 + cid * 10 + 1, 8, '0')),
      cbranch
    );

    -- Student 2 (Female)
    INSERT INTO Students (FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id)
    VALUES (
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(female_names, ',', 1 + MOD(cid*2+0,10)), ',', -1)),
      CONCAT('Khatun-', cid, 'B'),
      CONCAT(@roll_prefix, '-02'),
      DATE_SUB(CURDATE(), INTERVAL (CASE WHEN cname = 'Nursery' THEN 5 ELSE 5 + CAST(cname AS UNSIGNED) END) YEAR),
      'Female', cid, DATE_SUB(CURDATE(), INTERVAL 1 YEAR),
      CONCAT('House ', cid+1, ', College Road, Sylhet'),
      CONCAT('018', LPAD(cbranch * 10000 + cid * 10 + 2, 8, '0')),
      cbranch
    );

    -- Student 3 (Male)
    INSERT INTO Students (FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id)
    VALUES (
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(male_names,   ',', 1 + MOD(cid*3+1,10)), ',', -1)),
      CONCAT('Hossain-', cid, 'C'),
      CONCAT(@roll_prefix, '-03'),
      DATE_SUB(CURDATE(), INTERVAL (CASE WHEN cname = 'Nursery' THEN 5 ELSE 5 + CAST(cname AS UNSIGNED) END) YEAR),
      'Male', cid, DATE_SUB(CURDATE(), INTERVAL 1 YEAR),
      CONCAT('House ', cid+2, ', Station Road, Sylhet'),
      CONCAT('019', LPAD(cbranch * 10000 + cid * 10 + 3, 8, '0')),
      cbranch
    );

    -- Student 4 (Female)
    INSERT INTO Students (FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id)
    VALUES (
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(female_names, ',', 1 + MOD(cid*4+2,10)), ',', -1)),
      CONCAT('Begum-', cid, 'D'),
      CONCAT(@roll_prefix, '-04'),
      DATE_SUB(CURDATE(), INTERVAL (CASE WHEN cname = 'Nursery' THEN 5 ELSE 5 + CAST(cname AS UNSIGNED) END) YEAR),
      'Female', cid, DATE_SUB(CURDATE(), INTERVAL 1 YEAR),
      CONCAT('House ', cid+3, ', Market Road, Sylhet'),
      CONCAT('016', LPAD(cbranch * 10000 + cid * 10 + 4, 8, '0')),
      cbranch
    );

    -- Student 5 (Male)
    INSERT INTO Students (FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id)
    VALUES (
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(male_names,   ',', 1 + MOD(cid*5+3,10)), ',', -1)),
      CONCAT('Miah-', cid, 'E'),
      CONCAT(@roll_prefix, '-05'),
      DATE_SUB(CURDATE(), INTERVAL (CASE WHEN cname = 'Nursery' THEN 5 ELSE 5 + CAST(cname AS UNSIGNED) END) YEAR),
      'Male', cid, DATE_SUB(CURDATE(), INTERVAL 1 YEAR),
      CONCAT('House ', cid+4, ', Bank Road, Sylhet'),
      CONCAT('015', LPAD(cbranch * 10000 + cid * 10 + 5, 8, '0')),
      cbranch
    );

  END LOOP;
  CLOSE cur;
END //
DELIMITER ;

CALL seed_students();
DROP PROCEDURE IF EXISTS seed_students;

-- ── 6. EXAMS (3 per branch = 9 total) ───────────────────────
-- One exam per exam-type per branch, linked to Class 6-Better (as representative class)
-- We insert per-branch Half-Yearly, Annual, and Monthly exams.
-- ExamID will be used in Results below.

INSERT INTO Exams (ExamType, ExamName, ClassID, ExamDate)
SELECT 'Half-Yearly', CONCAT('Half-Yearly Exam 2025 - Branch ', c.branch_id),
       c.ClassID, '2025-06-15'
FROM Classes c WHERE c.ClassName = '6' AND c.Section = 'Better'
ORDER BY c.branch_id;

INSERT INTO Exams (ExamType, ExamName, ClassID, ExamDate)
SELECT 'Annual', CONCAT('Annual Exam 2025 - Branch ', c.branch_id),
       c.ClassID, '2025-11-20'
FROM Classes c WHERE c.ClassName = '6' AND c.Section = 'Better'
ORDER BY c.branch_id;

INSERT INTO Exams (ExamType, ExamName, ClassID, ExamDate)
SELECT 'Monthly', CONCAT('Monthly Test March 2025 - Branch ', c.branch_id),
       c.ClassID, '2025-03-10'
FROM Classes c WHERE c.ClassName = '6' AND c.Section = 'Better'
ORDER BY c.branch_id;

-- ── 7. RESULTS ───────────────────────────────────────────────
-- For each student, for each exam whose ClassID branch matches the student's branch,
-- insert one result per subject in the student's class.
-- We use a procedure to handle the volume.

DROP PROCEDURE IF EXISTS seed_results;
DELIMITER //
CREATE PROCEDURE seed_results()
BEGIN
  DECLARE done_s INT DEFAULT 0;
  DECLARE sid INT;
  DECLARE s_classid INT;
  DECLARE s_branch INT;

  -- cursor over all students
  DECLARE cur_s CURSOR FOR
    SELECT StudentID, ClassID, branch_id FROM Students;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_s = 1;

  OPEN cur_s;
  s_loop: LOOP
    FETCH cur_s INTO sid, s_classid, s_branch;
    IF done_s THEN LEAVE s_loop; END IF;

    -- For each exam in this student's branch
    INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained)
    SELECT
      sid,
      e.ExamID,
      sub.SubjectID,
      s_classid,
      -- Marks 40-100: deterministic pseudo-random using IDs
      40 + MOD((sid * 7 + sub.SubjectID * 13 + e.ExamID * 3), 61)
    FROM Exams e
    JOIN Subjects sub ON sub.ClassID = s_classid
    JOIN Classes  ec  ON ec.ClassID = e.ClassID
    WHERE ec.branch_id = s_branch;

  END LOOP;
  CLOSE cur_s;
END //
DELIMITER ;

CALL seed_results();
DROP PROCEDURE IF EXISTS seed_results;

-- ── 8. ATTENDANCE (last 7 days, 85-95% present rate) ────────
-- For each student, insert attendance for the past 7 days.
-- Status: mostly Present, occasional Absent, using deterministic pseudo-random.

DROP PROCEDURE IF EXISTS seed_attendance;
DELIMITER //
CREATE PROCEDURE seed_attendance()
BEGIN
  DECLARE done_s INT DEFAULT 0;
  DECLARE sid INT;
  DECLARE s_classid INT;
  DECLARE s_branch INT;
  DECLARE d INT DEFAULT 0;
  DECLARE att_date DATE;
  DECLARE att_status ENUM('Present','Absent','Late');

  DECLARE cur_s CURSOR FOR
    SELECT StudentID, ClassID, branch_id FROM Students;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_s = 1;

  OPEN cur_s;
  s_loop: LOOP
    FETCH cur_s INTO sid, s_classid, s_branch;
    IF done_s THEN LEAVE s_loop; END IF;

    SET d = 0;
    day_loop: WHILE d < 7 DO
      SET att_date = DATE_SUB(CURDATE(), INTERVAL d DAY);
      -- Skip Fridays and Saturdays (bd weekend)
      IF DAYOFWEEK(att_date) NOT IN (1, 7) THEN
        -- ~88% present: absent when (sid + d) mod 9 == 0, late when mod 17 == 0
        IF MOD(sid + d * 3, 9) = 0 THEN
          SET att_status = 'Absent';
        ELSEIF MOD(sid + d * 5, 17) = 0 THEN
          SET att_status = 'Late';
        ELSE
          SET att_status = 'Present';
        END IF;

        INSERT IGNORE INTO Attendance (StudentID, ClassID, ClassDate, Status)
        VALUES (sid, s_classid, att_date, att_status);
      END IF;
      SET d = d + 1;
    END WHILE;

  END LOOP;
  CLOSE cur_s;
END //
DELIMITER ;

CALL seed_attendance();
DROP PROCEDURE IF EXISTS seed_attendance;

-- ── 9. VERIFY ────────────────────────────────────────────────
SELECT 'Branches'  AS tbl, COUNT(*) AS cnt FROM Branches
UNION ALL SELECT 'Admin',      COUNT(*) FROM Admin
UNION ALL SELECT 'Teachers',   COUNT(*) FROM Teachers
UNION ALL SELECT 'Classes',    COUNT(*) FROM Classes
UNION ALL SELECT 'Subjects',   COUNT(*) FROM Subjects
UNION ALL SELECT 'Students',   COUNT(*) FROM Students
UNION ALL SELECT 'Exams',      COUNT(*) FROM Exams
UNION ALL SELECT 'Results',    COUNT(*) FROM Results
UNION ALL SELECT 'Attendance', COUNT(*) FROM Attendance;
