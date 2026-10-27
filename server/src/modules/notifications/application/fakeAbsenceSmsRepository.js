// In-memory stand-in for the PostgreSQL absence SMS repository, for use-case tests.
// `students` are { id, name, parentPhone, statusOn: { date: status } }.

export function makeFakeAbsenceSmsRepository({ students = [] } = {}) {
  const state = { messages: [], nextId: 1, students };
  const find = (studentId, date) => state.messages.find((m) => m.studentId === studentId && m.date === date);

  return {
    state,

    async queue({ studentIds, date, branchId, dueAt }) {
      for (const studentId of studentIds) {
        const existing = find(studentId, date);
        if (!existing) state.messages.push({ id: state.nextId++, studentId, date, branchId, dueAt, status: "pending", attempts: 0 });
        else if (existing.status === "cancelled") Object.assign(existing, { status: "pending", dueAt, attempts: 0, error: null });
      }
    },

    async cancel({ studentIds, date }) {
      for (const studentId of studentIds) {
        const existing = find(studentId, date);
        if (existing?.status === "pending") existing.status = "cancelled";
      }
    },

    // Messages a test marked `stale` stand for ones left "sending" by a crash long ago.
    async failInterrupted() {
      for (const m of state.messages) if (m.status === "sending" && m.stale) Object.assign(m, { status: "failed", error: "interrupted" });
    },

    async dueIds(now, limit) {
      return state.messages
        .filter((m) => m.status === "pending" && m.dueAt <= now)
        .slice(0, limit)
        .map((m) => m.id);
    },

    async claim(id) {
      const message = state.messages.find((m) => m.id === id);
      if (message?.status !== "pending") return false;
      Object.assign(message, { status: "sending", attempts: message.attempts + 1 });
      return true;
    },

    async details(id) {
      const message = state.messages.find((m) => m.id === id);
      const student = state.students.find((s) => s.id === message.studentId);
      return {
        id,
        studentId: message.studentId,
        date: message.date,
        attempts: message.attempts,
        name: student.name,
        parentPhone: student.parentPhone,
        attendanceStatus: student.statusOn?.[message.date] ?? null,
      };
    },

    async finish(id, outcome) {
      Object.assign(state.messages.find((m) => m.id === id), outcome);
    },

    async list({ branchId, date }) {
      return state.messages.filter((m) => m.date === date && (branchId == null || m.branchId === branchId));
    },
  };
}

/** Records messages; fails the first `failures` sends. */
export function makeFakeSmsSender({ failures = 0 } = {}) {
  const sent = [];
  let toFail = failures;
  return {
    sent,
    async send({ to, text }) {
      if (toFail > 0) {
        toFail -= 1;
        throw new Error("gateway down");
      }
      sent.push({ to, text });
      return { ref: `ref-${sent.length}` };
    },
  };
}
