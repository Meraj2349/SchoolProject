// In-memory stand-in for the MySQL attendance repository, for use-case tests.
// It keeps the same rule as the real one: a save replaces a student's day only
// when it was taken at or after the time the stored day was taken.

export function makeFakeAttendanceRepository({ classes = [], students = [], records = [] } = {}) {
  const state = {
    classes: classes.map((c) => ({ teacherId: null, ...c })),
    students: [...students],
    records: records.map((r) => ({ ...r })),
    nextId: 1 + Math.max(0, ...records.map((r) => r.id)),
    saves: [],
  };

  const recordOf = (studentId, date) => state.records.find((r) => r.studentId === studentId && r.date === date);

  return {
    state,

    async findClass(classId) {
      return state.classes.find((c) => c.id === Number(classId)) ?? null;
    },

    async findStudent(studentId, branchId) {
      const student = state.students.find((s) => s.id === Number(studentId));
      if (!student || (branchId != null && student.branchId !== branchId)) return null;
      return student;
    },

    async roster(classId, date) {
      const cls = state.classes.find((c) => c.id === classId);
      return state.students
        .filter((s) => s.classId === classId && s.branchId === cls.branchId)
        .map((s) => {
          const record = recordOf(s.id, date);
          return {
            studentId: s.id,
            firstName: s.firstName,
            lastName: s.lastName ?? "",
            roll: s.roll ?? String(s.id),
            attendanceId: record?.id ?? null,
            status: record?.status ?? null,
            markedByType: record?.markedByType ?? null,
            markedBy: record?.markedBy ?? null,
            markedByName: record ? `${record.markedByType}#${record.markedBy}` : null,
            markedAt: record?.markedAt ?? null,
          };
        });
    },

    async saveDay({ classId, branchId, date, entries, marker, takenAt }) {
      state.saves.push({ classId, branchId, date, entries, marker, takenAt });
      for (const { studentId, status } of entries) {
        const values = { classId, branchId, status, markedByType: marker.type, markedBy: marker.id, markedAt: takenAt };
        const existing = recordOf(studentId, date);
        if (!existing) state.records.push({ id: state.nextId++, studentId, date, ...values });
        else if (existing.markedAt == null || takenAt >= existing.markedAt) Object.assign(existing, values);
      }
    },

    async findRecord(id, branchId) {
      const record = state.records.find((r) => r.id === Number(id));
      if (!record || (branchId != null && record.branchId !== branchId)) return null;
      return { ...record };
    },

    async removeRecord(id) {
      state.records = state.records.filter((r) => r.id !== id);
    },
  };
}

/** Records every absence-SMS notification instead of queueing messages. */
export function makeFakeAbsenceAlerts() {
  const calls = [];
  return {
    calls,
    async daySaved(event) {
      calls.push(event);
    },
  };
}
