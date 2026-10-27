-- Data for test/integration/live_api_test.dart (run by tool/live_api_test.sh
-- on a throw-away database built by the server's migrations). The migrations
-- already add the family's branches; branch 1 gets the short name the test
-- expects.

INSERT INTO "Branches" ("id", "name_en", "name_bn") VALUES (1, 'Natiapara', 'নাটিয়াপাড়া')
  ON CONFLICT ("id") DO UPDATE SET "name_en" = EXCLUDED."name_en", "name_bn" = EXCLUDED."name_bn";
INSERT INTO "Admin" ("AdminID", "Username", "Email", "Password", "role", "branch_id")
  VALUES (1, 'office', 'office@school.test', 'x', 'branch_admin', 1);
INSERT INTO "Teachers" ("TeacherID", "FirstName", "LastName", "Subject", "branch_id")
  VALUES (7, 'Nasima', 'Akter', 'Bangla', 1), (8, 'Kamal', 'Hossain', 'Math', 1);
INSERT INTO "Classes" ("ClassID", "ClassName", "Section", "TeacherID", "branch_id")
  VALUES (10, 'Class 5', 'Good', 7, 1), (11, 'Class 6', 'Good', 8, 1);
INSERT INTO "Students" ("StudentID", "FirstName", "LastName", "RollNumber", "DateOfBirth", "Gender", "ClassID", "AdmissionDate", "ParentContact", "branch_id") VALUES
  (101, 'Rahim', 'Uddin', '1', '2015-01-01', 'Male', 10, '2024-01-01', '01711000101', 1),
  (102, 'Karim', 'Uddin', '2', '2015-01-01', 'Male', 10, '2024-01-01', '01711000102', 1),
  (103, 'Nadia', 'Akter', '3', '2015-01-01', 'Female', 10, '2024-01-01', '01711000103', 1),
  (201, 'Sabbir', 'Hasan', '1', '2014-01-01', 'Male', 11, '2024-01-01', '01711000201', 1);

-- Explicit ids leave the identities behind; move them past these rows.
SELECT setval(pg_get_serial_sequence('"Admin"', 'AdminID'), (SELECT MAX("AdminID") FROM "Admin"));
SELECT setval(pg_get_serial_sequence('"Teachers"', 'TeacherID'), (SELECT MAX("TeacherID") FROM "Teachers"));
SELECT setval(pg_get_serial_sequence('"Classes"', 'ClassID'), (SELECT MAX("ClassID") FROM "Classes"));
SELECT setval(pg_get_serial_sequence('"Students"', 'StudentID'), (SELECT MAX("StudentID") FROM "Students"));
