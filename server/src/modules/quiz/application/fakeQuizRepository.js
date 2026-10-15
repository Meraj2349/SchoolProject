// In-memory implementation of the quiz repository port for use-case tests.
// randomQuestions returns the first matches (not random) so tests are stable.
export function makeFakeQuizRepository() {
  const questions = new Map();
  const sessions = [];
  const starts = new Map();
  let nextId = 1;

  const matches = ({ classKey, subject, activeOnly }) => (q) =>
    q.classKey === classKey && (!subject || q.subject === subject) && (!activeOnly || q.active);

  return {
    questions,
    sessions,
    starts,

    existingSourceKeys: async (keys) =>
      new Set([...questions.values()].map((q) => q.sourceKey).filter((k) => keys.includes(k))),

    createQuestion: async (question) => {
      const row = { id: nextId++, active: true, sourceKey: null, ...question };
      questions.set(row.id, row);
      return { id: row.id };
    },

    findQuestion: async (id) => questions.get(Number(id)) ?? null,

    updateQuestion: async (id, changes) => questions.set(Number(id), { ...questions.get(Number(id)), ...changes }),

    listQuestions: async ({ classKey, subject, search, status, offset, pageSize }) => {
      const needle = (search ?? "").toLowerCase();
      const all = [...questions.values()].filter(
        (q) =>
          (!classKey || q.classKey === classKey) &&
          (!subject || q.subject === subject) &&
          (status === "all" || q.active === (status !== "hidden")) &&
          (!needle || `${q.prompt} ${q.promptBn ?? ""}`.toLowerCase().includes(needle)),
      );
      return { items: all.slice(offset, offset + pageSize), total: all.length };
    },

    subjectCounts: async ({ classKey, activeOnly }) => {
      const counts = new Map();
      for (const q of questions.values()) {
        if (q.classKey !== classKey || (activeOnly && !q.active)) continue;
        counts.set(q.subject, (counts.get(q.subject) ?? 0) + 1);
      }
      return [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([subject, count]) => ({ subject, count }));
    },

    randomQuestions: async ({ classKey, subject, limit }) =>
      [...questions.values()].filter(matches({ classKey, subject, activeOnly: true })).slice(0, limit),

    questionsByIds: async (ids) => ids.map((id) => questions.get(id)).filter(Boolean),

    createStart: async ({ studentId, questionIds, subject, startedAt }) => {
      const id = starts.size + 1;
      starts.set(id, { id, studentId, questionIds, subject, startedAt, finishedAt: null });
      return { id };
    },

    findStart: async (id) => starts.get(Number(id)) ?? null,

    // Claims the quiz and saves the session together; null if already finished.
    saveSession: async (session, graded) => {
      const start = starts.get(session.quizId);
      if (!start || start.finishedAt) return null;
      start.finishedAt = session.completedAt;
      const row = { id: sessions.length + 1, ...session, graded };
      sessions.push(row);
      return row.id;
    },
  };
}
