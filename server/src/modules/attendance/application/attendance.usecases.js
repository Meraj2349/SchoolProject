import { ForbiddenError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { schoolToday } from "../../../shared/schoolDate.js";
import { adminTakenAt, parseDay, parseStatus, teacherTakenAt, toDayEntries } from "../domain/attendance.js";

/**
 * Taking and correcting class attendance.
 *
 * `actor` is who is acting:
 *   { kind: "admin", id, role, branchId }  branchId: a branch admin's own branch,
 *                                         or the branch a super admin picked (null = all)
 *   { kind: "teacher", id, branchId }     a class teacher signed in to the app
 * A super admin works in every branch, a branch admin in their own, and a
 * teacher only on the classes they are the class teacher of.
 *
 * @param {object} deps
 * @param {object} deps.repository     see fakeAttendanceRepository.js for the port
 * @param {object} deps.absenceAlerts  { daySaved({ branchId, date, now, students }) }: today's
 *                                     statuses after a save, so absent students' parents get an SMS
 * @param {{ now: () => Date }} deps.clock
 */
export function makeAttendanceUseCases({ repository, absenceAlerts, clock }) {
  const isSuperAdmin = (actor) => actor.kind === "admin" && actor.role === "super_admin";

  /** Branch to scope lookups by: null for a super admin (any branch). */
  const scopeOf = (actor) => (isSuperAdmin(actor) ? null : actor.branchId);

  async function classFor(actor, classId) {
    const cls = await repository.findClass(Number(classId));
    const scope = scopeOf(actor);
    if (!cls || (scope != null && cls.branchId !== scope)) throw new NotFoundError("attendance_class_not_found");
    if (actor.kind === "teacher" && cls.teacherId !== actor.id) throw new ForbiddenError("attendance_not_your_class");
    return cls;
  }

  const takenAtFor = (actor, date, takenAt, now) =>
    actor.kind === "teacher" ? teacherTakenAt({ date, takenAt, now }) : adminTakenAt({ date, now });

  const isEditable = (actor, date, now) => {
    const today = schoolToday(now);
    return actor.kind === "teacher" ? date === today : date <= today;
  };

  /** Whoever took the day last, from the student rows of one class and day. */
  function takenByOf(students) {
    const latest = students
      .filter((s) => s.markedAt != null)
      .reduce((last, s) => (last == null || s.markedAt > last.markedAt ? s : last), null);
    return latest && { type: latest.markedByType, id: latest.markedBy, name: latest.markedByName, at: latest.markedAt };
  }

  const dayView = (actor, cls, date, students, now) => ({
    class: { id: cls.id, name: cls.name, section: cls.section, branchId: cls.branchId },
    date,
    students,
    takenBy: takenByOf(students),
    editable: isEditable(actor, date, now),
  });

  /**
   * A phone may send an earlier day only once: while nobody has marked it yet,
   * or as the very same save again (its reply was lost). Otherwise a teacher
   * could keep rewriting yesterday with a made-up "taken at" time.
   */
  const isFirstSyncOf = (roster, actor, takenAt) =>
    roster
      .filter((s) => s.markedAt != null)
      .every((s) => s.markedByType === "teacher" && s.markedBy === actor.id && new Date(s.markedAt).getTime() === takenAt.getTime());

  const keepStudentsOf = (entries, rosterIds) =>
    Array.isArray(entries) ? entries.filter((e) => rosterIds.includes(Number(e?.studentId))) : entries;

  /**
   * Checks a save without writing anything, so a batch of days can be checked
   * as a whole before any of it is saved.
   */
  async function prepareDay({ actor, classId, date, entries, takenAt, complete }) {
    const day = parseDay(date);
    const cls = await classFor(actor, classId);
    const now = clock.now();
    const taken = takenAtFor(actor, day, takenAt, now);
    const roster = await repository.roster(cls.id, day);
    const rosterIds = roster.map((s) => s.studentId);
    const catchUp = actor.kind === "teacher" && day < schoolToday(now);
    if (catchUp && !isFirstSyncOf(roster, actor, taken)) throw new ForbiddenError("attendance_day_locked");
    // A day taken offline is saved even if the class changed before it synced:
    // students who joined since are left unmarked, students who left are dropped.
    const dayEntries = catchUp
      ? toDayEntries(keepStudentsOf(entries, rosterIds), rosterIds, { complete: false })
      : toDayEntries(entries, rosterIds, { complete });
    return { actor, cls, date: day, entries: dayEntries, takenAt: taken, now };
  }

  async function notifyAlerts({ branchId, date, now, students }) {
    if (date !== schoolToday(now) || students.length === 0) return;
    await absenceAlerts.daySaved({ branchId, date, now, students });
  }

  async function commitDay({ actor, cls, date, entries, takenAt, now }) {
    await repository.saveDay({
      classId: cls.id,
      branchId: cls.branchId,
      date,
      entries,
      marker: { type: actor.kind, id: actor.id },
      takenAt,
    });
    const students = await repository.roster(cls.id, date);
    const saved = new Map(students.map((s) => [s.studentId, s]));
    // A day taken later (an admin's correction) is kept over an older save.
    const kept = entries.filter((e) => saved.get(e.studentId)?.status !== e.status).map((e) => e.studentId);
    await notifyAlerts({
      branchId: cls.branchId,
      date,
      now,
      students: entries.map(({ studentId }) => ({ studentId, status: saved.get(studentId)?.status ?? null })),
    });
    return { ...dayView(actor, cls, date, students, now), kept };
  }

  const saveDay = async ({ actor, classId, date, entries, takenAt, complete = true }) =>
    commitDay(await prepareDay({ actor, classId, date, entries, takenAt, complete }));

  /** One student's mark for one day, from a whole-day result. */
  const markOf = (day, studentId) => {
    const student = day.students.find((s) => s.studentId === studentId);
    return { studentId, date: day.date, status: student.status, attendanceId: student.attendanceId };
  };

  return {
    /** The class's students and their status on `date` (default today); null before it is taken. */
    async getRoster({ actor, classId, date }) {
      const now = clock.now();
      const day = date == null || date === "" ? schoolToday(now) : parseDay(date);
      const cls = await classFor(actor, classId);
      return dayView(actor, cls, day, await repository.roster(cls.id, day), now);
    },

    /**
     * Saves a class's day: every student's status (`complete`), or some of
     * them. `takenAt` is when a teacher's phone took it, for offline saves.
     * Returns the day as saved, with `kept`: students whose later-taken
     * status was kept over this save.
     */
    saveDay,

    /** One student's day, filed under their own class and branch (a cell of the grid). */
    async markStudent({ actor, studentId, date, status }) {
      const student = await repository.findStudent(Number(studentId), scopeOf(actor));
      if (!student) throw new NotFoundError("student_not_found");
      const day = await saveDay({ actor, classId: student.classId, date, complete: false, entries: [{ studentId: student.id, status }] });
      return markOf(day, student.id);
    },

    /** One student's day in a given class: the student must be in that class. */
    async recordForClass({ actor, studentId, classId, date, status }) {
      const day = await saveDay({ actor, classId, date, complete: false, entries: [{ studentId, status }] });
      return markOf(day, Number(studentId));
    },

    /**
     * Many { studentID, classID, classDate, status } records at once. Every
     * record is checked before any is saved. Returns how many were saved.
     */
    async recordMany({ actor, records }) {
      if (!Array.isArray(records) || records.length === 0) throw new ValidationError("attendance_entries_required");
      const groups = new Map();
      for (const record of records) {
        if (!record || typeof record !== "object") throw new ValidationError("attendance_entries_invalid");
        const key = `${record.classID}|${record.classDate}`;
        if (!groups.has(key)) groups.set(key, { classId: record.classID, date: record.classDate, entries: [] });
        groups.get(key).entries.push({ studentId: record.studentID, status: record.status });
      }
      const plans = [];
      for (const group of groups.values()) plans.push(await prepareDay({ actor, ...group, complete: false }));
      for (const plan of plans) await commitDay(plan);
      return plans.reduce((total, plan) => total + plan.entries.length, 0);
    },

    /** Changes the status of the record `id`. */
    async updateRecord({ actor, id, status }) {
      const record = await repository.findRecord(Number(id), scopeOf(actor));
      if (!record) throw new NotFoundError("attendance_not_found");
      const now = clock.now();
      const entries = [{ studentId: record.studentId, status: parseStatus(status) }];
      const takenAt = adminTakenAt({ date: record.date, now });
      await repository.saveDay({
        classId: record.classId,
        branchId: record.branchId,
        date: record.date,
        entries,
        marker: { type: actor.kind, id: actor.id },
        takenAt,
      });
      await notifyAlerts({ branchId: record.branchId, date: record.date, now, students: entries });
    },

    async removeRecord({ actor, id }) {
      const record = await repository.findRecord(Number(id), scopeOf(actor));
      if (!record) throw new NotFoundError("attendance_not_found");
      await repository.removeRecord(record.id);
      await notifyAlerts({
        branchId: record.branchId,
        date: record.date,
        now: clock.now(),
        students: [{ studentId: record.studentId, status: null }],
      });
    },
  };
}
