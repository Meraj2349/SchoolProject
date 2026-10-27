// In-memory stand-in for the PostgreSQL attendance repository, for use-case tests.
// It keeps the same rule as the real one: a save replaces a student's day only
// when it was taken at or after the time the stored day was taken.

// `teachers` hold the class teachers' app sign-in: { id, firstName, lastName,
// appEnabled, appPhone, appPasswordHash }.
export function makeFakeAttendanceRepository({ branches = [], teachers = [], classes = [], students = [], records = [] } = {}) {
  const state = {
    branches: [...branches],
    teachers: [...teachers],
    classes: classes.map((c) => ({ teacherId: null, ...c })),
    students: [...students],
    records: records.map((r) => ({ ...r })),
    nextId: 1 + Math.max(0, ...records.map((r) => r.id)),
    saves: [],
  };

  const recordOf = (studentId, date) => state.records.find((r) => r.studentId === studentId && r.date === date);

  const branchOf = (id) => state.branches.find((b) => b.id === id) ?? null;

  const inScope = (id, branchId) => branchId == null || id === branchId;

  const classesInScope = (branchId) =>
    state.classes.filter((c) => inScope(c.branchId, branchId)).sort((a, b) => a.branchId - b.branchId);

  // The class's students of the class's own branch, as the PostgreSQL roster joins them.
  const studentsOf = (cls) => state.students.filter((s) => s.classId === cls.id && s.branchId === cls.branchId);

  const markerNameOf = (record) => `${record.markedByType}#${record.markedBy}`;

  function classTeacherOf(teacherId) {
    const teacher = state.teachers.find((t) => t.id === teacherId);
    if (!teacher) return null;
    const appAccess = Boolean(teacher.appEnabled) && teacher.appPhone != null && teacher.appPasswordHash != null;
    return { id: teacher.id, name: [teacher.firstName, teacher.lastName].filter(Boolean).join(" "), appAccess };
  }

  return {
    state,

    async findClass(classId) {
      const cls = state.classes.find((c) => c.id === Number(classId));
      return cls ? { ...cls, branch: branchOf(cls.branchId), classTeacher: classTeacherOf(cls.teacherId) } : null;
    },

    async findStudent(studentId, branchId) {
      const student = state.students.find((s) => s.id === Number(studentId));
      if (!student || (branchId != null && student.branchId !== branchId)) return null;
      return student;
    },

    async roster(classId, date) {
      return studentsOf(state.classes.find((c) => c.id === classId)).map((s) => {
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
          markedByName: record ? markerNameOf(record) : null,
          markedAt: record?.markedAt ?? null,
        };
      });
    },

    async branchesIn(branchId) {
      return state.branches
        .filter((b) => inScope(b.id, branchId))
        .sort((a, b) => a.id - b.id)
        .map((b) => ({ ...b }));
    },

    async classesIn(branchId) {
      return classesInScope(branchId).map((c) => ({
        id: c.id,
        name: c.name,
        section: c.section,
        branchId: c.branchId,
        students: studentsOf(c).length,
        classTeacher: classTeacherOf(c.teacherId),
      }));
    },

    /** The day's counts and latest mark of each class in scope that has any. */
    async classDays({ branchId, date }) {
      return classesInScope(branchId)
        .map((c) => ({ classId: c.id, records: studentsOf(c).map((s) => recordOf(s.id, date)).filter(Boolean) }))
        .filter(({ records }) => records.length > 0)
        .map(({ classId, records }) => {
          const latest = records.reduce((last, r) => (r.markedAt > last.markedAt ? r : last));
          const counted = (status) => records.filter((r) => r.status === status).length;
          return {
            classId,
            present: counted("Present"),
            absent: counted("Absent"),
            late: counted("Late"),
            leave: counted("Leave"),
            takenBy: { type: latest.markedByType, name: markerNameOf(latest), at: latest.markedAt },
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
