-- ============================================================
-- Fresh seed: clear old data, create ClassNames, insert
-- branch-wise data for all 3 branches.
-- Run: mysql -u root -padmin1234 School_Management < fresh_seed.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. Clear operational tables ───────────────────────────────
TRUNCATE TABLE QuizAttempts;
TRUNCATE TABLE QuizSessions;
TRUNCATE TABLE Results;
TRUNCATE TABLE Attendance;
TRUNCATE TABLE Exams;
TRUNCATE TABLE Subjects;
TRUNCATE TABLE Routines;
TRUNCATE TABLE Students;
TRUNCATE TABLE Classes;
TRUNCATE TABLE Teachers;

-- Clear admins except super_admin
DELETE FROM Admin WHERE role != 'super_admin';

-- ── 2. Branches: keep 1 & 2, add 3 (Mirjapur) ────────────────
DELETE FROM Branches WHERE id NOT IN (1, 2);

-- Ensure branch 1 & 2 exist with clean names
INSERT INTO Branches (id, name_en, name_bn, address_en, address_bn, is_proposed, established_date)
VALUES
  (1, 'Star Academic School, Natiapara Branch',     'স্টার একাডেমিক স্কুল, নাটিয়াপাড়া শাখা',    'Natiapara, Delduar, Tangail',     'নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল', 0, '2010-01-15'),
  (2, 'Star Academic School, Pakullah Bazar Branch','স্টার একাডেমিক স্কুল, পাকুল্লা বাজার শাখা', 'Pakullah Bazar, Delduar, Tangail','পাকুল্লা বাজার, দেলদুয়ার, টাঙ্গাইল', 0, '2014-03-10')
ON DUPLICATE KEY UPDATE
  name_en = VALUES(name_en), name_bn = VALUES(name_bn),
  address_en = VALUES(address_en), address_bn = VALUES(address_bn),
  is_proposed = VALUES(is_proposed), established_date = VALUES(established_date);

-- Insert Mirjapur branch
INSERT INTO Branches (id, name_en, name_bn, address_en, address_bn, is_proposed, established_date)
VALUES (3, 'Star Academic School, Mirjapur Branch', 'স্টার একাডেমিক স্কুল, মির্জাপুর শাখা', 'Mirjapur, Tangail', 'মির্জাপুর, টাঙ্গাইল', 0, '2020-06-01')
ON DUPLICATE KEY UPDATE
  name_en = VALUES(name_en), name_bn = VALUES(name_bn),
  address_en = VALUES(address_en), address_bn = VALUES(address_bn),
  is_proposed = VALUES(is_proposed), established_date = VALUES(established_date);

-- ── 3. ClassNames reference table ─────────────────────────────
CREATE TABLE IF NOT EXISTS ClassNames (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

INSERT IGNORE INTO ClassNames (name, sort_order) VALUES
  ('Play',     1), ('Nursery', 2), ('KG',      3),
  ('Class 1',  4), ('Class 2', 5), ('Class 3', 6),
  ('Class 4',  7), ('Class 5', 8), ('Class 6', 9),
  ('Class 7', 10), ('Class 8',11), ('Class 9',12),
  ('Class 10',13);

-- ── 4. Teachers ───────────────────────────────────────────────
-- Branch 1 — Natiapara (sections: A, B)
INSERT INTO Teachers (TeacherID, FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, branch_id) VALUES
  (1,  'Md. Kamal',   'Hossain',   'Mathematics',       '01711000001', 'kamal@star.edu',   '2010-01-15', 1),
  (2,  'Nasrin',      'Akter',     'Bangla',            '01711000002', 'nasrin@star.edu',  '2011-03-10', 1),
  (3,  'Jahangir',    'Alam',      'English',           '01711000003', 'jahangir@star.edu','2012-06-01', 1),
  (4,  'Rehena',      'Begum',     'Science',           '01711000004', 'rehena@star.edu',  '2013-08-20', 1),
  (5,  'Rafiqul',     'Islam',     'Social Studies',    '01711000005', 'rafiqul@star.edu', '2014-01-05', 1);

-- Branch 2 — Pakullah Bazar (sections: Morning, Day)
INSERT INTO Teachers (TeacherID, FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, branch_id) VALUES
  (6,  'Shahanara',   'Khanam',    'Mathematics',       '01722000001', 'shahanara@star.edu','2014-03-10', 2),
  (7,  'Belal',       'Uddin',     'Bangla',            '01722000002', 'belal@star.edu',   '2015-07-01', 2),
  (8,  'Farhana',     'Haque',     'English',           '01722000003', 'farhana@star.edu', '2016-02-14', 2),
  (9,  'Harun',       'Or Rashid', 'Science',           '01722000004', 'harun@star.edu',   '2017-04-01', 2),
  (10, 'Lutfun',      'Nahar',     'Religious Studies', '01722000005', 'lutfun@star.edu',  '2018-09-10', 2);

-- Branch 3 — Mirjapur (sections: Bangla, English)
INSERT INTO Teachers (TeacherID, FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, branch_id) VALUES
  (11, 'Anisur',      'Rahman',    'Mathematics',       '01733000001', 'anisur@star.edu',  '2020-06-01', 3),
  (12, 'Sumaiya',     'Islam',     'Bangla',            '01733000002', 'sumaiya@star.edu', '2020-06-01', 3),
  (13, 'Monirul',     'Haque',     'English',           '01733000003', 'monirul@star.edu', '2021-01-10', 3),
  (14, 'Tahmina',     'Begum',     'Science',           '01733000004', 'tahmina@star.edu', '2021-03-15', 3),
  (15, 'Jubair',      'Ahmed',     'Social Studies',    '01733000005', 'jubair@star.edu',  '2022-06-01', 3);

-- ── 5. Classes (same names, different sections per branch) ────
-- Branch 1 — sections: A, B
INSERT INTO Classes (ClassID, ClassName, Section, TeacherID, branch_id) VALUES
  (1,  'Class 6',  'A', 1,  1),
  (2,  'Class 6',  'B', 2,  1),
  (3,  'Class 7',  'A', 3,  1),
  (4,  'Class 7',  'B', 4,  1),
  (5,  'Class 8',  'A', 5,  1),
  (6,  'Class 9',  'A', 1,  1),
  (7,  'Class 10', 'A', 2,  1);

-- Branch 2 — sections: Morning, Day
INSERT INTO Classes (ClassID, ClassName, Section, TeacherID, branch_id) VALUES
  (8,  'Class 6',  'Morning', 6,  2),
  (9,  'Class 6',  'Day',     7,  2),
  (10, 'Class 7',  'Morning', 8,  2),
  (11, 'Class 8',  'Morning', 9,  2),
  (12, 'Class 9',  'Day',     10, 2),
  (13, 'Class 10', 'Morning', 6,  2);

-- Branch 3 — sections: Bangla, English
INSERT INTO Classes (ClassID, ClassName, Section, TeacherID, branch_id) VALUES
  (14, 'Class 6',  'Bangla',  11, 3),
  (15, 'Class 6',  'English', 12, 3),
  (16, 'Class 7',  'Bangla',  13, 3),
  (17, 'Class 8',  'English', 14, 3),
  (18, 'Class 9',  'Bangla',  15, 3),
  (19, 'Class 10', 'English', 11, 3);

-- ── 6. Students ───────────────────────────────────────────────
-- Branch 1 students (Class 6-A=1, Class 6-B=2, Class 7-A=3, Class 7-B=4, Class 8-A=5)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (1,  'Arif',     'Hossain',   '001', '2010-05-12', 'Male',   1,  '2022-01-10', 'Natiapara, Tangail',  '01811100001', 1),
  (2,  'Maliha',   'Rahman',    '002', '2010-08-22', 'Female', 1,  '2022-01-10', 'Natiapara, Tangail',  '01811100002', 1),
  (3,  'Rafi',     'Hasan',     '003', '2010-03-15', 'Male',   1,  '2022-01-10', 'Delduar, Tangail',    '01811100003', 1),
  (4,  'Farzana',  'Noor',      '001', '2010-11-01', 'Female', 2,  '2022-01-10', 'Natiapara, Tangail',  '01811100004', 1),
  (5,  'Tanvir',   'Ahmed',     '002', '2010-07-19', 'Male',   2,  '2022-01-10', 'Delduar, Tangail',    '01811100005', 1),
  (6,  'Sonia',    'Akter',     '001', '2009-04-25', 'Female', 3,  '2022-01-10', 'Natiapara, Tangail',  '01811100006', 1),
  (7,  'Rakib',    'Islam',     '002', '2009-12-10', 'Male',   3,  '2022-01-10', 'Tangail Sadar',       '01811100007', 1),
  (8,  'Rima',     'Khatun',    '001', '2009-06-30', 'Female', 4,  '2022-01-10', 'Natiapara, Tangail',  '01811100008', 1),
  (9,  'Sabbir',   'Rahman',    '001', '2008-02-18', 'Male',   5,  '2021-01-10', 'Delduar, Tangail',    '01811100009', 1),
  (10, 'Mitu',     'Begum',     '002', '2008-09-05', 'Female', 5,  '2021-01-10', 'Natiapara, Tangail',  '01811100010', 1);

-- Branch 2 students (Class 6-Morning=8, Class 6-Day=9, Class 7-Morning=10, Class 8-Morning=11)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (11, 'Nasir',    'Uddin',     '001', '2010-04-11', 'Male',   8,  '2022-01-15', 'Pakullah, Tangail',   '01822200001', 2),
  (12, 'Taslima',  'Khanam',    '002', '2010-09-27', 'Female', 8,  '2022-01-15', 'Pakullah, Tangail',   '01822200002', 2),
  (13, 'Mehedi',   'Hasan',     '001', '2010-01-14', 'Male',   9,  '2022-01-15', 'Delduar, Tangail',    '01822200003', 2),
  (14, 'Sharmin',  'Akter',     '002', '2010-06-08', 'Female', 9,  '2022-01-15', 'Pakullah, Tangail',   '01822200004', 2),
  (15, 'Imran',    'Hossain',   '001', '2009-03-22', 'Male',   10, '2022-01-15', 'Tangail Sadar',       '01822200005', 2),
  (16, 'Parveen',  'Sultana',   '002', '2009-11-16', 'Female', 10, '2022-01-15', 'Pakullah, Tangail',   '01822200006', 2),
  (17, 'Shakil',   'Ahmed',     '001', '2008-07-03', 'Male',   11, '2021-01-15', 'Delduar, Tangail',    '01822200007', 2),
  (18, 'Nusrat',   'Jahan',     '002', '2008-12-20', 'Female', 11, '2021-01-15', 'Pakullah, Tangail',   '01822200008', 2);

-- Branch 3 students (Class 6-Bangla=14, Class 6-English=15, Class 7-Bangla=16, Class 8-English=17)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (19, 'Raihan',   'Islam',     '001', '2010-02-28', 'Male',   14, '2022-06-01', 'Mirjapur, Tangail',   '01833300001', 3),
  (20, 'Sumaiya',  'Ahmed',     '002', '2010-07-13', 'Female', 14, '2022-06-01', 'Mirjapur, Tangail',   '01833300002', 3),
  (21, 'Farhan',   'Hossain',   '001', '2010-05-19', 'Male',   15, '2022-06-01', 'Tangail Sadar',       '01833300003', 3),
  (22, 'Nadia',    'Rahman',    '002', '2010-10-04', 'Female', 15, '2022-06-01', 'Mirjapur, Tangail',   '01833300004', 3),
  (23, 'Tahsin',   'Akter',     '001', '2009-08-17', 'Male',   16, '2022-06-01', 'Mirjapur, Tangail',   '01833300005', 3),
  (24, 'Anika',    'Begum',     '002', '2009-01-30', 'Female', 16, '2022-06-01', 'Tangail Sadar',       '01833300006', 3),
  (25, 'Rafsan',   'Chowdhury', '001', '2008-04-06', 'Male',   17, '2021-06-01', 'Mirjapur, Tangail',   '01833300007', 3),
  (26, 'Lamiya',   'Khatun',    '002', '2008-11-25', 'Female', 17, '2021-06-01', 'Mirjapur, Tangail',   '01833300008', 3);

-- ── 7. Branch admins ──────────────────────────────────────────
-- Password for all: "Admin@1234"
INSERT INTO Admin (Username, Email, Password, role, branch_id, Language) VALUES
  ('natiapara_admin',  'admin.natiapara@star.edu',  '$2a$10$JDjlMJFES.QAAtew7QBthu9HDuSvquCFO42JlbV/3mPV7QQMxrPyW', 'branch_admin', 1, 'bn'),
  ('pakullah_admin',   'admin.pakullah@star.edu',   '$2a$10$JDjlMJFES.QAAtew7QBthu9HDuSvquCFO42JlbV/3mPV7QQMxrPyW', 'branch_admin', 2, 'bn'),
  ('mirjapur_admin',   'admin.mirjapur@star.edu',   '$2a$10$JDjlMJFES.QAAtew7QBthu9HDuSvquCFO42JlbV/3mPV7QQMxrPyW', 'branch_admin', 3, 'bn');

SET FOREIGN_KEY_CHECKS = 1;
