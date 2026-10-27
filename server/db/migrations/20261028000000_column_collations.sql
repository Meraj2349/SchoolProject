-- migrate:up
-- One collation per kind of text, instead of the case- and accent-blind ci on
-- every column (docs/postgres-migration.md, "Collations"):
--   "C" (exact) for statuses, kinds, codes, ids, phone numbers, links and
--   password hashes: a status CHECK refuses 'PRESENT' again, as MySQL's ENUM
--   did, and Cloudinary ids that differ only in case stay different.
--   ci2 (ICU level 2: case-insensitive, accent- and letter-sensitive) for
--   names, titles, emails and free text: 'karim' finds 'Karim', but য় and য,
--   ড় and ড stay different letters (level 1 treated them as the same).
-- 51 columns become exact, 86 level 2. Indexes on them are rebuilt.

CREATE COLLATION ci2 (provider = icu, locale = 'und-u-ks-level2', deterministic = false);

ALTER TABLE "Branches"
  ALTER COLUMN "name_bn" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "name_en" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "description_bn" TYPE text COLLATE ci2,
  ALTER COLUMN "description_en" TYPE text COLLATE ci2,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE "C",
  ALTER COLUMN "image_public_id" TYPE varchar(255) COLLATE "C",
  ALTER COLUMN "address_bn" TYPE varchar(500) COLLATE ci2,
  ALTER COLUMN "address_en" TYPE varchar(500) COLLATE ci2;

ALTER TABLE "Teachers"
  ALTER COLUMN "FirstName" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "LastName" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "Subject" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "ContactNumber" TYPE varchar(15) COLLATE "C",
  ALTER COLUMN "Email" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "Address" TYPE text COLLATE ci2,
  ALTER COLUMN "AppPhone" TYPE char(11) COLLATE "C",
  ALTER COLUMN "AppPasswordHash" TYPE varchar(100) COLLATE "C";

ALTER TABLE "Classes"
  ALTER COLUMN "ClassName" TYPE varchar(20) COLLATE ci2,
  ALTER COLUMN "Section" TYPE varchar(10) COLLATE ci2;

ALTER TABLE "Students"
  ALTER COLUMN "FirstName" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "LastName" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "RollNumber" TYPE varchar(20) COLLATE ci2,
  ALTER COLUMN "Gender" TYPE varchar(6) COLLATE "C",
  ALTER COLUMN "Address" TYPE text COLLATE ci2,
  ALTER COLUMN "ParentContact" TYPE varchar(15) COLLATE "C";

ALTER TABLE "Subjects"
  ALTER COLUMN "SubjectName" TYPE varchar(50) COLLATE ci2;

ALTER TABLE "Routines"
  ALTER COLUMN "RoutineTitle" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "Description" TYPE text COLLATE ci2,
  ALTER COLUMN "FileURL" TYPE varchar(500) COLLATE "C",
  ALTER COLUMN "FileType" TYPE varchar(5) COLLATE "C",
  ALTER COLUMN "FilePublicID" TYPE varchar(255) COLLATE "C";

ALTER TABLE "Attendance"
  ALTER COLUMN "Status" TYPE varchar(7) COLLATE "C",
  ALTER COLUMN "MarkedByType" TYPE varchar(7) COLLATE "C";

ALTER TABLE "Exams"
  ALTER COLUMN "ExamType" TYPE varchar(11) COLLATE "C",
  ALTER COLUMN "ExamName" TYPE varchar(50) COLLATE ci2;

ALTER TABLE "Admin"
  ALTER COLUMN "Username" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "Email" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "Password" TYPE varchar(255) COLLATE "C",
  ALTER COLUMN "Language" TYPE varchar(2) COLLATE "C",
  ALTER COLUMN "role" TYPE varchar(12) COLLATE "C";

ALTER TABLE "Notices"
  ALTER COLUMN "Title" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "Description" TYPE text COLLATE ci2;

ALTER TABLE "Messages"
  ALTER COLUMN "Messages" TYPE text COLLATE ci2;

ALTER TABLE "Images"
  ALTER COLUMN "ImagePath" TYPE varchar(255) COLLATE "C",
  ALTER COLUMN "PublicID" TYPE varchar(255) COLLATE "C",
  ALTER COLUMN "Description" TYPE text COLLATE ci2,
  ALTER COLUMN "ImageType" TYPE varchar(7) COLLATE "C";

ALTER TABLE "Events"
  ALTER COLUMN "EventName" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "EventType" TYPE varchar(8) COLLATE "C",
  ALTER COLUMN "Venue" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "Description" TYPE text COLLATE ci2;

ALTER TABLE "News"
  ALTER COLUMN "title_bn" TYPE varchar(500) COLLATE ci2,
  ALTER COLUMN "title_en" TYPE varchar(500) COLLATE ci2,
  ALTER COLUMN "link" TYPE varchar(500) COLLATE "C";

ALTER TABLE "NoticeAnnouncements"
  ALTER COLUMN "title_bn" TYPE varchar(500) COLLATE ci2,
  ALTER COLUMN "title_en" TYPE varchar(500) COLLATE ci2,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE "C",
  ALTER COLUMN "category" TYPE varchar(9) COLLATE "C";

ALTER TABLE "Achievements"
  ALTER COLUMN "title_en" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "title_bn" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "description_en" TYPE text COLLATE ci2,
  ALTER COLUMN "description_bn" TYPE text COLLATE ci2,
  ALTER COLUMN "category" TYPE varchar(12) COLLATE "C",
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE "C",
  ALTER COLUMN "exam_name" TYPE varchar(30) COLLATE ci2;

ALTER TABLE "ChairmanProfile"
  ALTER COLUMN "name_en" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "name_bn" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "title_en" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "title_bn" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "institution_en" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "institution_bn" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE "C",
  ALTER COLUMN "image_public_id" TYPE varchar(255) COLLATE "C";

ALTER TABLE "ClassNames"
  ALTER COLUMN "name" TYPE varchar(50) COLLATE ci2;

ALTER TABLE "Applications"
  ALTER COLUMN "applicant_name" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "gender" TYPE varchar(6) COLLATE "C",
  ALTER COLUMN "applying_for_class" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "previous_school" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "previous_class" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "parent_name" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "parent_contact" TYPE varchar(20) COLLATE "C",
  ALTER COLUMN "parent_email" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "address" TYPE text COLLATE ci2,
  ALTER COLUMN "additional_info" TYPE text COLLATE ci2,
  ALTER COLUMN "status" TYPE varchar(8) COLLATE "C";

ALTER TABLE "JobCirculars"
  ALTER COLUMN "title_en" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "title_bn" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "how_to_apply_en" TYPE text COLLATE ci2,
  ALTER COLUMN "how_to_apply_bn" TYPE text COLLATE ci2,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE "C";

ALTER TABLE "JobApplications"
  ALTER COLUMN "post_title_en" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "post_title_bn" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "full_name" TYPE varchar(150) COLLATE ci2,
  ALTER COLUMN "phone" TYPE char(11) COLLATE "C",
  ALTER COLUMN "email" TYPE varchar(150) COLLATE ci2,
  ALTER COLUMN "address" TYPE text COLLATE ci2,
  ALTER COLUMN "education" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "experience" TYPE text COLLATE ci2,
  ALTER COLUMN "cv_file" TYPE varchar(255) COLLATE "C",
  ALTER COLUMN "status" TYPE varchar(11) COLLATE "C";

ALTER TABLE "QuizQuestions"
  ALTER COLUMN "SourceKey" TYPE varchar(120) COLLATE "C",
  ALTER COLUMN "ClassKey" TYPE varchar(20) COLLATE "C",
  ALTER COLUMN "Prompt" TYPE text COLLATE ci2,
  ALTER COLUMN "PromptBn" TYPE text COLLATE ci2,
  ALTER COLUMN "CorrectAnswer" TYPE char(1) COLLATE "C",
  ALTER COLUMN "Subject" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "Grade" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "Difficulty" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "SourceFile" TYPE varchar(255) COLLATE "C",
  ALTER COLUMN "Language" TYPE varchar(20) COLLATE "C";

ALTER TABLE "QuizSessions"
  ALTER COLUMN "StudentName" TYPE varchar(120) COLLATE ci2,
  ALTER COLUMN "ClassName" TYPE varchar(50) COLLATE ci2,
  ALTER COLUMN "Section" TYPE varchar(20) COLLATE ci2,
  ALTER COLUMN "Subject" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "Grade" TYPE varchar(50) COLLATE ci2;

ALTER TABLE "QuizAttempts"
  ALTER COLUMN "UserAnswer" TYPE char(1) COLLATE "C",
  ALTER COLUMN "CorrectAnswer" TYPE char(1) COLLATE "C";

ALTER TABLE "QuizStarts"
  ALTER COLUMN "Subject" TYPE varchar(100) COLLATE ci2;

ALTER TABLE "FeeSettings"
  ALTER COLUMN "receipt_prefix" TYPE varchar(10) COLLATE "C";

ALTER TABLE "FeeStructures"
  ALTER COLUMN "class_name" TYPE varchar(20) COLLATE ci2;

ALTER TABLE "FeeHeads"
  ALTER COLUMN "name_en" TYPE varchar(100) COLLATE ci2,
  ALTER COLUMN "name_bn" TYPE varchar(100) COLLATE ci2;

ALTER TABLE "StudentDiscounts"
  ALTER COLUMN "kind" TYPE varchar(7) COLLATE "C",
  ALTER COLUMN "applies_to" TYPE varchar(7) COLLATE "C",
  ALTER COLUMN "reason" TYPE varchar(255) COLLATE ci2;

ALTER TABLE "FeeInvoices"
  ALTER COLUMN "class_name" TYPE varchar(20) COLLATE ci2,
  ALTER COLUMN "section" TYPE varchar(10) COLLATE ci2,
  ALTER COLUMN "status" TYPE varchar(7) COLLATE "C";

ALTER TABLE "FeeInvoiceItems"
  ALTER COLUMN "kind" TYPE varchar(9) COLLATE "C",
  ALTER COLUMN "label" TYPE varchar(150) COLLATE ci2;

ALTER TABLE "FeePayments"
  ALTER COLUMN "method" TYPE varchar(5) COLLATE "C",
  ALTER COLUMN "receipt_no" TYPE varchar(30) COLLATE "C",
  ALTER COLUMN "note" TYPE varchar(255) COLLATE ci2,
  ALTER COLUMN "void_reason" TYPE varchar(255) COLLATE ci2;

ALTER TABLE "AttendanceSms"
  ALTER COLUMN "phone" TYPE varchar(20) COLLATE "C",
  ALTER COLUMN "status" TYPE varchar(9) COLLATE "C",
  ALTER COLUMN "provider_ref" TYPE varchar(100) COLLATE "C",
  ALTER COLUMN "error" TYPE varchar(255) COLLATE ci2;

DROP COLLATION ci;

-- migrate:down
CREATE COLLATION ci (provider = icu, locale = 'und-u-ks-level1', deterministic = false);

ALTER TABLE "Branches"
  ALTER COLUMN "name_bn" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "name_en" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "description_bn" TYPE text COLLATE ci,
  ALTER COLUMN "description_en" TYPE text COLLATE ci,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "image_public_id" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "address_bn" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "address_en" TYPE varchar(500) COLLATE ci;

ALTER TABLE "Teachers"
  ALTER COLUMN "FirstName" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "LastName" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "Subject" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "ContactNumber" TYPE varchar(15) COLLATE ci,
  ALTER COLUMN "Email" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "Address" TYPE text COLLATE ci,
  ALTER COLUMN "AppPhone" TYPE char(11) COLLATE ci,
  ALTER COLUMN "AppPasswordHash" TYPE varchar(100) COLLATE ci;

ALTER TABLE "Classes"
  ALTER COLUMN "ClassName" TYPE varchar(20) COLLATE ci,
  ALTER COLUMN "Section" TYPE varchar(10) COLLATE ci;

ALTER TABLE "Students"
  ALTER COLUMN "FirstName" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "LastName" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "RollNumber" TYPE varchar(20) COLLATE ci,
  ALTER COLUMN "Gender" TYPE varchar(6) COLLATE ci,
  ALTER COLUMN "Address" TYPE text COLLATE ci,
  ALTER COLUMN "ParentContact" TYPE varchar(15) COLLATE ci;

ALTER TABLE "Subjects"
  ALTER COLUMN "SubjectName" TYPE varchar(50) COLLATE ci;

ALTER TABLE "Routines"
  ALTER COLUMN "RoutineTitle" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "Description" TYPE text COLLATE ci,
  ALTER COLUMN "FileURL" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "FileType" TYPE varchar(5) COLLATE ci,
  ALTER COLUMN "FilePublicID" TYPE varchar(255) COLLATE ci;

ALTER TABLE "Attendance"
  ALTER COLUMN "Status" TYPE varchar(7) COLLATE ci,
  ALTER COLUMN "MarkedByType" TYPE varchar(7) COLLATE ci;

ALTER TABLE "Exams"
  ALTER COLUMN "ExamType" TYPE varchar(11) COLLATE ci,
  ALTER COLUMN "ExamName" TYPE varchar(50) COLLATE ci;

ALTER TABLE "Admin"
  ALTER COLUMN "Username" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "Email" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "Password" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "Language" TYPE varchar(2) COLLATE ci,
  ALTER COLUMN "role" TYPE varchar(12) COLLATE ci;

ALTER TABLE "Notices"
  ALTER COLUMN "Title" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "Description" TYPE text COLLATE ci;

ALTER TABLE "Messages"
  ALTER COLUMN "Messages" TYPE text COLLATE ci;

ALTER TABLE "Images"
  ALTER COLUMN "ImagePath" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "PublicID" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "Description" TYPE text COLLATE ci,
  ALTER COLUMN "ImageType" TYPE varchar(7) COLLATE ci;

ALTER TABLE "Events"
  ALTER COLUMN "EventName" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "EventType" TYPE varchar(8) COLLATE ci,
  ALTER COLUMN "Venue" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "Description" TYPE text COLLATE ci;

ALTER TABLE "News"
  ALTER COLUMN "title_bn" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "title_en" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "link" TYPE varchar(500) COLLATE ci;

ALTER TABLE "NoticeAnnouncements"
  ALTER COLUMN "title_bn" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "title_en" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "category" TYPE varchar(9) COLLATE ci;

ALTER TABLE "Achievements"
  ALTER COLUMN "title_en" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "title_bn" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "description_en" TYPE text COLLATE ci,
  ALTER COLUMN "description_bn" TYPE text COLLATE ci,
  ALTER COLUMN "category" TYPE varchar(12) COLLATE ci,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "exam_name" TYPE varchar(30) COLLATE ci;

ALTER TABLE "ChairmanProfile"
  ALTER COLUMN "name_en" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "name_bn" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "title_en" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "title_bn" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "institution_en" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "institution_bn" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE ci,
  ALTER COLUMN "image_public_id" TYPE varchar(255) COLLATE ci;

ALTER TABLE "ClassNames"
  ALTER COLUMN "name" TYPE varchar(50) COLLATE ci;

ALTER TABLE "Applications"
  ALTER COLUMN "applicant_name" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "gender" TYPE varchar(6) COLLATE ci,
  ALTER COLUMN "applying_for_class" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "previous_school" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "previous_class" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "parent_name" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "parent_contact" TYPE varchar(20) COLLATE ci,
  ALTER COLUMN "parent_email" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "address" TYPE text COLLATE ci,
  ALTER COLUMN "additional_info" TYPE text COLLATE ci,
  ALTER COLUMN "status" TYPE varchar(8) COLLATE ci;

ALTER TABLE "JobCirculars"
  ALTER COLUMN "title_en" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "title_bn" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "how_to_apply_en" TYPE text COLLATE ci,
  ALTER COLUMN "how_to_apply_bn" TYPE text COLLATE ci,
  ALTER COLUMN "image_url" TYPE varchar(500) COLLATE ci;

ALTER TABLE "JobApplications"
  ALTER COLUMN "post_title_en" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "post_title_bn" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "full_name" TYPE varchar(150) COLLATE ci,
  ALTER COLUMN "phone" TYPE char(11) COLLATE ci,
  ALTER COLUMN "email" TYPE varchar(150) COLLATE ci,
  ALTER COLUMN "address" TYPE text COLLATE ci,
  ALTER COLUMN "education" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "experience" TYPE text COLLATE ci,
  ALTER COLUMN "cv_file" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "status" TYPE varchar(11) COLLATE ci;

ALTER TABLE "QuizQuestions"
  ALTER COLUMN "SourceKey" TYPE varchar(120) COLLATE ci,
  ALTER COLUMN "ClassKey" TYPE varchar(20) COLLATE ci,
  ALTER COLUMN "Prompt" TYPE text COLLATE ci,
  ALTER COLUMN "PromptBn" TYPE text COLLATE ci,
  ALTER COLUMN "CorrectAnswer" TYPE char(1) COLLATE ci,
  ALTER COLUMN "Subject" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "Grade" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "Difficulty" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "SourceFile" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "Language" TYPE varchar(20) COLLATE ci;

ALTER TABLE "QuizSessions"
  ALTER COLUMN "StudentName" TYPE varchar(120) COLLATE ci,
  ALTER COLUMN "ClassName" TYPE varchar(50) COLLATE ci,
  ALTER COLUMN "Section" TYPE varchar(20) COLLATE ci,
  ALTER COLUMN "Subject" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "Grade" TYPE varchar(50) COLLATE ci;

ALTER TABLE "QuizAttempts"
  ALTER COLUMN "UserAnswer" TYPE char(1) COLLATE ci,
  ALTER COLUMN "CorrectAnswer" TYPE char(1) COLLATE ci;

ALTER TABLE "QuizStarts"
  ALTER COLUMN "Subject" TYPE varchar(100) COLLATE ci;

ALTER TABLE "FeeSettings"
  ALTER COLUMN "receipt_prefix" TYPE varchar(10) COLLATE ci;

ALTER TABLE "FeeStructures"
  ALTER COLUMN "class_name" TYPE varchar(20) COLLATE ci;

ALTER TABLE "FeeHeads"
  ALTER COLUMN "name_en" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "name_bn" TYPE varchar(100) COLLATE ci;

ALTER TABLE "StudentDiscounts"
  ALTER COLUMN "kind" TYPE varchar(7) COLLATE ci,
  ALTER COLUMN "applies_to" TYPE varchar(7) COLLATE ci,
  ALTER COLUMN "reason" TYPE varchar(255) COLLATE ci;

ALTER TABLE "FeeInvoices"
  ALTER COLUMN "class_name" TYPE varchar(20) COLLATE ci,
  ALTER COLUMN "section" TYPE varchar(10) COLLATE ci,
  ALTER COLUMN "status" TYPE varchar(7) COLLATE ci;

ALTER TABLE "FeeInvoiceItems"
  ALTER COLUMN "kind" TYPE varchar(9) COLLATE ci,
  ALTER COLUMN "label" TYPE varchar(150) COLLATE ci;

ALTER TABLE "FeePayments"
  ALTER COLUMN "method" TYPE varchar(5) COLLATE ci,
  ALTER COLUMN "receipt_no" TYPE varchar(30) COLLATE ci,
  ALTER COLUMN "note" TYPE varchar(255) COLLATE ci,
  ALTER COLUMN "void_reason" TYPE varchar(255) COLLATE ci;

ALTER TABLE "AttendanceSms"
  ALTER COLUMN "phone" TYPE varchar(20) COLLATE ci,
  ALTER COLUMN "status" TYPE varchar(9) COLLATE ci,
  ALTER COLUMN "provider_ref" TYPE varchar(100) COLLATE ci,
  ALTER COLUMN "error" TYPE varchar(255) COLLATE ci;

DROP COLLATION ci2;
