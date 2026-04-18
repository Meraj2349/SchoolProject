import {
  getQuizMeta,
  pickRandomQuestions,
  getQuestionsByIds,
  createQuizSession,
  bulkInsertAttempts,
  getSessionsByStudentId,
  getStudentProgressByStudentId,
  getAllSessions,
  getLeaderboard,
} from "../models/quiz.model.js";
import {
  verifyStudentIdentity,
  generateQuizToken,
} from "../models/quizStudent.model.js";

// Public meta
export const getMetaController = async (req, res) => {
  try {
    const meta = await getQuizMeta();
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz meta" });
  }
};

// Public — verify identity and issue a 30-min quiz JWT
export const verifyStudentController = async (req, res) => {
  try {
    const { branchId, firstName, lastName, className, section, rollNumber } =
      req.body;

    if (!branchId || !firstName || !lastName || !className || !section || !rollNumber) {
      return res.status(400).json({ error: "All identity fields are required" });
    }

    const student = await verifyStudentIdentity({
      branchId: parseInt(branchId, 10),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      className: className.trim(),
      section: section.trim(),
      rollNumber: rollNumber.trim(),
    });

    if (!student) {
      return res.status(401).json({ error: "Student not found. Please check your details." });
    }

    const token = generateQuizToken(student.studentId, student.branchId);

    res.json({ token, student });
  } catch (err) {
    console.error("verifyStudentController error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};

// Start a new quiz: return N questions (without correct answers).
// Progressively relaxes filters (difficulty → grade → subject) so a student
// never hits a dead end when their exact combination has no questions.
export const startController = async (req, res) => {
  try {
    const { subject, grade, difficulty, numQuestions } = req.body;
    const limit = Math.min(Math.max(parseInt(numQuestions, 10) || 10, 1), 50);

    const attempts = [
      { subject, grade, difficulty, relaxed: null },
      { subject, grade, difficulty: "all", relaxed: "difficulty" },
      { subject, grade: "all", difficulty: "all", relaxed: "grade+difficulty" },
      { subject: "all", grade: "all", difficulty: "all", relaxed: "all" },
    ];

    let questions = [];
    let relaxed = null;
    for (const filters of attempts) {
      questions = await pickRandomQuestions({ ...filters, limit });
      if (questions.length > 0) {
        relaxed = filters.relaxed;
        break;
      }
    }

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ error: "No quiz questions available in the database yet" });
    }

    const safeQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      subject: q.subject,
      grade: q.grade,
      difficulty: q.difficulty,
    }));

    res.json({
      questions: safeQuestions,
      totalQuestions: safeQuestions.length,
      subject: subject || "all",
      grade: grade || "all",
      relaxed,
      startedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("startController error:", err);
    res.status(500).json({ error: "Failed to start quiz" });
  }
};

// Finish quiz — receives all answers, scores server-side, saves a session.
export const finishController = async (req, res) => {
  try {
    const { subject, grade, answers, timeTakenSeconds, studentName, className, section } =
      req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers array required" });
    }

    const questionIds = answers
      .map((a) => parseInt(a.questionId, 10))
      .filter((n) => Number.isFinite(n));

    const questions = await getQuestionsByIds(questionIds);
    const qMap = new Map(questions.map((q) => [q.id, q]));

    const graded = answers.map((a) => {
      const q = qMap.get(parseInt(a.questionId, 10));
      const correct = q?.correct_answer ?? "";
      const user = (a.userAnswer ?? "").toString().toUpperCase().slice(0, 1);
      return {
        questionId: parseInt(a.questionId, 10),
        userAnswer: user,
        correctAnswer: correct,
        isCorrect: user === correct,
        timeSpentSeconds: a.timeSpentSeconds ?? null,
      };
    });

    const correctCount = graded.filter((g) => g.isCorrect).length;
    const total = graded.length;
    const scorePct = total > 0 ? Math.round((correctCount / total) * 10000) / 100 : 0;

    const sessionId = await createQuizSession({
      studentId: req.quizStudentId,
      studentName: studentName || "Student",
      className: className || null,
      section: section || null,
      subject: subject || null,
      grade: grade || null,
      totalQuestions: total,
      correctAnswers: correctCount,
      scorePercentage: scorePct,
      timeTakenSeconds: Math.max(0, parseInt(timeTakenSeconds, 10) || 0),
      branchId: req.quizBranchId ?? null,
      completedAt: new Date(),
    });

    await bulkInsertAttempts(sessionId, graded);

    res.status(201).json({
      sessionId,
      totalQuestions: total,
      correctAnswers: correctCount,
      scorePercentage: scorePct,
      grade:
        scorePct >= 90
          ? "A"
          : scorePct >= 80
            ? "B"
            : scorePct >= 70
              ? "C"
              : scorePct >= 60
                ? "D"
                : "F",
      details: graded,
    });
  } catch (err) {
    console.error("finishController error:", err);
    res.status(500).json({ error: "Failed to save quiz" });
  }
};

export const mySessionsController = async (req, res) => {
  try {
    const sessions = await getSessionsByStudentId(req.quizStudentId);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const myProgressController = async (req, res) => {
  try {
    const progress = await getStudentProgressByStudentId(req.quizStudentId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

// Admin-only — list all sessions (branch-scoped).
export const adminSessionsController = async (req, res) => {
  try {
    const branchId = req.branchId ?? null;
    const { limit = 200, offset = 0 } = req.query;
    const sessions = await getAllSessions(branchId, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const adminLeaderboardController = async (req, res) => {
  try {
    const branchId = req.branchId ?? null;
    const { limit = 20 } = req.query;
    const board = await getLeaderboard(branchId, parseInt(limit, 10));
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
