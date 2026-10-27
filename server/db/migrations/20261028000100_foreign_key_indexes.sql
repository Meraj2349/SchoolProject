-- migrate:up
-- MySQL (InnoDB) indexed every foreign-key column by itself; PostgreSQL
-- never does, so the first migration left 35 foreign keys without one.
-- Without an index, deleting a parent scans the child table, and joins and
-- branch filters on the column scan too. tests/integration/pgSchema.test.js
-- fails if a foreign key is added without an index.
-- (Plain CREATE INDEX: the tables are still empty before the cutover. Once
-- they hold data, add indexes CONCURRENTLY in a transaction:false migration.)

-- The hot paths first.
-- Rosters and branch lists: a branch's students by class.
CREATE INDEX idx_students_branch_class ON "Students" (branch_id, "ClassID");
CREATE INDEX idx_students_class ON "Students" ("ClassID");
-- The teacher app's sign-in finds the teacher's classes.
CREATE INDEX idx_classes_teacher ON "Classes" ("TeacherID");
-- A student's results, and an exam's results per subject.
CREATE INDEX idx_results_student ON "Results" ("StudentID");
CREATE INDEX idx_results_exam_subject ON "Results" ("ExamID", "SubjectID");
CREATE INDEX idx_fee_invoice_items_invoice ON "FeeInvoiceItems" (invoice_id);
CREATE INDEX idx_quiz_attempts_session ON "QuizAttempts" ("SessionID");

-- The other foreign keys.
CREATE INDEX idx_teachers_branch ON "Teachers" (branch_id);
CREATE INDEX idx_classes_branch ON "Classes" (branch_id);
CREATE INDEX idx_subjects_branch ON "Subjects" (branch_id);
CREATE INDEX idx_subjects_class ON "Subjects" ("ClassID");
CREATE INDEX idx_routines_branch ON "Routines" (branch_id);
CREATE INDEX idx_attendance_branch ON "Attendance" (branch_id);
CREATE INDEX idx_exams_branch ON "Exams" (branch_id);
CREATE INDEX idx_exams_class ON "Exams" ("ClassID");
CREATE INDEX idx_results_subject ON "Results" ("SubjectID");
CREATE INDEX idx_results_branch ON "Results" (branch_id);
CREATE INDEX idx_results_class ON "Results" ("ClassID");
CREATE INDEX idx_admin_branch ON "Admin" (branch_id);
CREATE INDEX idx_notices_branch ON "Notices" (branch_id);
CREATE INDEX idx_messages_branch ON "Messages" (branch_id);
CREATE INDEX idx_images_student ON "Images" ("StudentID");
CREATE INDEX idx_images_teacher ON "Images" ("TeacherID");
CREATE INDEX idx_images_branch ON "Images" (branch_id);
CREATE INDEX idx_events_branch ON "Events" (branch_id);
CREATE INDEX idx_news_branch ON "News" (branch_id);
CREATE INDEX idx_notice_announcements_branch ON "NoticeAnnouncements" (branch_id);
CREATE INDEX idx_achievements_branch ON "Achievements" (branch_id);
CREATE INDEX idx_applications_branch ON "Applications" (branch_id);
CREATE INDEX idx_job_circulars_branch ON "JobCirculars" (branch_id);
CREATE INDEX idx_job_applications_branch ON "JobApplications" (branch_id);
CREATE INDEX idx_quiz_attempts_question ON "QuizAttempts" ("QuestionID");
CREATE INDEX idx_quiz_starts_session ON "QuizStarts" ("SessionID");
CREATE INDEX idx_fee_heads_branch ON "FeeHeads" (branch_id);
CREATE INDEX idx_student_discounts_branch ON "StudentDiscounts" (branch_id);

-- migrate:down
DROP INDEX idx_students_branch_class, idx_students_class, idx_classes_teacher, idx_results_student,
  idx_results_exam_subject, idx_fee_invoice_items_invoice, idx_quiz_attempts_session, idx_teachers_branch,
  idx_classes_branch, idx_subjects_branch, idx_subjects_class, idx_routines_branch, idx_attendance_branch,
  idx_exams_branch, idx_exams_class, idx_results_subject, idx_results_branch, idx_results_class, idx_admin_branch,
  idx_notices_branch, idx_messages_branch, idx_images_student, idx_images_teacher, idx_images_branch,
  idx_events_branch, idx_news_branch, idx_notice_announcements_branch, idx_achievements_branch,
  idx_applications_branch, idx_job_circulars_branch, idx_job_applications_branch, idx_quiz_attempts_question,
  idx_quiz_starts_session, idx_fee_heads_branch, idx_student_discounts_branch;
