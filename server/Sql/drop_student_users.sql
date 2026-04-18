-- Idempotent: drop the StudentUsers table introduced by the old email/password portal.
-- QuizSessions.StudentUserID column is left in place (NULLable) to avoid touching
-- the QuizSessions schema; no new rows will write to it.
DROP TABLE IF EXISTS StudentUsers;
