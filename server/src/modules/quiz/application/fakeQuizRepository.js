// In-memory implementation of the quiz repository port for use-case tests.
export function makeFakeQuizRepository() {
  const questions = new Map();
  let nextId = 1;

  return {
    questions,
    existingSourceKeys: async (keys) => new Set([...questions.values()].map((q) => q.sourceKey).filter((k) => keys.includes(k))),
    createQuestion: async (question) => {
      const row = { id: nextId++, active: true, ...question };
      questions.set(row.id, row);
      return row;
    },
  };
}
