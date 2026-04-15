-- ============================================================
-- Full Seed: School_Management database
-- Clears all operational data and re-inserts clean branch-wise
-- test data for 3 branches.
-- Run: mysql -u root -padmin1234 School_Management < full_seed.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. Truncate operational tables ───────────────────────────
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

-- Keep super_admin rows (AdminID 1 and 19); delete non-super_admin except AdminIDs 20,21,22
DELETE FROM Admin WHERE role != 'super_admin' AND AdminID NOT IN (20, 21, 22);

-- ── 2. Branches ───────────────────────────────────────────────
INSERT INTO Branches (id, name_en, name_bn, address_en, address_bn, is_proposed, established_date)
VALUES
  (1, 'Star Academic School, Natiapara Branch',      'স্টার একাডেমিক স্কুল, নাটিয়াপাড়া শাখা',     'Natiapara, Delduar, Tangail',      'নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল',      0, '2010-01-15'),
  (2, 'Star Academic School, Pakullah Bazar Branch', 'স্টার একাডেমিক স্কুল, পাকুল্লা বাজার শাখা',  'Pakullah Bazar, Delduar, Tangail', 'পাকুল্লা বাজার, দেলদুয়ার, টাঙ্গাইল',  0, '2014-03-10'),
  (3, 'Star Academic School, Mirjapur Branch',       'স্টার একাডেমিক স্কুল, মির্জাপুর শাখা',        'Mirjapur, Tangail',                'মির্জাপুর, টাঙ্গাইল',                   0, '2020-06-01')
ON DUPLICATE KEY UPDATE
  name_en = VALUES(name_en), name_bn = VALUES(name_bn),
  address_en = VALUES(address_en), address_bn = VALUES(address_bn),
  is_proposed = VALUES(is_proposed), established_date = VALUES(established_date);

-- ── 3. ClassNames reference table ────────────────────────────
CREATE TABLE IF NOT EXISTS ClassNames (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);
TRUNCATE TABLE ClassNames;
INSERT INTO ClassNames (id, name, sort_order) VALUES
  (1,  'Play',     1),
  (2,  'Nursery',  2),
  (3,  'KG',       3),
  (4,  'Class 1',  4),
  (5,  'Class 2',  5),
  (6,  'Class 3',  6),
  (7,  'Class 4',  7),
  (8,  'Class 5',  8),
  (9,  'Class 6',  9),
  (10, 'Class 7',  10),
  (11, 'Class 8',  11),
  (12, 'Class 9',  12),
  (13, 'Class 10', 13);

-- ── 4. Teachers ───────────────────────────────────────────────
-- Branch 1 — Natiapara
INSERT INTO Teachers (TeacherID, FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, branch_id) VALUES
  (1,  'Md. Kamal',  'Hossain',   'Mathematics',       '01711000001', 'kamal@star.edu',    '2010-01-15', 1),
  (2,  'Nasrin',     'Akter',     'Bangla',            '01711000002', 'nasrin@star.edu',   '2011-03-10', 1),
  (3,  'Jahangir',   'Alam',      'English',           '01711000003', 'jahangir@star.edu', '2012-06-01', 1),
  (4,  'Rehena',     'Begum',     'Science',           '01711000004', 'rehena@star.edu',   '2013-08-20', 1),
  (5,  'Rafiqul',    'Islam',     'Social Studies',    '01711000005', 'rafiqul@star.edu',  '2014-01-05', 1);

-- Branch 2 — Pakullah Bazar
INSERT INTO Teachers (TeacherID, FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, branch_id) VALUES
  (6,  'Shahanara',  'Khanam',    'Mathematics',       '01722000001', 'shahanara@star.edu','2014-03-10', 2),
  (7,  'Belal',      'Uddin',     'Bangla',            '01722000002', 'belal@star.edu',    '2015-07-01', 2),
  (8,  'Farhana',    'Haque',     'English',           '01722000003', 'farhana@star.edu',  '2016-02-14', 2),
  (9,  'Harun',      'Or Rashid', 'Science',           '01722000004', 'harun@star.edu',    '2017-04-01', 2),
  (10, 'Lutfun',     'Nahar',     'Religious Studies', '01722000005', 'lutfun@star.edu',   '2018-09-10', 2);

-- Branch 3 — Mirjapur
INSERT INTO Teachers (TeacherID, FirstName, LastName, Subject, ContactNumber, Email, JoiningDate, branch_id) VALUES
  (11, 'Anisur',     'Rahman',    'Mathematics',       '01733000001', 'anisur@star.edu',   '2020-06-01', 3),
  (12, 'Sumaiya',    'Islam',     'Bangla',            '01733000002', 'sumaiya@star.edu',  '2020-06-01', 3),
  (13, 'Monirul',    'Haque',     'English',           '01733000003', 'monirul@star.edu',  '2021-01-10', 3),
  (14, 'Tahmina',    'Begum',     'Science',           '01733000004', 'tahmina@star.edu',  '2021-03-15', 3),
  (15, 'Jubair',     'Ahmed',     'Social Studies',    '01733000005', 'jubair@star.edu',   '2022-06-01', 3);

-- ── 5. Classes ────────────────────────────────────────────────
-- Branch 1 — sections A, B
INSERT INTO Classes (ClassID, ClassName, Section, TeacherID, branch_id) VALUES
  (1,  'Class 6',  'A', 1, 1),
  (2,  'Class 6',  'B', 2, 1),
  (3,  'Class 7',  'A', 3, 1),
  (4,  'Class 8',  'A', 4, 1),
  (5,  'Class 9',  'A', 5, 1),
  (6,  'Class 10', 'A', 1, 1);

-- Branch 2 — sections Morning, Day
INSERT INTO Classes (ClassID, ClassName, Section, TeacherID, branch_id) VALUES
  (7,  'Class 6',  'Morning', 6,  2),
  (8,  'Class 6',  'Day',     7,  2),
  (9,  'Class 7',  'Morning', 8,  2),
  (10, 'Class 8',  'Morning', 9,  2),
  (11, 'Class 9',  'Day',     10, 2),
  (12, 'Class 10', 'Morning', 6,  2);

-- Branch 3 — sections Bangla, English
INSERT INTO Classes (ClassID, ClassName, Section, TeacherID, branch_id) VALUES
  (13, 'Class 6',  'Bangla',  11, 3),
  (14, 'Class 6',  'English', 12, 3),
  (15, 'Class 7',  'Bangla',  13, 3),
  (16, 'Class 8',  'English', 14, 3),
  (17, 'Class 9',  'Bangla',  15, 3),
  (18, 'Class 10', 'English', 11, 3);

-- ── 6. Students (54 total, 3 per class, 18 per branch) ───────
-- Branch 1, Class 6/A (ClassID=1)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (1,  'Arif',      'Hossain',    '001', '2012-05-12', 'Male',   1, '2022-01-10', 'Natiapara, Delduar, Tangail',  '01811100001', 1),
  (2,  'Maliha',    'Rahman',     '002', '2012-08-22', 'Female', 1, '2022-01-10', 'Natiapara, Delduar, Tangail',  '01811100002', 1),
  (3,  'Rafi',      'Hasan',      '003', '2012-03-15', 'Male',   1, '2022-01-10', 'Delduar, Tangail',             '01811100003', 1);

-- Branch 1, Class 6/B (ClassID=2)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (4,  'Farzana',   'Noor',       '001', '2012-11-01', 'Female', 2, '2022-01-10', 'Natiapara, Delduar, Tangail',  '01811100004', 1),
  (5,  'Tanvir',    'Ahmed',      '002', '2012-07-19', 'Male',   2, '2022-01-10', 'Delduar, Tangail',             '01811100005', 1),
  (6,  'Shirin',    'Begum',      '003', '2012-04-08', 'Female', 2, '2022-01-10', 'Natiapara, Delduar, Tangail',  '01811100006', 1);

-- Branch 1, Class 7/A (ClassID=3)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (7,  'Rakib',     'Islam',      '001', '2011-04-25', 'Male',   3, '2022-01-10', 'Natiapara, Delduar, Tangail',  '01811100007', 1),
  (8,  'Sonia',     'Akter',      '002', '2011-12-10', 'Female', 3, '2022-01-10', 'Tangail Sadar, Tangail',       '01811100008', 1),
  (9,  'Mehrab',    'Hossain',    '003', '2011-09-03', 'Male',   3, '2022-01-10', 'Delduar, Tangail',             '01811100009', 1);

-- Branch 1, Class 8/A (ClassID=4)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (10, 'Rima',      'Khatun',     '001', '2010-06-30', 'Female', 4, '2021-01-10', 'Natiapara, Delduar, Tangail',  '01811100010', 1),
  (11, 'Sabbir',    'Rahman',     '002', '2010-02-18', 'Male',   4, '2021-01-10', 'Delduar, Tangail',             '01811100011', 1),
  (12, 'Mitu',      'Begum',      '003', '2010-09-05', 'Female', 4, '2021-01-10', 'Natiapara, Delduar, Tangail',  '01811100012', 1);

-- Branch 1, Class 9/A (ClassID=5)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (13, 'Rasel',     'Mia',        '001', '2009-01-14', 'Male',   5, '2020-01-10', 'Natiapara, Delduar, Tangail',  '01811100013', 1),
  (14, 'Tania',     'Sultana',    '002', '2009-07-22', 'Female', 5, '2020-01-10', 'Delduar, Tangail',             '01811100014', 1),
  (15, 'Karim',     'Uddin',      '003', '2009-11-30', 'Male',   5, '2020-01-10', 'Tangail Sadar, Tangail',       '01811100015', 1);

-- Branch 1, Class 10/A (ClassID=6)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (16, 'Nasima',    'Akter',      '001', '2008-03-17', 'Female', 6, '2019-01-10', 'Natiapara, Delduar, Tangail',  '01811100016', 1),
  (17, 'Sohel',     'Rana',       '002', '2008-08-04', 'Male',   6, '2019-01-10', 'Delduar, Tangail',             '01811100017', 1),
  (18, 'Priya',     'Das',        '003', '2008-12-21', 'Female', 6, '2019-01-10', 'Natiapara, Delduar, Tangail',  '01811100018', 1);

-- Branch 2, Class 6/Morning (ClassID=7)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (19, 'Nasir',     'Uddin',      '001', '2012-04-11', 'Male',   7, '2022-01-15', 'Pakullah, Delduar, Tangail',   '01822200001', 2),
  (20, 'Taslima',   'Khanam',     '002', '2012-09-27', 'Female', 7, '2022-01-15', 'Pakullah, Delduar, Tangail',   '01822200002', 2),
  (21, 'Imtiaz',    'Hossain',    '003', '2012-06-15', 'Male',   7, '2022-01-15', 'Delduar, Tangail',             '01822200003', 2);

-- Branch 2, Class 6/Day (ClassID=8)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (22, 'Mehedi',    'Hasan',      '001', '2012-01-14', 'Male',   8, '2022-01-15', 'Delduar, Tangail',             '01822200004', 2),
  (23, 'Sharmin',   'Akter',      '002', '2012-06-08', 'Female', 8, '2022-01-15', 'Pakullah, Delduar, Tangail',   '01822200005', 2),
  (24, 'Kabir',     'Hossain',    '003', '2012-10-20', 'Male',   8, '2022-01-15', 'Pakullah, Delduar, Tangail',   '01822200006', 2);

-- Branch 2, Class 7/Morning (ClassID=9)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (25, 'Imran',     'Hossain',    '001', '2011-03-22', 'Male',   9, '2022-01-15', 'Tangail Sadar, Tangail',       '01822200007', 2),
  (26, 'Parveen',   'Sultana',    '002', '2011-11-16', 'Female', 9, '2022-01-15', 'Pakullah, Delduar, Tangail',   '01822200008', 2),
  (27, 'Shakil',    'Ahmed',      '003', '2011-07-03', 'Male',   9, '2022-01-15', 'Delduar, Tangail',             '01822200009', 2);

-- Branch 2, Class 8/Morning (ClassID=10)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (28, 'Nusrat',    'Jahan',      '001', '2010-12-20', 'Female', 10, '2021-01-15', 'Pakullah, Delduar, Tangail',  '01822200010', 2),
  (29, 'Sumon',     'Biswas',     '002', '2010-05-07', 'Male',   10, '2021-01-15', 'Delduar, Tangail',            '01822200011', 2),
  (30, 'Laboni',    'Khatun',     '003', '2010-08-14', 'Female', 10, '2021-01-15', 'Pakullah, Delduar, Tangail',  '01822200012', 2);

-- Branch 2, Class 9/Day (ClassID=11)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (31, 'Rubel',     'Hossain',    '001', '2009-02-09', 'Male',   11, '2020-01-15', 'Pakullah, Delduar, Tangail',  '01822200013', 2),
  (32, 'Moni',      'Akter',      '002', '2009-08-18', 'Female', 11, '2020-01-15', 'Delduar, Tangail',            '01822200014', 2),
  (33, 'Jahed',     'Islam',      '003', '2009-04-26', 'Male',   11, '2020-01-15', 'Tangail Sadar, Tangail',      '01822200015', 2);

-- Branch 2, Class 10/Morning (ClassID=12)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (34, 'Roksana',   'Begum',      '001', '2008-01-31', 'Female', 12, '2019-01-15', 'Pakullah, Delduar, Tangail',  '01822200016', 2),
  (35, 'Limon',     'Hossain',    '002', '2008-06-12', 'Male',   12, '2019-01-15', 'Delduar, Tangail',            '01822200017', 2),
  (36, 'Shanta',    'Rani',       '003', '2008-10-05', 'Female', 12, '2019-01-15', 'Pakullah, Delduar, Tangail',  '01822200018', 2);

-- Branch 3, Class 6/Bangla (ClassID=13)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (37, 'Raihan',    'Islam',      '001', '2012-02-28', 'Male',   13, '2022-06-01', 'Mirjapur, Tangail',           '01833300001', 3),
  (38, 'Sumaiya',   'Ahmed',      '002', '2012-07-13', 'Female', 13, '2022-06-01', 'Mirjapur, Tangail',           '01833300002', 3),
  (39, 'Fahim',     'Chowdhury',  '003', '2012-04-22', 'Male',   13, '2022-06-01', 'Tangail Sadar, Tangail',      '01833300003', 3);

-- Branch 3, Class 6/English (ClassID=14)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (40, 'Farhan',    'Hossain',    '001', '2012-05-19', 'Male',   14, '2022-06-01', 'Tangail Sadar, Tangail',      '01833300004', 3),
  (41, 'Nadia',     'Rahman',     '002', '2012-10-04', 'Female', 14, '2022-06-01', 'Mirjapur, Tangail',           '01833300005', 3),
  (42, 'Abrar',     'Hossain',    '003', '2012-01-16', 'Male',   14, '2022-06-01', 'Mirjapur, Tangail',           '01833300006', 3);

-- Branch 3, Class 7/Bangla (ClassID=15)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (43, 'Tahsin',    'Akter',      '001', '2011-08-17', 'Male',   15, '2022-06-01', 'Mirjapur, Tangail',           '01833300007', 3),
  (44, 'Anika',     'Begum',      '002', '2011-01-30', 'Female', 15, '2022-06-01', 'Tangail Sadar, Tangail',      '01833300008', 3),
  (45, 'Sifat',     'Islam',      '003', '2011-05-11', 'Male',   15, '2022-06-01', 'Mirjapur, Tangail',           '01833300009', 3);

-- Branch 3, Class 8/English (ClassID=16)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (46, 'Rafsan',    'Chowdhury',  '001', '2010-04-06', 'Male',   16, '2021-06-01', 'Mirjapur, Tangail',           '01833300010', 3),
  (47, 'Lamiya',    'Khatun',     '002', '2010-11-25', 'Female', 16, '2021-06-01', 'Mirjapur, Tangail',           '01833300011', 3),
  (48, 'Touhid',    'Hasan',      '003', '2010-07-08', 'Male',   16, '2021-06-01', 'Tangail Sadar, Tangail',      '01833300012', 3);

-- Branch 3, Class 9/Bangla (ClassID=17)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (49, 'Morsheda',  'Begum',      '001', '2009-03-14', 'Female', 17, '2020-06-01', 'Mirjapur, Tangail',           '01833300013', 3),
  (50, 'Shakib',    'Al Hasan',   '002', '2009-09-28', 'Male',   17, '2020-06-01', 'Tangail Sadar, Tangail',      '01833300014', 3),
  (51, 'Nusrat',    'Fatema',     '003', '2009-06-03', 'Female', 17, '2020-06-01', 'Mirjapur, Tangail',           '01833300015', 3);

-- Branch 3, Class 10/English (ClassID=18)
INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, Address, ParentContact, branch_id) VALUES
  (52, 'Asif',      'Iqbal',      '001', '2008-02-19', 'Male',   18, '2019-06-01', 'Mirjapur, Tangail',           '01833300016', 3),
  (53, 'Sabrina',   'Islam',      '002', '2008-07-31', 'Female', 18, '2019-06-01', 'Tangail Sadar, Tangail',      '01833300017', 3),
  (54, 'Mahfuz',    'Rahman',     '003', '2008-11-13', 'Male',   18, '2019-06-01', 'Mirjapur, Tangail',           '01833300018', 3);

-- ── 7. Subjects (90 total, 5 per class) ──────────────────────
-- SubjectID = (ClassID-1)*5 + offset
-- ClassID 1 → SubjectIDs 1-5
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (1,  'Bangla',       1, 1), (2,  'English',      1, 1), (3,  'Mathematics',  1, 1), (4,  'Science',       1, 1), (5,  'Social Studies', 1, 1);
-- ClassID 2 → SubjectIDs 6-10
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (6,  'Bangla',       2, 1), (7,  'English',      2, 1), (8,  'Mathematics',  2, 1), (9,  'Science',       2, 1), (10, 'Social Studies', 2, 1);
-- ClassID 3 → SubjectIDs 11-15
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (11, 'Bangla',       3, 1), (12, 'English',      3, 1), (13, 'Mathematics',  3, 1), (14, 'Science',       3, 1), (15, 'Social Studies', 3, 1);
-- ClassID 4 → SubjectIDs 16-20
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (16, 'Bangla',       4, 1), (17, 'English',      4, 1), (18, 'Mathematics',  4, 1), (19, 'Science',       4, 1), (20, 'Social Studies', 4, 1);
-- ClassID 5 → SubjectIDs 21-25
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (21, 'Bangla',       5, 1), (22, 'English',      5, 1), (23, 'Mathematics',  5, 1), (24, 'Science',       5, 1), (25, 'Social Studies', 5, 1);
-- ClassID 6 → SubjectIDs 26-30
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (26, 'Bangla',       6, 1), (27, 'English',      6, 1), (28, 'Mathematics',  6, 1), (29, 'Science',       6, 1), (30, 'Social Studies', 6, 1);
-- ClassID 7 → SubjectIDs 31-35
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (31, 'Bangla',       7, 2), (32, 'English',      7, 2), (33, 'Mathematics',  7, 2), (34, 'Science',       7, 2), (35, 'Social Studies', 7, 2);
-- ClassID 8 → SubjectIDs 36-40
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (36, 'Bangla',       8, 2), (37, 'English',      8, 2), (38, 'Mathematics',  8, 2), (39, 'Science',       8, 2), (40, 'Social Studies', 8, 2);
-- ClassID 9 → SubjectIDs 41-45
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (41, 'Bangla',       9, 2), (42, 'English',      9, 2), (43, 'Mathematics',  9, 2), (44, 'Science',       9, 2), (45, 'Social Studies', 9, 2);
-- ClassID 10 → SubjectIDs 46-50
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (46, 'Bangla',      10, 2), (47, 'English',     10, 2), (48, 'Mathematics', 10, 2), (49, 'Science',      10, 2), (50, 'Social Studies',10, 2);
-- ClassID 11 → SubjectIDs 51-55
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (51, 'Bangla',      11, 2), (52, 'English',     11, 2), (53, 'Mathematics', 11, 2), (54, 'Science',      11, 2), (55, 'Social Studies',11, 2);
-- ClassID 12 → SubjectIDs 56-60
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (56, 'Bangla',      12, 2), (57, 'English',     12, 2), (58, 'Mathematics', 12, 2), (59, 'Science',      12, 2), (60, 'Social Studies',12, 2);
-- ClassID 13 → SubjectIDs 61-65
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (61, 'Bangla',      13, 3), (62, 'English',     13, 3), (63, 'Mathematics', 13, 3), (64, 'Science',      13, 3), (65, 'Social Studies',13, 3);
-- ClassID 14 → SubjectIDs 66-70
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (66, 'Bangla',      14, 3), (67, 'English',     14, 3), (68, 'Mathematics', 14, 3), (69, 'Science',      14, 3), (70, 'Social Studies',14, 3);
-- ClassID 15 → SubjectIDs 71-75
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (71, 'Bangla',      15, 3), (72, 'English',     15, 3), (73, 'Mathematics', 15, 3), (74, 'Science',      15, 3), (75, 'Social Studies',15, 3);
-- ClassID 16 → SubjectIDs 76-80
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (76, 'Bangla',      16, 3), (77, 'English',     16, 3), (78, 'Mathematics', 16, 3), (79, 'Science',      16, 3), (80, 'Social Studies',16, 3);
-- ClassID 17 → SubjectIDs 81-85
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (81, 'Bangla',      17, 3), (82, 'English',     17, 3), (83, 'Mathematics', 17, 3), (84, 'Science',      17, 3), (85, 'Social Studies',17, 3);
-- ClassID 18 → SubjectIDs 86-90
INSERT INTO Subjects (SubjectID, SubjectName, ClassID, branch_id) VALUES
  (86, 'Bangla',      18, 3), (87, 'English',     18, 3), (88, 'Mathematics', 18, 3), (89, 'Science',      18, 3), (90, 'Social Studies',18, 3);

-- ── 8. Exams (36 total, 2 per class) ─────────────────────────
-- ExamID = (ClassID-1)*2 + 1 for Half-Yearly, +2 for Annual
-- Branch 1
INSERT INTO Exams (ExamID, ExamType, ExamName, ClassID, ExamDate, branch_id) VALUES
  (1,  'Half-Yearly', 'Half Yearly Exam 2025', 1,  '2025-06-15', 1),
  (2,  'Annual',      'Annual Exam 2025',       1,  '2025-12-10', 1),
  (3,  'Half-Yearly', 'Half Yearly Exam 2025', 2,  '2025-06-15', 1),
  (4,  'Annual',      'Annual Exam 2025',       2,  '2025-12-10', 1),
  (5,  'Half-Yearly', 'Half Yearly Exam 2025', 3,  '2025-06-15', 1),
  (6,  'Annual',      'Annual Exam 2025',       3,  '2025-12-10', 1),
  (7,  'Half-Yearly', 'Half Yearly Exam 2025', 4,  '2025-06-15', 1),
  (8,  'Annual',      'Annual Exam 2025',       4,  '2025-12-10', 1),
  (9,  'Half-Yearly', 'Half Yearly Exam 2025', 5,  '2025-06-15', 1),
  (10, 'Annual',      'Annual Exam 2025',       5,  '2025-12-10', 1),
  (11, 'Half-Yearly', 'Half Yearly Exam 2025', 6,  '2025-06-15', 1),
  (12, 'Annual',      'Annual Exam 2025',       6,  '2025-12-10', 1);
-- Branch 2
INSERT INTO Exams (ExamID, ExamType, ExamName, ClassID, ExamDate, branch_id) VALUES
  (13, 'Half-Yearly', 'Half Yearly Exam 2025', 7,  '2025-06-15', 2),
  (14, 'Annual',      'Annual Exam 2025',       7,  '2025-12-10', 2),
  (15, 'Half-Yearly', 'Half Yearly Exam 2025', 8,  '2025-06-15', 2),
  (16, 'Annual',      'Annual Exam 2025',       8,  '2025-12-10', 2),
  (17, 'Half-Yearly', 'Half Yearly Exam 2025', 9,  '2025-06-15', 2),
  (18, 'Annual',      'Annual Exam 2025',       9,  '2025-12-10', 2),
  (19, 'Half-Yearly', 'Half Yearly Exam 2025', 10, '2025-06-15', 2),
  (20, 'Annual',      'Annual Exam 2025',       10, '2025-12-10', 2),
  (21, 'Half-Yearly', 'Half Yearly Exam 2025', 11, '2025-06-15', 2),
  (22, 'Annual',      'Annual Exam 2025',       11, '2025-12-10', 2),
  (23, 'Half-Yearly', 'Half Yearly Exam 2025', 12, '2025-06-15', 2),
  (24, 'Annual',      'Annual Exam 2025',       12, '2025-12-10', 2);
-- Branch 3
INSERT INTO Exams (ExamID, ExamType, ExamName, ClassID, ExamDate, branch_id) VALUES
  (25, 'Half-Yearly', 'Half Yearly Exam 2025', 13, '2025-06-15', 3),
  (26, 'Annual',      'Annual Exam 2025',       13, '2025-12-10', 3),
  (27, 'Half-Yearly', 'Half Yearly Exam 2025', 14, '2025-06-15', 3),
  (28, 'Annual',      'Annual Exam 2025',       14, '2025-12-10', 3),
  (29, 'Half-Yearly', 'Half Yearly Exam 2025', 15, '2025-06-15', 3),
  (30, 'Annual',      'Annual Exam 2025',       15, '2025-12-10', 3),
  (31, 'Half-Yearly', 'Half Yearly Exam 2025', 16, '2025-06-15', 3),
  (32, 'Annual',      'Annual Exam 2025',       16, '2025-12-10', 3),
  (33, 'Half-Yearly', 'Half Yearly Exam 2025', 17, '2025-06-15', 3),
  (34, 'Annual',      'Annual Exam 2025',       17, '2025-12-10', 3),
  (35, 'Half-Yearly', 'Half Yearly Exam 2025', 18, '2025-06-15', 3),
  (36, 'Annual',      'Annual Exam 2025',       18, '2025-12-10', 3);

-- ── 9. Results (540 total) ────────────────────────────────────
-- Pattern per class: 3 students × 2 exams × 5 subjects = 30 rows
-- Marks pattern (deterministic, varies by student/subject/exam):
--   Student 1 (good): Bangla=78,82 English=72,76 Math=85,88 Science=80,84 Social=75,79
--   Student 2 (avg):  Bangla=65,70 English=60,65 Math=55,62 Science=68,72 Social=63,67
--   Student 3 (mix):  Bangla=88,92 English=82,86 Math=45,50 Science=76,80 Social=70,74
-- Half-Yearly = ExamID (ClassID-1)*2+1, Annual = ExamID (ClassID-1)*2+2
-- SubjectID base = (ClassID-1)*5 + 1..5

-- ===== ClassID=1, Students 1-3, ExamIDs 1-2, SubjectIDs 1-5 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
-- Student 1, Half-Yearly (ExamID=1)
  (1,1,1,1,78,1),(1,1,2,1,72,1),(1,1,3,1,85,1),(1,1,4,1,80,1),(1,1,5,1,75,1),
-- Student 1, Annual (ExamID=2)
  (1,2,1,1,82,1),(1,2,2,1,76,1),(1,2,3,1,88,1),(1,2,4,1,84,1),(1,2,5,1,79,1),
-- Student 2, Half-Yearly
  (2,1,1,1,65,1),(2,1,2,1,60,1),(2,1,3,1,55,1),(2,1,4,1,68,1),(2,1,5,1,63,1),
-- Student 2, Annual
  (2,2,1,1,70,1),(2,2,2,1,65,1),(2,2,3,1,62,1),(2,2,4,1,72,1),(2,2,5,1,67,1),
-- Student 3, Half-Yearly
  (3,1,1,1,88,1),(3,1,2,1,82,1),(3,1,3,1,45,1),(3,1,4,1,76,1),(3,1,5,1,70,1),
-- Student 3, Annual
  (3,2,1,1,92,1),(3,2,2,1,86,1),(3,2,3,1,50,1),(3,2,4,1,80,1),(3,2,5,1,74,1);

-- ===== ClassID=2, Students 4-6, ExamIDs 3-4, SubjectIDs 6-10 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (4,3,6,2,80,1),(4,3,7,2,74,1),(4,3,8,2,87,1),(4,3,9,2,82,1),(4,3,10,2,77,1),
  (4,4,6,2,84,1),(4,4,7,2,78,1),(4,4,8,2,90,1),(4,4,9,2,86,1),(4,4,10,2,81,1),
  (5,3,6,2,67,1),(5,3,7,2,62,1),(5,3,8,2,57,1),(5,3,9,2,70,1),(5,3,10,2,65,1),
  (5,4,6,2,72,1),(5,4,7,2,67,1),(5,4,8,2,64,1),(5,4,9,2,74,1),(5,4,10,2,69,1),
  (6,3,6,2,90,1),(6,3,7,2,84,1),(6,3,8,2,47,1),(6,3,9,2,78,1),(6,3,10,2,72,1),
  (6,4,6,2,94,1),(6,4,7,2,88,1),(6,4,8,2,52,1),(6,4,9,2,82,1),(6,4,10,2,76,1);

-- ===== ClassID=3, Students 7-9, ExamIDs 5-6, SubjectIDs 11-15 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (7,5,11,3,76,1),(7,5,12,3,70,1),(7,5,13,3,83,1),(7,5,14,3,78,1),(7,5,15,3,73,1),
  (7,6,11,3,80,1),(7,6,12,3,74,1),(7,6,13,3,86,1),(7,6,14,3,82,1),(7,6,15,3,77,1),
  (8,5,11,3,63,1),(8,5,12,3,58,1),(8,5,13,3,53,1),(8,5,14,3,66,1),(8,5,15,3,61,1),
  (8,6,11,3,68,1),(8,6,12,3,63,1),(8,6,13,3,60,1),(8,6,14,3,70,1),(8,6,15,3,65,1),
  (9,5,11,3,86,1),(9,5,12,3,80,1),(9,5,13,3,48,1),(9,5,14,3,74,1),(9,5,15,3,68,1),
  (9,6,11,3,90,1),(9,6,12,3,84,1),(9,6,13,3,53,1),(9,6,14,3,78,1),(9,6,15,3,72,1);

-- ===== ClassID=4, Students 10-12, ExamIDs 7-8, SubjectIDs 16-20 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (10,7,16,4,79,1),(10,7,17,4,73,1),(10,7,18,4,86,1),(10,7,19,4,81,1),(10,7,20,4,76,1),
  (10,8,16,4,83,1),(10,8,17,4,77,1),(10,8,18,4,89,1),(10,8,19,4,85,1),(10,8,20,4,80,1),
  (11,7,16,4,66,1),(11,7,17,4,61,1),(11,7,18,4,56,1),(11,7,19,4,69,1),(11,7,20,4,64,1),
  (11,8,16,4,71,1),(11,8,17,4,66,1),(11,8,18,4,63,1),(11,8,19,4,73,1),(11,8,20,4,68,1),
  (12,7,16,4,89,1),(12,7,17,4,83,1),(12,7,18,4,46,1),(12,7,19,4,77,1),(12,7,20,4,71,1),
  (12,8,16,4,93,1),(12,8,17,4,87,1),(12,8,18,4,51,1),(12,8,19,4,81,1),(12,8,20,4,75,1);

-- ===== ClassID=5, Students 13-15, ExamIDs 9-10, SubjectIDs 21-25 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (13,9,21,5,77,1),(13,9,22,5,71,1),(13,9,23,5,84,1),(13,9,24,5,79,1),(13,9,25,5,74,1),
  (13,10,21,5,81,1),(13,10,22,5,75,1),(13,10,23,5,87,1),(13,10,24,5,83,1),(13,10,25,5,78,1),
  (14,9,21,5,64,1),(14,9,22,5,59,1),(14,9,23,5,54,1),(14,9,24,5,67,1),(14,9,25,5,62,1),
  (14,10,21,5,69,1),(14,10,22,5,64,1),(14,10,23,5,61,1),(14,10,24,5,71,1),(14,10,25,5,66,1),
  (15,9,21,5,87,1),(15,9,22,5,81,1),(15,9,23,5,49,1),(15,9,24,5,75,1),(15,9,25,5,69,1),
  (15,10,21,5,91,1),(15,10,22,5,85,1),(15,10,23,5,54,1),(15,10,24,5,79,1),(15,10,25,5,73,1);

-- ===== ClassID=6, Students 16-18, ExamIDs 11-12, SubjectIDs 26-30 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (16,11,26,6,81,1),(16,11,27,6,75,1),(16,11,28,6,88,1),(16,11,29,6,83,1),(16,11,30,6,78,1),
  (16,12,26,6,85,1),(16,12,27,6,79,1),(16,12,28,6,91,1),(16,12,29,6,87,1),(16,12,30,6,82,1),
  (17,11,26,6,68,1),(17,11,27,6,63,1),(17,11,28,6,58,1),(17,11,29,6,71,1),(17,11,30,6,66,1),
  (17,12,26,6,73,1),(17,12,27,6,68,1),(17,12,28,6,65,1),(17,12,29,6,75,1),(17,12,30,6,70,1),
  (18,11,26,6,91,1),(18,11,27,6,85,1),(18,11,28,6,48,1),(18,11,29,6,79,1),(18,11,30,6,73,1),
  (18,12,26,6,95,1),(18,12,27,6,89,1),(18,12,28,6,53,1),(18,12,29,6,83,1),(18,12,30,6,77,1);

-- ===== ClassID=7, Students 19-21, ExamIDs 13-14, SubjectIDs 31-35 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (19,13,31,7,75,2),(19,13,32,7,69,2),(19,13,33,7,82,2),(19,13,34,7,77,2),(19,13,35,7,72,2),
  (19,14,31,7,79,2),(19,14,32,7,73,2),(19,14,33,7,85,2),(19,14,34,7,81,2),(19,14,35,7,76,2),
  (20,13,31,7,62,2),(20,13,32,7,57,2),(20,13,33,7,52,2),(20,13,34,7,65,2),(20,13,35,7,60,2),
  (20,14,31,7,67,2),(20,14,32,7,62,2),(20,14,33,7,59,2),(20,14,34,7,69,2),(20,14,35,7,64,2),
  (21,13,31,7,85,2),(21,13,32,7,79,2),(21,13,33,7,46,2),(21,13,34,7,73,2),(21,13,35,7,67,2),
  (21,14,31,7,89,2),(21,14,32,7,83,2),(21,14,33,7,51,2),(21,14,34,7,77,2),(21,14,35,7,71,2);

-- ===== ClassID=8, Students 22-24, ExamIDs 15-16, SubjectIDs 36-40 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (22,15,36,8,77,2),(22,15,37,8,71,2),(22,15,38,8,84,2),(22,15,39,8,79,2),(22,15,40,8,74,2),
  (22,16,36,8,81,2),(22,16,37,8,75,2),(22,16,38,8,87,2),(22,16,39,8,83,2),(22,16,40,8,78,2),
  (23,15,36,8,64,2),(23,15,37,8,59,2),(23,15,38,8,54,2),(23,15,39,8,67,2),(23,15,40,8,62,2),
  (23,16,36,8,69,2),(23,16,37,8,64,2),(23,16,38,8,61,2),(23,16,39,8,71,2),(23,16,40,8,66,2),
  (24,15,36,8,87,2),(24,15,37,8,81,2),(24,15,38,8,48,2),(24,15,39,8,75,2),(24,15,40,8,69,2),
  (24,16,36,8,91,2),(24,16,37,8,85,2),(24,16,38,8,53,2),(24,16,39,8,79,2),(24,16,40,8,73,2);

-- ===== ClassID=9, Students 25-27, ExamIDs 17-18, SubjectIDs 41-45 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (25,17,41,9,79,2),(25,17,42,9,73,2),(25,17,43,9,86,2),(25,17,44,9,81,2),(25,17,45,9,76,2),
  (25,18,41,9,83,2),(25,18,42,9,77,2),(25,18,43,9,89,2),(25,18,44,9,85,2),(25,18,45,9,80,2),
  (26,17,41,9,66,2),(26,17,42,9,61,2),(26,17,43,9,56,2),(26,17,44,9,69,2),(26,17,45,9,64,2),
  (26,18,41,9,71,2),(26,18,42,9,66,2),(26,18,43,9,63,2),(26,18,44,9,73,2),(26,18,45,9,68,2),
  (27,17,41,9,89,2),(27,17,42,9,83,2),(27,17,43,9,50,2),(27,17,44,9,77,2),(27,17,45,9,71,2),
  (27,18,41,9,93,2),(27,18,42,9,87,2),(27,18,43,9,55,2),(27,18,44,9,81,2),(27,18,45,9,75,2);

-- ===== ClassID=10, Students 28-30, ExamIDs 19-20, SubjectIDs 46-50 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (28,19,46,10,80,2),(28,19,47,10,74,2),(28,19,48,10,87,2),(28,19,49,10,82,2),(28,19,50,10,77,2),
  (28,20,46,10,84,2),(28,20,47,10,78,2),(28,20,48,10,90,2),(28,20,49,10,86,2),(28,20,50,10,81,2),
  (29,19,46,10,67,2),(29,19,47,10,62,2),(29,19,48,10,57,2),(29,19,49,10,70,2),(29,19,50,10,65,2),
  (29,20,46,10,72,2),(29,20,47,10,67,2),(29,20,48,10,64,2),(29,20,49,10,74,2),(29,20,50,10,69,2),
  (30,19,46,10,90,2),(30,19,47,10,84,2),(30,19,48,10,47,2),(30,19,49,10,78,2),(30,19,50,10,72,2),
  (30,20,46,10,94,2),(30,20,47,10,88,2),(30,20,48,10,52,2),(30,20,49,10,82,2),(30,20,50,10,76,2);

-- ===== ClassID=11, Students 31-33, ExamIDs 21-22, SubjectIDs 51-55 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (31,21,51,11,76,2),(31,21,52,11,70,2),(31,21,53,11,83,2),(31,21,54,11,78,2),(31,21,55,11,73,2),
  (31,22,51,11,80,2),(31,22,52,11,74,2),(31,22,53,11,86,2),(31,22,54,11,82,2),(31,22,55,11,77,2),
  (32,21,51,11,63,2),(32,21,52,11,58,2),(32,21,53,11,53,2),(32,21,54,11,66,2),(32,21,55,11,61,2),
  (32,22,51,11,68,2),(32,22,52,11,63,2),(32,22,53,11,60,2),(32,22,54,11,70,2),(32,22,55,11,65,2),
  (33,21,51,11,86,2),(33,21,52,11,80,2),(33,21,53,11,48,2),(33,21,54,11,74,2),(33,21,55,11,68,2),
  (33,22,51,11,90,2),(33,22,52,11,84,2),(33,22,53,11,53,2),(33,22,54,11,78,2),(33,22,55,11,72,2);

-- ===== ClassID=12, Students 34-36, ExamIDs 23-24, SubjectIDs 56-60 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (34,23,56,12,82,2),(34,23,57,12,76,2),(34,23,58,12,89,2),(34,23,59,12,84,2),(34,23,60,12,79,2),
  (34,24,56,12,86,2),(34,24,57,12,80,2),(34,24,58,12,92,2),(34,24,59,12,88,2),(34,24,60,12,83,2),
  (35,23,56,12,69,2),(35,23,57,12,64,2),(35,23,58,12,59,2),(35,23,59,12,72,2),(35,23,60,12,67,2),
  (35,24,56,12,74,2),(35,24,57,12,69,2),(35,24,58,12,66,2),(35,24,59,12,76,2),(35,24,60,12,71,2),
  (36,23,56,12,92,2),(36,23,57,12,86,2),(36,23,58,12,49,2),(36,23,59,12,80,2),(36,23,60,12,74,2),
  (36,24,56,12,96,2),(36,24,57,12,90,2),(36,24,58,12,54,2),(36,24,59,12,84,2),(36,24,60,12,78,2);

-- ===== ClassID=13, Students 37-39, ExamIDs 25-26, SubjectIDs 61-65 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (37,25,61,13,74,3),(37,25,62,13,68,3),(37,25,63,13,81,3),(37,25,64,13,76,3),(37,25,65,13,71,3),
  (37,26,61,13,78,3),(37,26,62,13,72,3),(37,26,63,13,84,3),(37,26,64,13,80,3),(37,26,65,13,75,3),
  (38,25,61,13,61,3),(38,25,62,13,56,3),(38,25,63,13,51,3),(38,25,64,13,64,3),(38,25,65,13,59,3),
  (38,26,61,13,66,3),(38,26,62,13,61,3),(38,26,63,13,58,3),(38,26,64,13,68,3),(38,26,65,13,63,3),
  (39,25,61,13,84,3),(39,25,62,13,78,3),(39,25,63,13,45,3),(39,25,64,13,72,3),(39,25,65,13,66,3),
  (39,26,61,13,88,3),(39,26,62,13,82,3),(39,26,63,13,50,3),(39,26,64,13,76,3),(39,26,65,13,70,3);

-- ===== ClassID=14, Students 40-42, ExamIDs 27-28, SubjectIDs 66-70 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (40,27,66,14,76,3),(40,27,67,14,70,3),(40,27,68,14,83,3),(40,27,69,14,78,3),(40,27,70,14,73,3),
  (40,28,66,14,80,3),(40,28,67,14,74,3),(40,28,68,14,86,3),(40,28,69,14,82,3),(40,28,70,14,77,3),
  (41,27,66,14,63,3),(41,27,67,14,58,3),(41,27,68,14,53,3),(41,27,69,14,66,3),(41,27,70,14,61,3),
  (41,28,66,14,68,3),(41,28,67,14,63,3),(41,28,68,14,60,3),(41,28,69,14,70,3),(41,28,70,14,65,3),
  (42,27,66,14,86,3),(42,27,67,14,80,3),(42,27,68,14,47,3),(42,27,69,14,74,3),(42,27,70,14,68,3),
  (42,28,66,14,90,3),(42,28,67,14,84,3),(42,28,68,14,52,3),(42,28,69,14,78,3),(42,28,70,14,72,3);

-- ===== ClassID=15, Students 43-45, ExamIDs 29-30, SubjectIDs 71-75 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (43,29,71,15,78,3),(43,29,72,15,72,3),(43,29,73,15,85,3),(43,29,74,15,80,3),(43,29,75,15,75,3),
  (43,30,71,15,82,3),(43,30,72,15,76,3),(43,30,73,15,88,3),(43,30,74,15,84,3),(43,30,75,15,79,3),
  (44,29,71,15,65,3),(44,29,72,15,60,3),(44,29,73,15,55,3),(44,29,74,15,68,3),(44,29,75,15,63,3),
  (44,30,71,15,70,3),(44,30,72,15,65,3),(44,30,73,15,62,3),(44,30,74,15,72,3),(44,30,75,15,67,3),
  (45,29,71,15,88,3),(45,29,72,15,82,3),(45,29,73,15,49,3),(45,29,74,15,76,3),(45,29,75,15,70,3),
  (45,30,71,15,92,3),(45,30,72,15,86,3),(45,30,73,15,54,3),(45,30,74,15,80,3),(45,30,75,15,74,3);

-- ===== ClassID=16, Students 46-48, ExamIDs 31-32, SubjectIDs 76-80 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (46,31,76,16,80,3),(46,31,77,16,74,3),(46,31,78,16,87,3),(46,31,79,16,82,3),(46,31,80,16,77,3),
  (46,32,76,16,84,3),(46,32,77,16,78,3),(46,32,78,16,90,3),(46,32,79,16,86,3),(46,32,80,16,81,3),
  (47,31,76,16,67,3),(47,31,77,16,62,3),(47,31,78,16,57,3),(47,31,79,16,70,3),(47,31,80,16,65,3),
  (47,32,76,16,72,3),(47,32,77,16,67,3),(47,32,78,16,64,3),(47,32,79,16,74,3),(47,32,80,16,69,3),
  (48,31,76,16,90,3),(48,31,77,16,84,3),(48,31,78,16,47,3),(48,31,79,16,78,3),(48,31,80,16,72,3),
  (48,32,76,16,94,3),(48,32,77,16,88,3),(48,32,78,16,52,3),(48,32,79,16,82,3),(48,32,80,16,76,3);

-- ===== ClassID=17, Students 49-51, ExamIDs 33-34, SubjectIDs 81-85 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (49,33,81,17,75,3),(49,33,82,17,69,3),(49,33,83,17,82,3),(49,33,84,17,77,3),(49,33,85,17,72,3),
  (49,34,81,17,79,3),(49,34,82,17,73,3),(49,34,83,17,85,3),(49,34,84,17,81,3),(49,34,85,17,76,3),
  (50,33,81,17,62,3),(50,33,82,17,57,3),(50,33,83,17,52,3),(50,33,84,17,65,3),(50,33,85,17,60,3),
  (50,34,81,17,67,3),(50,34,82,17,62,3),(50,34,83,17,59,3),(50,34,84,17,69,3),(50,34,85,17,64,3),
  (51,33,81,17,85,3),(51,33,82,17,79,3),(51,33,83,17,46,3),(51,33,84,17,73,3),(51,33,85,17,67,3),
  (51,34,81,17,89,3),(51,34,82,17,83,3),(51,34,83,17,51,3),(51,34,84,17,77,3),(51,34,85,17,71,3);

-- ===== ClassID=18, Students 52-54, ExamIDs 35-36, SubjectIDs 86-90 =====
INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id) VALUES
  (52,35,86,18,83,3),(52,35,87,18,77,3),(52,35,88,18,90,3),(52,35,89,18,85,3),(52,35,90,18,80,3),
  (52,36,86,18,87,3),(52,36,87,18,81,3),(52,36,88,18,93,3),(52,36,89,18,89,3),(52,36,90,18,84,3),
  (53,35,86,18,70,3),(53,35,87,18,65,3),(53,35,88,18,60,3),(53,35,89,18,73,3),(53,35,90,18,68,3),
  (53,36,86,18,75,3),(53,36,87,18,70,3),(53,36,88,18,67,3),(53,36,89,18,77,3),(53,36,90,18,72,3),
  (54,35,86,18,93,3),(54,35,87,18,87,3),(54,35,88,18,50,3),(54,35,89,18,81,3),(54,35,90,18,75,3),
  (54,36,86,18,97,3),(54,36,87,18,91,3),(54,36,88,18,55,3),(54,36,89,18,85,3),(54,36,90,18,79,3);

-- ── 10. Attendance (486 rows: 54 students × 9 days) ──────────
-- Dates: 2026-04-05(Sun), 04-06(Mon), 04-07(Tue), 04-08(Wed), 04-09(Thu),
--        04-12(Sun), 04-13(Mon), 04-14(Tue), 04-15(Wed)
-- Pattern: Student slot 1 = good attender (8P,1A), slot 2 = avg (7P,1A,1L), slot 3 = mix (7P,2A)
-- (slot = position within class: students 1,4,7... = slot1; 2,5,8... = slot2; 3,6,9... = slot3)

-- Branch 1, Class 6/A (ClassID=1): Students 1,2,3
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
-- Student 1 (slot1: 8P,1A — absent on 04-09)
  (1,1,'2026-04-05','Present',1),(1,1,'2026-04-06','Present',1),(1,1,'2026-04-07','Present',1),
  (1,1,'2026-04-08','Present',1),(1,1,'2026-04-09','Absent',1),(1,1,'2026-04-12','Present',1),
  (1,1,'2026-04-13','Present',1),(1,1,'2026-04-14','Present',1),(1,1,'2026-04-15','Present',1),
-- Student 2 (slot2: 7P,1A,1L — absent 04-07, late 04-13)
  (2,1,'2026-04-05','Present',1),(2,1,'2026-04-06','Present',1),(2,1,'2026-04-07','Absent',1),
  (2,1,'2026-04-08','Present',1),(2,1,'2026-04-09','Present',1),(2,1,'2026-04-12','Present',1),
  (2,1,'2026-04-13','Late',1),(2,1,'2026-04-14','Present',1),(2,1,'2026-04-15','Present',1),
-- Student 3 (slot3: 7P,2A — absent 04-06, 04-14)
  (3,1,'2026-04-05','Present',1),(3,1,'2026-04-06','Absent',1),(3,1,'2026-04-07','Present',1),
  (3,1,'2026-04-08','Present',1),(3,1,'2026-04-09','Present',1),(3,1,'2026-04-12','Present',1),
  (3,1,'2026-04-13','Present',1),(3,1,'2026-04-14','Absent',1),(3,1,'2026-04-15','Present',1);

-- Branch 1, Class 6/B (ClassID=2): Students 4,5,6
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (4,2,'2026-04-05','Present',1),(4,2,'2026-04-06','Present',1),(4,2,'2026-04-07','Present',1),
  (4,2,'2026-04-08','Present',1),(4,2,'2026-04-09','Absent',1),(4,2,'2026-04-12','Present',1),
  (4,2,'2026-04-13','Present',1),(4,2,'2026-04-14','Present',1),(4,2,'2026-04-15','Present',1),
  (5,2,'2026-04-05','Present',1),(5,2,'2026-04-06','Present',1),(5,2,'2026-04-07','Absent',1),
  (5,2,'2026-04-08','Present',1),(5,2,'2026-04-09','Present',1),(5,2,'2026-04-12','Present',1),
  (5,2,'2026-04-13','Late',1),(5,2,'2026-04-14','Present',1),(5,2,'2026-04-15','Present',1),
  (6,2,'2026-04-05','Present',1),(6,2,'2026-04-06','Absent',1),(6,2,'2026-04-07','Present',1),
  (6,2,'2026-04-08','Present',1),(6,2,'2026-04-09','Present',1),(6,2,'2026-04-12','Present',1),
  (6,2,'2026-04-13','Present',1),(6,2,'2026-04-14','Absent',1),(6,2,'2026-04-15','Present',1);

-- Branch 1, Class 7/A (ClassID=3): Students 7,8,9
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (7,3,'2026-04-05','Present',1),(7,3,'2026-04-06','Present',1),(7,3,'2026-04-07','Present',1),
  (7,3,'2026-04-08','Present',1),(7,3,'2026-04-09','Absent',1),(7,3,'2026-04-12','Present',1),
  (7,3,'2026-04-13','Present',1),(7,3,'2026-04-14','Present',1),(7,3,'2026-04-15','Present',1),
  (8,3,'2026-04-05','Present',1),(8,3,'2026-04-06','Present',1),(8,3,'2026-04-07','Absent',1),
  (8,3,'2026-04-08','Present',1),(8,3,'2026-04-09','Present',1),(8,3,'2026-04-12','Present',1),
  (8,3,'2026-04-13','Late',1),(8,3,'2026-04-14','Present',1),(8,3,'2026-04-15','Present',1),
  (9,3,'2026-04-05','Present',1),(9,3,'2026-04-06','Absent',1),(9,3,'2026-04-07','Present',1),
  (9,3,'2026-04-08','Present',1),(9,3,'2026-04-09','Present',1),(9,3,'2026-04-12','Present',1),
  (9,3,'2026-04-13','Present',1),(9,3,'2026-04-14','Absent',1),(9,3,'2026-04-15','Present',1);

-- Branch 1, Class 8/A (ClassID=4): Students 10,11,12
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (10,4,'2026-04-05','Present',1),(10,4,'2026-04-06','Present',1),(10,4,'2026-04-07','Present',1),
  (10,4,'2026-04-08','Present',1),(10,4,'2026-04-09','Absent',1),(10,4,'2026-04-12','Present',1),
  (10,4,'2026-04-13','Present',1),(10,4,'2026-04-14','Present',1),(10,4,'2026-04-15','Present',1),
  (11,4,'2026-04-05','Present',1),(11,4,'2026-04-06','Present',1),(11,4,'2026-04-07','Absent',1),
  (11,4,'2026-04-08','Present',1),(11,4,'2026-04-09','Present',1),(11,4,'2026-04-12','Present',1),
  (11,4,'2026-04-13','Late',1),(11,4,'2026-04-14','Present',1),(11,4,'2026-04-15','Present',1),
  (12,4,'2026-04-05','Present',1),(12,4,'2026-04-06','Absent',1),(12,4,'2026-04-07','Present',1),
  (12,4,'2026-04-08','Present',1),(12,4,'2026-04-09','Present',1),(12,4,'2026-04-12','Present',1),
  (12,4,'2026-04-13','Present',1),(12,4,'2026-04-14','Absent',1),(12,4,'2026-04-15','Present',1);

-- Branch 1, Class 9/A (ClassID=5): Students 13,14,15
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (13,5,'2026-04-05','Present',1),(13,5,'2026-04-06','Present',1),(13,5,'2026-04-07','Present',1),
  (13,5,'2026-04-08','Present',1),(13,5,'2026-04-09','Absent',1),(13,5,'2026-04-12','Present',1),
  (13,5,'2026-04-13','Present',1),(13,5,'2026-04-14','Present',1),(13,5,'2026-04-15','Present',1),
  (14,5,'2026-04-05','Present',1),(14,5,'2026-04-06','Present',1),(14,5,'2026-04-07','Absent',1),
  (14,5,'2026-04-08','Present',1),(14,5,'2026-04-09','Present',1),(14,5,'2026-04-12','Present',1),
  (14,5,'2026-04-13','Late',1),(14,5,'2026-04-14','Present',1),(14,5,'2026-04-15','Present',1),
  (15,5,'2026-04-05','Present',1),(15,5,'2026-04-06','Absent',1),(15,5,'2026-04-07','Present',1),
  (15,5,'2026-04-08','Present',1),(15,5,'2026-04-09','Present',1),(15,5,'2026-04-12','Present',1),
  (15,5,'2026-04-13','Present',1),(15,5,'2026-04-14','Absent',1),(15,5,'2026-04-15','Present',1);

-- Branch 1, Class 10/A (ClassID=6): Students 16,17,18
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (16,6,'2026-04-05','Present',1),(16,6,'2026-04-06','Present',1),(16,6,'2026-04-07','Present',1),
  (16,6,'2026-04-08','Present',1),(16,6,'2026-04-09','Absent',1),(16,6,'2026-04-12','Present',1),
  (16,6,'2026-04-13','Present',1),(16,6,'2026-04-14','Present',1),(16,6,'2026-04-15','Present',1),
  (17,6,'2026-04-05','Present',1),(17,6,'2026-04-06','Present',1),(17,6,'2026-04-07','Absent',1),
  (17,6,'2026-04-08','Present',1),(17,6,'2026-04-09','Present',1),(17,6,'2026-04-12','Present',1),
  (17,6,'2026-04-13','Late',1),(17,6,'2026-04-14','Present',1),(17,6,'2026-04-15','Present',1),
  (18,6,'2026-04-05','Present',1),(18,6,'2026-04-06','Absent',1),(18,6,'2026-04-07','Present',1),
  (18,6,'2026-04-08','Present',1),(18,6,'2026-04-09','Present',1),(18,6,'2026-04-12','Present',1),
  (18,6,'2026-04-13','Present',1),(18,6,'2026-04-14','Absent',1),(18,6,'2026-04-15','Present',1);

-- Branch 2, Class 6/Morning (ClassID=7): Students 19,20,21
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (19,7,'2026-04-05','Present',2),(19,7,'2026-04-06','Present',2),(19,7,'2026-04-07','Present',2),
  (19,7,'2026-04-08','Present',2),(19,7,'2026-04-09','Absent',2),(19,7,'2026-04-12','Present',2),
  (19,7,'2026-04-13','Present',2),(19,7,'2026-04-14','Present',2),(19,7,'2026-04-15','Present',2),
  (20,7,'2026-04-05','Present',2),(20,7,'2026-04-06','Present',2),(20,7,'2026-04-07','Absent',2),
  (20,7,'2026-04-08','Present',2),(20,7,'2026-04-09','Present',2),(20,7,'2026-04-12','Present',2),
  (20,7,'2026-04-13','Late',2),(20,7,'2026-04-14','Present',2),(20,7,'2026-04-15','Present',2),
  (21,7,'2026-04-05','Present',2),(21,7,'2026-04-06','Absent',2),(21,7,'2026-04-07','Present',2),
  (21,7,'2026-04-08','Present',2),(21,7,'2026-04-09','Present',2),(21,7,'2026-04-12','Present',2),
  (21,7,'2026-04-13','Present',2),(21,7,'2026-04-14','Absent',2),(21,7,'2026-04-15','Present',2);

-- Branch 2, Class 6/Day (ClassID=8): Students 22,23,24
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (22,8,'2026-04-05','Present',2),(22,8,'2026-04-06','Present',2),(22,8,'2026-04-07','Present',2),
  (22,8,'2026-04-08','Present',2),(22,8,'2026-04-09','Absent',2),(22,8,'2026-04-12','Present',2),
  (22,8,'2026-04-13','Present',2),(22,8,'2026-04-14','Present',2),(22,8,'2026-04-15','Present',2),
  (23,8,'2026-04-05','Present',2),(23,8,'2026-04-06','Present',2),(23,8,'2026-04-07','Absent',2),
  (23,8,'2026-04-08','Present',2),(23,8,'2026-04-09','Present',2),(23,8,'2026-04-12','Present',2),
  (23,8,'2026-04-13','Late',2),(23,8,'2026-04-14','Present',2),(23,8,'2026-04-15','Present',2),
  (24,8,'2026-04-05','Present',2),(24,8,'2026-04-06','Absent',2),(24,8,'2026-04-07','Present',2),
  (24,8,'2026-04-08','Present',2),(24,8,'2026-04-09','Present',2),(24,8,'2026-04-12','Present',2),
  (24,8,'2026-04-13','Present',2),(24,8,'2026-04-14','Absent',2),(24,8,'2026-04-15','Present',2);

-- Branch 2, Class 7/Morning (ClassID=9): Students 25,26,27
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (25,9,'2026-04-05','Present',2),(25,9,'2026-04-06','Present',2),(25,9,'2026-04-07','Present',2),
  (25,9,'2026-04-08','Present',2),(25,9,'2026-04-09','Absent',2),(25,9,'2026-04-12','Present',2),
  (25,9,'2026-04-13','Present',2),(25,9,'2026-04-14','Present',2),(25,9,'2026-04-15','Present',2),
  (26,9,'2026-04-05','Present',2),(26,9,'2026-04-06','Present',2),(26,9,'2026-04-07','Absent',2),
  (26,9,'2026-04-08','Present',2),(26,9,'2026-04-09','Present',2),(26,9,'2026-04-12','Present',2),
  (26,9,'2026-04-13','Late',2),(26,9,'2026-04-14','Present',2),(26,9,'2026-04-15','Present',2),
  (27,9,'2026-04-05','Present',2),(27,9,'2026-04-06','Absent',2),(27,9,'2026-04-07','Present',2),
  (27,9,'2026-04-08','Present',2),(27,9,'2026-04-09','Present',2),(27,9,'2026-04-12','Present',2),
  (27,9,'2026-04-13','Present',2),(27,9,'2026-04-14','Absent',2),(27,9,'2026-04-15','Present',2);

-- Branch 2, Class 8/Morning (ClassID=10): Students 28,29,30
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (28,10,'2026-04-05','Present',2),(28,10,'2026-04-06','Present',2),(28,10,'2026-04-07','Present',2),
  (28,10,'2026-04-08','Present',2),(28,10,'2026-04-09','Absent',2),(28,10,'2026-04-12','Present',2),
  (28,10,'2026-04-13','Present',2),(28,10,'2026-04-14','Present',2),(28,10,'2026-04-15','Present',2),
  (29,10,'2026-04-05','Present',2),(29,10,'2026-04-06','Present',2),(29,10,'2026-04-07','Absent',2),
  (29,10,'2026-04-08','Present',2),(29,10,'2026-04-09','Present',2),(29,10,'2026-04-12','Present',2),
  (29,10,'2026-04-13','Late',2),(29,10,'2026-04-14','Present',2),(29,10,'2026-04-15','Present',2),
  (30,10,'2026-04-05','Present',2),(30,10,'2026-04-06','Absent',2),(30,10,'2026-04-07','Present',2),
  (30,10,'2026-04-08','Present',2),(30,10,'2026-04-09','Present',2),(30,10,'2026-04-12','Present',2),
  (30,10,'2026-04-13','Present',2),(30,10,'2026-04-14','Absent',2),(30,10,'2026-04-15','Present',2);

-- Branch 2, Class 9/Day (ClassID=11): Students 31,32,33
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (31,11,'2026-04-05','Present',2),(31,11,'2026-04-06','Present',2),(31,11,'2026-04-07','Present',2),
  (31,11,'2026-04-08','Present',2),(31,11,'2026-04-09','Absent',2),(31,11,'2026-04-12','Present',2),
  (31,11,'2026-04-13','Present',2),(31,11,'2026-04-14','Present',2),(31,11,'2026-04-15','Present',2),
  (32,11,'2026-04-05','Present',2),(32,11,'2026-04-06','Present',2),(32,11,'2026-04-07','Absent',2),
  (32,11,'2026-04-08','Present',2),(32,11,'2026-04-09','Present',2),(32,11,'2026-04-12','Present',2),
  (32,11,'2026-04-13','Late',2),(32,11,'2026-04-14','Present',2),(32,11,'2026-04-15','Present',2),
  (33,11,'2026-04-05','Present',2),(33,11,'2026-04-06','Absent',2),(33,11,'2026-04-07','Present',2),
  (33,11,'2026-04-08','Present',2),(33,11,'2026-04-09','Present',2),(33,11,'2026-04-12','Present',2),
  (33,11,'2026-04-13','Present',2),(33,11,'2026-04-14','Absent',2),(33,11,'2026-04-15','Present',2);

-- Branch 2, Class 10/Morning (ClassID=12): Students 34,35,36
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (34,12,'2026-04-05','Present',2),(34,12,'2026-04-06','Present',2),(34,12,'2026-04-07','Present',2),
  (34,12,'2026-04-08','Present',2),(34,12,'2026-04-09','Absent',2),(34,12,'2026-04-12','Present',2),
  (34,12,'2026-04-13','Present',2),(34,12,'2026-04-14','Present',2),(34,12,'2026-04-15','Present',2),
  (35,12,'2026-04-05','Present',2),(35,12,'2026-04-06','Present',2),(35,12,'2026-04-07','Absent',2),
  (35,12,'2026-04-08','Present',2),(35,12,'2026-04-09','Present',2),(35,12,'2026-04-12','Present',2),
  (35,12,'2026-04-13','Late',2),(35,12,'2026-04-14','Present',2),(35,12,'2026-04-15','Present',2),
  (36,12,'2026-04-05','Present',2),(36,12,'2026-04-06','Absent',2),(36,12,'2026-04-07','Present',2),
  (36,12,'2026-04-08','Present',2),(36,12,'2026-04-09','Present',2),(36,12,'2026-04-12','Present',2),
  (36,12,'2026-04-13','Present',2),(36,12,'2026-04-14','Absent',2),(36,12,'2026-04-15','Present',2);

-- Branch 3, Class 6/Bangla (ClassID=13): Students 37,38,39
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (37,13,'2026-04-05','Present',3),(37,13,'2026-04-06','Present',3),(37,13,'2026-04-07','Present',3),
  (37,13,'2026-04-08','Present',3),(37,13,'2026-04-09','Absent',3),(37,13,'2026-04-12','Present',3),
  (37,13,'2026-04-13','Present',3),(37,13,'2026-04-14','Present',3),(37,13,'2026-04-15','Present',3),
  (38,13,'2026-04-05','Present',3),(38,13,'2026-04-06','Present',3),(38,13,'2026-04-07','Absent',3),
  (38,13,'2026-04-08','Present',3),(38,13,'2026-04-09','Present',3),(38,13,'2026-04-12','Present',3),
  (38,13,'2026-04-13','Late',3),(38,13,'2026-04-14','Present',3),(38,13,'2026-04-15','Present',3),
  (39,13,'2026-04-05','Present',3),(39,13,'2026-04-06','Absent',3),(39,13,'2026-04-07','Present',3),
  (39,13,'2026-04-08','Present',3),(39,13,'2026-04-09','Present',3),(39,13,'2026-04-12','Present',3),
  (39,13,'2026-04-13','Present',3),(39,13,'2026-04-14','Absent',3),(39,13,'2026-04-15','Present',3);

-- Branch 3, Class 6/English (ClassID=14): Students 40,41,42
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (40,14,'2026-04-05','Present',3),(40,14,'2026-04-06','Present',3),(40,14,'2026-04-07','Present',3),
  (40,14,'2026-04-08','Present',3),(40,14,'2026-04-09','Absent',3),(40,14,'2026-04-12','Present',3),
  (40,14,'2026-04-13','Present',3),(40,14,'2026-04-14','Present',3),(40,14,'2026-04-15','Present',3),
  (41,14,'2026-04-05','Present',3),(41,14,'2026-04-06','Present',3),(41,14,'2026-04-07','Absent',3),
  (41,14,'2026-04-08','Present',3),(41,14,'2026-04-09','Present',3),(41,14,'2026-04-12','Present',3),
  (41,14,'2026-04-13','Late',3),(41,14,'2026-04-14','Present',3),(41,14,'2026-04-15','Present',3),
  (42,14,'2026-04-05','Present',3),(42,14,'2026-04-06','Absent',3),(42,14,'2026-04-07','Present',3),
  (42,14,'2026-04-08','Present',3),(42,14,'2026-04-09','Present',3),(42,14,'2026-04-12','Present',3),
  (42,14,'2026-04-13','Present',3),(42,14,'2026-04-14','Absent',3),(42,14,'2026-04-15','Present',3);

-- Branch 3, Class 7/Bangla (ClassID=15): Students 43,44,45
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (43,15,'2026-04-05','Present',3),(43,15,'2026-04-06','Present',3),(43,15,'2026-04-07','Present',3),
  (43,15,'2026-04-08','Present',3),(43,15,'2026-04-09','Absent',3),(43,15,'2026-04-12','Present',3),
  (43,15,'2026-04-13','Present',3),(43,15,'2026-04-14','Present',3),(43,15,'2026-04-15','Present',3),
  (44,15,'2026-04-05','Present',3),(44,15,'2026-04-06','Present',3),(44,15,'2026-04-07','Absent',3),
  (44,15,'2026-04-08','Present',3),(44,15,'2026-04-09','Present',3),(44,15,'2026-04-12','Present',3),
  (44,15,'2026-04-13','Late',3),(44,15,'2026-04-14','Present',3),(44,15,'2026-04-15','Present',3),
  (45,15,'2026-04-05','Present',3),(45,15,'2026-04-06','Absent',3),(45,15,'2026-04-07','Present',3),
  (45,15,'2026-04-08','Present',3),(45,15,'2026-04-09','Present',3),(45,15,'2026-04-12','Present',3),
  (45,15,'2026-04-13','Present',3),(45,15,'2026-04-14','Absent',3),(45,15,'2026-04-15','Present',3);

-- Branch 3, Class 8/English (ClassID=16): Students 46,47,48
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (46,16,'2026-04-05','Present',3),(46,16,'2026-04-06','Present',3),(46,16,'2026-04-07','Present',3),
  (46,16,'2026-04-08','Present',3),(46,16,'2026-04-09','Absent',3),(46,16,'2026-04-12','Present',3),
  (46,16,'2026-04-13','Present',3),(46,16,'2026-04-14','Present',3),(46,16,'2026-04-15','Present',3),
  (47,16,'2026-04-05','Present',3),(47,16,'2026-04-06','Present',3),(47,16,'2026-04-07','Absent',3),
  (47,16,'2026-04-08','Present',3),(47,16,'2026-04-09','Present',3),(47,16,'2026-04-12','Present',3),
  (47,16,'2026-04-13','Late',3),(47,16,'2026-04-14','Present',3),(47,16,'2026-04-15','Present',3),
  (48,16,'2026-04-05','Present',3),(48,16,'2026-04-06','Absent',3),(48,16,'2026-04-07','Present',3),
  (48,16,'2026-04-08','Present',3),(48,16,'2026-04-09','Present',3),(48,16,'2026-04-12','Present',3),
  (48,16,'2026-04-13','Present',3),(48,16,'2026-04-14','Absent',3),(48,16,'2026-04-15','Present',3);

-- Branch 3, Class 9/Bangla (ClassID=17): Students 49,50,51
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (49,17,'2026-04-05','Present',3),(49,17,'2026-04-06','Present',3),(49,17,'2026-04-07','Present',3),
  (49,17,'2026-04-08','Present',3),(49,17,'2026-04-09','Absent',3),(49,17,'2026-04-12','Present',3),
  (49,17,'2026-04-13','Present',3),(49,17,'2026-04-14','Present',3),(49,17,'2026-04-15','Present',3),
  (50,17,'2026-04-05','Present',3),(50,17,'2026-04-06','Present',3),(50,17,'2026-04-07','Absent',3),
  (50,17,'2026-04-08','Present',3),(50,17,'2026-04-09','Present',3),(50,17,'2026-04-12','Present',3),
  (50,17,'2026-04-13','Late',3),(50,17,'2026-04-14','Present',3),(50,17,'2026-04-15','Present',3),
  (51,17,'2026-04-05','Present',3),(51,17,'2026-04-06','Absent',3),(51,17,'2026-04-07','Present',3),
  (51,17,'2026-04-08','Present',3),(51,17,'2026-04-09','Present',3),(51,17,'2026-04-12','Present',3),
  (51,17,'2026-04-13','Present',3),(51,17,'2026-04-14','Absent',3),(51,17,'2026-04-15','Present',3);

-- Branch 3, Class 10/English (ClassID=18): Students 52,53,54
INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES
  (52,18,'2026-04-05','Present',3),(52,18,'2026-04-06','Present',3),(52,18,'2026-04-07','Present',3),
  (52,18,'2026-04-08','Present',3),(52,18,'2026-04-09','Absent',3),(52,18,'2026-04-12','Present',3),
  (52,18,'2026-04-13','Present',3),(52,18,'2026-04-14','Present',3),(52,18,'2026-04-15','Present',3),
  (53,18,'2026-04-05','Present',3),(53,18,'2026-04-06','Present',3),(53,18,'2026-04-07','Absent',3),
  (53,18,'2026-04-08','Present',3),(53,18,'2026-04-09','Present',3),(53,18,'2026-04-12','Present',3),
  (53,18,'2026-04-13','Late',3),(53,18,'2026-04-14','Present',3),(53,18,'2026-04-15','Present',3),
  (54,18,'2026-04-05','Present',3),(54,18,'2026-04-06','Absent',3),(54,18,'2026-04-07','Present',3),
  (54,18,'2026-04-08','Present',3),(54,18,'2026-04-09','Present',3),(54,18,'2026-04-12','Present',3),
  (54,18,'2026-04-13','Present',3),(54,18,'2026-04-14','Absent',3),(54,18,'2026-04-15','Present',3);

-- ── 11. Branch Admins (upsert, keeping AdminIDs 20,21,22) ────
-- Password "Admin@1234" → $2a$10$JDjlMJFES.QAAtew7QBthu9HDuSvquCFO42JlbV/3mPV7QQMxrPyW
INSERT INTO Admin (AdminID, Username, Email, Password, role, branch_id, Language)
VALUES
  (20, 'natiapara_admin', 'admin.natiapara@star.edu', '$2a$10$JDjlMJFES.QAAtew7QBthu9HDuSvquCFO42JlbV/3mPV7QQMxrPyW', 'branch_admin', 1, 'bn'),
  (21, 'pakullah_admin',  'admin.pakullah@star.edu',  '$2a$10$JDjlMJFES.QAAtew7QBthu9HDuSvquCFO42JlbV/3mPV7QQMxrPyW', 'branch_admin', 2, 'bn'),
  (22, 'mirjapur_admin',  'admin.mirjapur@star.edu',  '$2a$10$JDjlMJFES.QAAtew7QBthu9HDuSvquCFO42JlbV/3mPV7QQMxrPyW', 'branch_admin', 3, 'bn')
ON DUPLICATE KEY UPDATE
  Username   = VALUES(Username),
  Email      = VALUES(Email),
  Password   = VALUES(Password),
  role       = VALUES(role),
  branch_id  = VALUES(branch_id),
  Language   = VALUES(Language);

SET FOREIGN_KEY_CHECKS = 1;
