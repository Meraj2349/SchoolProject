-- ============================================================
-- Dummy Data for School Management System
-- Run this AFTER all CREATE TABLE statements have been executed.
-- Order matters — parent tables before child tables.
-- ============================================================
-- -------------------------------------------------------
-- 1. Admin
-- -------------------------------------------------------
INSERT IGNORE INTO
  Admin (Username, Email, Password)
VALUES
  (
    'admin',
    'admin@school.edu.bd',
    '$2b$10$dummyhashedpassword1234567890abcdefghij'
  ),
  (
    'principal',
    'principal@school.edu.bd',
    '$2b$10$dummyhashedpassword0987654321zyxwvutsrq'
  );

-- -------------------------------------------------------
-- 2. Teachers (no FK dependency)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Teachers (
    FirstName,
    LastName,
    Subject,
    ContactNumber,
    Email,
    JoiningDate,
    Address
  )
VALUES
  (
    'Rahim',
    'Uddin',
    'Mathematics',
    '01711111111',
    'rahim@school.edu.bd',
    '2018-01-15',
    'Sylhet, Bangladesh'
  ),
  (
    'Nasrin',
    'Akter',
    'English',
    '01722222222',
    'nasrin@school.edu.bd',
    '2019-03-10',
    'Sylhet, Bangladesh'
  ),
  (
    'Karim',
    'Hossain',
    'Science',
    '01733333333',
    'karim@school.edu.bd',
    '2017-06-01',
    'Sylhet, Bangladesh'
  ),
  (
    'Fatema',
    'Begum',
    'Bangla',
    '01744444444',
    'fatema@school.edu.bd',
    '2020-07-20',
    'Sylhet, Bangladesh'
  ),
  (
    'Jahangir',
    'Alam',
    'Social Studies',
    '01755555555',
    'jahangir@school.edu.bd',
    '2016-09-05',
    'Sylhet, Bangladesh'
  ),
  (
    'Sadia',
    'Islam',
    'Religion',
    '01766666666',
    'sadia@school.edu.bd',
    '2021-01-12',
    'Sylhet, Bangladesh'
  ),
  (
    'Minhaj',
    'Rahman',
    'ICT',
    '01777777777',
    'minhaj@school.edu.bd',
    '2022-02-28',
    'Sylhet, Bangladesh'
  ),
  (
    'Roksana',
    'Khanam',
    'Physics',
    '01788888888',
    'roksana@school.edu.bd',
    '2019-08-15',
    'Sylhet, Bangladesh'
  ),
  (
    'Belal',
    'Hossain',
    'Chemistry',
    '01799999999',
    'belal@school.edu.bd',
    '2018-11-01',
    'Sylhet, Bangladesh'
  ),
  (
    'Shirina',
    'Parvin',
    'Biology',
    '01700000000',
    'shirina@school.edu.bd',
    '2020-04-10',
    'Sylhet, Bangladesh'
  );

-- -------------------------------------------------------
-- 3. Classes (FK → Teachers)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Classes (ClassID, ClassName, Section, TeacherID)
VALUES
  (1, 'Class 6', 'A', 1),
  (2, 'Class 6', 'B', 2),
  (3, 'Class 7', 'A', 3),
  (4, 'Class 7', 'B', 4),
  (5, 'Class 8', 'A', 5),
  (6, 'Class 8', 'B', 6),
  (7, 'Class 9', 'A', 7),
  (8, 'Class 9', 'B', 8),
  (9, 'Class 9', 'C', 9),
  (10, 'Class 10', 'A', 10);

-- -------------------------------------------------------
-- 4. Subjects (FK → Classes)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Subjects (SubjectName, ClassID)
VALUES
  ('Bangla', 1),
  ('English', 1),
  ('Mathematics', 1),
  ('Science', 1),
  ('Social Studies', 1),
  ('Bangla', 2),
  ('English', 2),
  ('Mathematics', 2),
  ('Science', 2),
  ('Social Studies', 2),
  ('Bangla', 3),
  ('English', 3),
  ('Mathematics', 3),
  ('Science', 3),
  ('Social Studies', 3),
  ('Bangla', 4),
  ('English', 4),
  ('Mathematics', 4),
  ('Science', 4),
  ('Social Studies', 4),
  ('Bangla', 5),
  ('English', 5),
  ('Mathematics', 5),
  ('Physics', 5),
  ('Chemistry', 5),
  ('Bangla', 6),
  ('English', 6),
  ('Mathematics', 6),
  ('Physics', 6),
  ('Chemistry', 6),
  ('Bangla', 7),
  ('English', 7),
  ('Mathematics', 7),
  ('Physics', 7),
  ('Chemistry', 7),
  ('Biology', 7),
  ('Bangla', 8),
  ('English', 8),
  ('Mathematics', 8),
  ('Physics', 8),
  ('Chemistry', 8),
  ('Biology', 8),
  ('Bangla', 9),
  ('English', 9),
  ('Mathematics', 9),
  ('Physics', 9),
  ('Chemistry', 9),
  ('Biology', 9),
  ('Bangla', 10),
  ('English', 10),
  ('Mathematics', 10),
  ('Physics', 10),
  ('Chemistry', 10),
  ('Biology', 10);

-- -------------------------------------------------------
-- 5. Students (FK → Classes)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Students (
    FirstName,
    LastName,
    RollNumber,
    DateOfBirth,
    Gender,
    ClassID,
    AdmissionDate,
    Address,
    ParentContact
  )
VALUES
  -- Class 6-A
  (
    'Arif',
    'Hossain',
    '601',
    '2013-04-12',
    'Male',
    1,
    '2024-01-10',
    'Sylhet',
    '01811111111'
  ),
  (
    'Mitu',
    'Begum',
    '602',
    '2013-06-22',
    'Female',
    1,
    '2024-01-10',
    'Sylhet',
    '01822222222'
  ),
  (
    'Rakib',
    'Islam',
    '603',
    '2013-09-05',
    'Male',
    1,
    '2024-01-10',
    'Sylhet',
    '01833333333'
  ),
  (
    'Sonia',
    'Akter',
    '604',
    '2013-02-18',
    'Female',
    1,
    '2024-01-10',
    'Sylhet',
    '01844444444'
  ),
  -- Class 6-B
  (
    'Tanvir',
    'Ahmed',
    '605',
    '2013-07-30',
    'Male',
    2,
    '2024-01-10',
    'Sylhet',
    '01855555555'
  ),
  (
    'Rima',
    'Khatun',
    '606',
    '2013-11-15',
    'Female',
    2,
    '2024-01-10',
    'Sylhet',
    '01866666666'
  ),
  -- Class 7-A
  (
    'Sabbir',
    'Rahman',
    '701',
    '2012-03-20',
    'Male',
    3,
    '2023-01-12',
    'Sylhet',
    '01877777777'
  ),
  (
    'Nadia',
    'Sultana',
    '702',
    '2012-08-08',
    'Female',
    3,
    '2023-01-12',
    'Sylhet',
    '01888888888'
  ),
  (
    'Imran',
    'Hossain',
    '703',
    '2012-05-14',
    'Male',
    3,
    '2023-01-12',
    'Sylhet',
    '01899999999'
  ),
  -- Class 8-A
  (
    'Tasnim',
    'Zaman',
    '801',
    '2011-01-25',
    'Female',
    5,
    '2022-01-15',
    'Sylhet',
    '01911111111'
  ),
  (
    'Farhan',
    'Kabir',
    '802',
    '2011-04-17',
    'Male',
    5,
    '2022-01-15',
    'Sylhet',
    '01922222222'
  ),
  -- Class 9-A
  (
    'Mehedi',
    'Hassan',
    '901',
    '2010-06-10',
    'Male',
    7,
    '2021-01-08',
    'Sylhet',
    '01933333333'
  ),
  (
    'Jannatul',
    'Ferdous',
    '902',
    '2010-09-28',
    'Female',
    7,
    '2021-01-08',
    'Sylhet',
    '01944444444'
  ),
  (
    'Rafi',
    'Uddin',
    '903',
    '2010-12-03',
    'Male',
    7,
    '2021-01-08',
    'Sylhet',
    '01955555555'
  ),
  -- Class 10-A
  (
    'Sumaiya',
    'Islam',
    '1001',
    '2009-02-14',
    'Female',
    10,
    '2020-01-05',
    'Sylhet',
    '01966666666'
  ),
  (
    'Nafis',
    'Hossain',
    '1002',
    '2009-07-21',
    'Male',
    10,
    '2020-01-05',
    'Sylhet',
    '01977777777'
  ),
  (
    'Lamia',
    'Akter',
    '1003',
    '2009-10-30',
    'Female',
    10,
    '2020-01-05',
    'Sylhet',
    '01988888888'
  );

-- -------------------------------------------------------
-- 6. Exams (FK → Classes)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Exams (ExamType, ExamName, ClassID, ExamDate)
VALUES
  (
    'Monthly',
    '1st Monthly Exam 2025',
    1,
    '2025-02-10'
  ),
  (
    'Monthly',
    '1st Monthly Exam 2025',
    2,
    '2025-02-10'
  ),
  (
    'Monthly',
    '1st Monthly Exam 2025',
    3,
    '2025-02-10'
  ),
  (
    'Quarterly',
    '1st Quarterly Exam 2025',
    5,
    '2025-03-15'
  ),
  (
    'Half-Yearly',
    'Half-Yearly Exam 2025',
    7,
    '2025-06-20'
  ),
  (
    'Half-Yearly',
    'Half-Yearly Exam 2025',
    10,
    '2025-06-20'
  ),
  ('Annual', 'Annual Exam 2024', 1, '2024-11-25'),
  ('Annual', 'Annual Exam 2024', 10, '2024-11-25'),
  ('Final', 'SSC Final Exam 2025', 10, '2025-04-01');

-- -------------------------------------------------------
-- 7. Results (FK → Students, Exams, Subjects, Classes)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Results (
    StudentID,
    ExamID,
    SubjectID,
    ClassID,
    MarksObtained
  )
VALUES
  -- Student 1 (Arif, Class 6-A) in Monthly Exam 1 (ExamID 1, ClassID 1)
  -- Subjects for Class 6-A: SubjectID 1=Bangla,2=English,3=Math,4=Science,5=Social
  (1, 1, 1, 1, 78),
  (1, 1, 2, 1, 82),
  (1, 1, 3, 1, 90),
  (1, 1, 4, 1, 75),
  (1, 1, 5, 1, 68),
  (2, 1, 1, 1, 85),
  (2, 1, 2, 1, 79),
  (2, 1, 3, 1, 88),
  (2, 1, 4, 1, 92),
  (2, 1, 5, 1, 80),
  (3, 1, 1, 1, 65),
  (3, 1, 2, 1, 70),
  (3, 1, 3, 1, 60),
  (3, 1, 4, 1, 72),
  (3, 1, 5, 1, 58),
  -- Student 7 (Sabbir, Class 7-A) in Monthly Exam 3 (ExamID 3, ClassID 3)
  -- Subjects for Class 7-A: SubjectID 11=Bangla,12=English,13=Math,14=Science,15=Social
  (7, 3, 11, 3, 88),
  (7, 3, 12, 3, 76),
  (7, 3, 13, 3, 95),
  (7, 3, 14, 3, 83),
  (8, 3, 11, 3, 72),
  (8, 3, 12, 3, 80),
  (8, 3, 13, 3, 68),
  (8, 3, 14, 3, 77),
  -- Student 16 (Nafis, Class 10-A) in Annual Exam (ExamID 8, ClassID 10)
  -- Subjects for Class 10-A: SubjectID 51=Bangla,52=English,53=Math,54=Physics,55=Chemistry,56=Biology
  (16, 8, 51, 10, 82),
  (16, 8, 52, 10, 75),
  (16, 8, 53, 10, 91),
  (16, 8, 54, 10, 78),
  (16, 8, 55, 10, 85),
  (16, 8, 56, 10, 80),
  (17, 8, 51, 10, 90),
  (17, 8, 52, 10, 88),
  (17, 8, 53, 10, 94),
  (17, 8, 54, 10, 87),
  (17, 8, 55, 10, 92),
  (17, 8, 56, 10, 89);

-- -------------------------------------------------------
-- 8. Attendance (FK → Students, Classes)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Attendance (StudentID, ClassID, ClassDate, Status)
VALUES
  (1, 1, '2025-04-06', 'Present'),
  (1, 1, '2025-04-07', 'Present'),
  (1, 1, '2025-04-08', 'Absent'),
  (2, 1, '2025-04-06', 'Present'),
  (2, 1, '2025-04-07', 'Absent'),
  (2, 1, '2025-04-08', 'Present'),
  (3, 1, '2025-04-06', 'Absent'),
  (3, 1, '2025-04-07', 'Present'),
  (3, 1, '2025-04-08', 'Present'),
  (7, 3, '2025-04-06', 'Present'),
  (7, 3, '2025-04-07', 'Present'),
  (7, 3, '2025-04-08', 'Present'),
  (8, 3, '2025-04-06', 'Present'),
  (8, 3, '2025-04-07', 'Absent'),
  (8, 3, '2025-04-08', 'Present'),
  (12, 7, '2025-04-06', 'Present'),
  (12, 7, '2025-04-07', 'Present'),
  (12, 7, '2025-04-08', 'Absent'),
  (16, 10, '2025-04-06', 'Present'),
  (16, 10, '2025-04-07', 'Present'),
  (16, 10, '2025-04-08', 'Present'),
  (17, 10, '2025-04-06', 'Absent'),
  (17, 10, '2025-04-07', 'Present'),
  (17, 10, '2025-04-08', 'Present');

-- -------------------------------------------------------
-- 9. Notices
-- -------------------------------------------------------
INSERT IGNORE INTO
  Notices (Title, Description, `Show`)
VALUES
  (
    'Annual Sports Day Notice',
    'Annual Sports Day will be held on 15 October 2025 at school playground. All students must participate.',
    TRUE
  ),
  (
    'Admission Form Available',
    'Admission forms for Class 6 (2026) are now available at the school office. Last date: 30 November 2025.',
    TRUE
  ),
  (
    'Holiday Notice',
    'School will remain closed on 21 February 2025 on the occasion of International Mother Language Day.',
    TRUE
  ),
  (
    'Exam Schedule Published',
    'Half-Yearly Examination schedule has been published. Students can collect their admit cards from the office.',
    TRUE
  ),
  (
    'Parent-Teacher Meeting',
    'A parent-teacher meeting is scheduled for 20 October 2025 at 10:00 AM in the school auditorium.',
    FALSE
  ),
  (
    'Library Renovation',
    'The school library will remain closed from 1-10 November 2025 for renovation.',
    FALSE
  );

-- -------------------------------------------------------
-- 10. Messages
-- -------------------------------------------------------
INSERT IGNORE INTO
  Messages (Messages, `Show`)
VALUES
  (
    'Welcome to Sylhet Cantonment Public School & College. We are committed to academic excellence and holistic development of every student.',
    TRUE
  ),
  (
    'Admission for the 2026 academic year is now open. Apply early to secure your place.',
    TRUE
  ),
  (
    'Congratulations to all SSC 2025 candidates. Best wishes for your examinations!',
    TRUE
  ),
  (
    'The school office is open from Saturday to Thursday, 8:00 AM to 3:00 PM.',
    FALSE
  );

-- -------------------------------------------------------
-- 11. Events
-- -------------------------------------------------------
INSERT IGNORE INTO
  Events (
    EventName,
    EventType,
    StartDate,
    EndDate,
    Venue,
    Description
  )
VALUES
  (
    'Annual Sports Day',
    'Sports',
    '2025-10-15',
    '2025-10-15',
    'School Playground',
    'Annual sports competition for all students'
  ),
  (
    'Parent Teacher Meeting',
    'Academic',
    '2025-10-20',
    '2025-10-20',
    'School Hall',
    'Monthly parent-teacher interaction meeting'
  ),
  (
    'Cultural Program 2025',
    'Cultural',
    '2025-10-25',
    '2025-10-26',
    'School Auditorium',
    'Annual cultural program with dance, music and drama'
  ),
  (
    'Science Fair 2025',
    'Academic',
    '2025-11-05',
    '2025-11-07',
    'Science Lab',
    'Student science project exhibition'
  ),
  (
    'Eid Reunion 2025',
    'Cultural',
    '2025-06-10',
    '2025-06-10',
    'School Ground',
    'Eid reunion celebration for students and alumni'
  ),
  (
    'SSC Result Celebration',
    'Academic',
    '2025-07-20',
    '2025-07-20',
    'School Hall',
    'Celebration of SSC 2025 results and prize giving'
  ),
  (
    'International Literacy Day',
    'Cultural',
    '2025-09-08',
    '2025-09-08',
    'School Auditorium',
    'Event to celebrate International Literacy Day'
  ),
  (
    'Victory Day Program',
    'Cultural',
    '2025-12-16',
    '2025-12-16',
    'School Ground',
    'Program to commemorate Bangladesh Victory Day'
  );

-- -------------------------------------------------------
-- 12. Routines (FK → Classes)
-- -------------------------------------------------------
INSERT IGNORE INTO
  Routines (
    RoutineTitle,
    ClassID,
    RoutineDate,
    Description,
    FileType,
    IsActive
  )
VALUES
  (
    'Weekly Routine - Class 6 Section A',
    1,
    '2025-01-15',
    'Weekly routine for Class 6-A with all subjects and break times',
    'pdf',
    TRUE
  ),
  (
    'Weekly Routine - Class 6 Section B',
    2,
    '2025-01-15',
    'Weekly routine for Class 6-B with all subjects and break times',
    'pdf',
    TRUE
  ),
  (
    'Daily Timetable - Class 7 Section A',
    3,
    '2025-01-15',
    'Daily timetable for Class 7-A with subject-wise schedule',
    'image',
    TRUE
  ),
  (
    'Daily Timetable - Class 7 Section B',
    4,
    '2025-01-15',
    'Daily timetable for Class 7-B with subject-wise schedule',
    'image',
    TRUE
  ),
  (
    'Final Exam Routine - Class 8 Section A',
    5,
    '2025-02-01',
    'Final exam routine for Class 8-A with exam dates and timings',
    'pdf',
    TRUE
  ),
  (
    'Science Special Schedule - Class 9-C',
    9,
    '2025-01-20',
    'Special schedule for Class 9-C Science students with lab times',
    'pdf',
    TRUE
  ),
  (
    'SSC Board Exam Routine - Class 10-A',
    10,
    '2025-03-01',
    'SSC Board examination routine with all subject exam dates',
    'pdf',
    TRUE
  );

-- -------------------------------------------------------
-- 13. Branches
-- -------------------------------------------------------
INSERT IGNORE INTO
  Branches (
    name_bn,
    name_en,
    description_bn,
    description_en,
    latitude,
    longitude,
    address_bn,
    address_en,
    is_proposed,
    established_date
  )
VALUES
  (
    'সিলেট ক্যান্টনমেন্ট পাবলিক স্কুল এন্ড কলেজ',
    'Sylhet Cantonment Public School & College',
    'সিলেট ক্যান্টনমেন্টে অবস্থিত প্রধান শাখা। এখানে ষষ্ঠ থেকে দ্বাদশ শ্রেণি পর্যন্ত শিক্ষার্থীরা পড়ালেখা করে।',
    'The main branch located in Sylhet Cantonment. Students from Class 6 to Class 12 study here.',
    24.89580000,
    91.87340000,
    'সিলেট সেনানিবাস, সিলেট',
    'Sylhet Cantonment, Sylhet',
    FALSE,
    '1971-03-26'
  ),
  (
    'জালালাবাদ ক্যান্টনমেন্ট পাবলিক স্কুল এন্ড কলেজ',
    'Jalalabad Cantonment Public School & College',
    'জালালাবাদ সেনানিবাসে অবস্থিত শাখা। শিক্ষার্থীদের জন্য উন্নত শিক্ষার সুযোগ প্রদান করে।',
    'Branch located in Jalalabad Cantonment, providing quality education to students.',
    24.92100000,
    91.86500000,
    'জালালাবাদ সেনানিবাস, সিলেট',
    'Jalalabad Cantonment, Sylhet',
    FALSE,
    '1985-01-01'
  ),
  (
    'সুনামগঞ্জ ক্যান্টনমেন্ট পাবলিক স্কুল (প্রস্তাবিত)',
    'Sunamganj Cantonment Public School (Proposed)',
    'সুনামগঞ্জ সেনানিবাসে প্রস্তাবিত নতুন শাখা যা শীঘ্রই চালু হবে।',
    'A proposed new branch in Sunamganj Cantonment, expected to open soon.',
    24.72800000,
    91.39800000,
    'সুনামগঞ্জ সেনানিবাস, সুনামগঞ্জ',
    'Sunamganj Cantonment, Sunamganj',
    TRUE,
    '2026-01-01'
  );

-- -------------------------------------------------------
-- 14. Applications
-- -------------------------------------------------------
INSERT IGNORE INTO
  Applications (
    applicant_name,
    date_of_birth,
    gender,
    applying_for_class,
    previous_school,
    previous_class,
    parent_name,
    parent_contact,
    parent_email,
    address,
    additional_info,
    status
  )
VALUES
  (
    'Mohammad Rayhan',
    '2013-05-10',
    'male',
    'Class 6',
    'Sylhet Government Primary School',
    'Class 5',
    'Abdul Karim',
    '01811000001',
    'karim@gmail.com',
    'Sylhet',
    'Good academic record',
    'pending'
  ),
  (
    'Fatima Tuj Johra',
    '2013-08-22',
    'female',
    'Class 6',
    'Osmani Nagar Primary School',
    'Class 5',
    'Nur Islam',
    '01811000002',
    'nurislam@gmail.com',
    'Sylhet',
    'Interested in arts and culture',
    'reviewed'
  ),
  (
    'Rifat Hossain',
    '2012-03-15',
    'male',
    'Class 7',
    'Moglabazar High School',
    'Class 6',
    'Jalal Ahmed',
    '01811000003',
    'jalal@gmail.com',
    'Sylhet',
    NULL,
    'accepted'
  ),
  (
    'Nusrat Jahan',
    '2011-11-30',
    'female',
    'Class 8',
    'Jalalabad Cantonment School',
    'Class 7',
    'Siraj Uddin',
    '01811000004',
    'siraj@gmail.com',
    'Sylhet',
    'Transferred from another city',
    'accepted'
  ),
  (
    'Tawhid Islam',
    '2010-07-04',
    'male',
    'Class 9',
    'Sylhet Government High School',
    'Class 8',
    'Fazlur Rahman',
    '01811000005',
    NULL,
    'Moulvibazar',
    'Science group preference',
    'pending'
  ),
  (
    'Maryam Siddiqua',
    '2009-02-18',
    'female',
    'Class 10',
    'Rose Garden School',
    'Class 9',
    'Habibur Rahman',
    '01811000006',
    'habib@gmail.com',
    'Sylhet',
    NULL,
    'rejected'
  );

-- -------------------------------------------------------
-- 15. News
-- -------------------------------------------------------
INSERT IGNORE INTO
  News (title_bn, title_en, date, link, is_active)
VALUES
  (
    'সিলেট ক্যান্টনমেন্ট পাবলিক স্কুলে নবীন বরণ অনুষ্ঠান',
    'Nobin Boron Program held in Sylhet Cantonment Public School',
    '2025-01-15',
    '/events',
    TRUE
  ),
  (
    'একাদশ শ্রেণি ভর্তি বিজ্ঞপ্তি-২০২৬',
    'Class XI Admission Notice-2026',
    '2025-07-26',
    '/events',
    TRUE
  ),
  (
    '২১ সেপ্টেম্বর ২০২৫ লিখিত পরীক্ষার প্রার্থী তালিকা',
    'Candidates list for Written Exam 21 September 2025',
    '2025-09-19',
    '/events',
    TRUE
  ),
  (
    'শিক্ষা বীমা কার্যক্রম শুরু',
    'Education Insurance Program Launched',
    '2025-08-14',
    '/events',
    TRUE
  ),
  (
    'বার্ষিক ক্রীড়া প্রতিযোগিতার ফলাফল প্রকাশিত',
    'Annual Sports Day Results Published',
    '2025-10-16',
    '/events',
    TRUE
  ),
  (
    'SSC পরীক্ষার ফলাফল ২০২৫ — অভিনন্দন',
    'SSC Exam Results 2025 — Congratulations',
    '2025-07-20',
    '/events',
    FALSE
  ),
  (
    'বিজ্ঞান মেলা ২০২৫ — আবেদন আহ্বান',
    'Science Fair 2025 — Applications Invited',
    '2025-10-01',
    '/events',
    TRUE
  );

-- -------------------------------------------------------
-- 16. Notice Announcements
-- -------------------------------------------------------
INSERT IGNORE INTO
  NoticeAnnouncements (title_bn, title_en, category, date, is_published)
VALUES
  (
    'ষষ্ঠ শ্রেণিতে ভর্তি বিজ্ঞপ্তি ২০২৬',
    'Class 6 Admission Notice 2026',
    'Admission',
    '2025-11-01',
    TRUE
  ),
  (
    'একাদশ শ্রেণিতে ভর্তি বিজ্ঞপ্তি ২০২৬',
    'Class XI Admission Notice 2026',
    'Admission',
    '2025-10-15',
    TRUE
  ),
  (
    'অর্ধ-বার্ষিক পরীক্ষার রুটিন প্রকাশিত',
    'Half-Yearly Exam Routine Published',
    'Exam',
    '2025-05-20',
    TRUE
  ),
  (
    'SSC পরীক্ষার প্রবেশপত্র বিতরণ',
    'SSC Exam Admit Card Distribution',
    'Exam',
    '2025-03-10',
    TRUE
  ),
  (
    'বার্ষিক পুরস্কার বিতরণী অনুষ্ঠান',
    'Annual Prize Giving Ceremony',
    'Event',
    '2025-12-10',
    TRUE
  ),
  (
    'বিজয় দিবস উদযাপন কার্যক্রম',
    'Victory Day Celebration Program',
    'Event',
    '2025-12-14',
    TRUE
  ),
  (
    'স্কুল বন্ধের বিজ্ঞপ্তি — ঈদুল ফিতর',
    'School Closure Notice — Eid ul-Fitr',
    'Notice',
    '2025-03-28',
    TRUE
  ),
  (
    'ডিজিটাল হাজিরা ব্যবস্থা চালু সংক্রান্ত বিজ্ঞপ্তি',
    'Notice Regarding Launch of Digital Attendance System',
    'Notice',
    '2025-09-01',
    FALSE
  );