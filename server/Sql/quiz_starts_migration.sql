-- ============================================================
-- Quiz starts (MySQL 8, safe to re-run).
-- The server remembers which questions it served for each quiz, so a quiz
-- can only be finished once, on exactly those questions, timed by the server.
-- Fresh installs already get this table from database.sql.
-- ============================================================

CREATE TABLE
    IF NOT EXISTS QuizStarts (
        -- One row per quiz a student starts: the exact questions served.
        -- Finishing scores only these, once (FinishedAt), timed by the server.
        QuizStartID BIGINT PRIMARY KEY AUTO_INCREMENT,
        StudentID INT NOT NULL,
        QuestionIDsJSON JSON NOT NULL,
        Subject VARCHAR(100) DEFAULT NULL,
        StartedAt DATETIME NOT NULL,
        FinishedAt DATETIME DEFAULT NULL,
        SessionID BIGINT DEFAULT NULL,
        INDEX idx_quiz_starts_student (StudentID),
        CONSTRAINT fk_quiz_starts_student FOREIGN KEY (StudentID) REFERENCES Students (StudentID) ON DELETE CASCADE,
        CONSTRAINT fk_quiz_starts_session FOREIGN KEY (SessionID) REFERENCES QuizSessions (SessionID) ON DELETE SET NULL
    );
