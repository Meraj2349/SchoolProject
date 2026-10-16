import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for the website's attendance routes (/api/attendance). Admin
// routes run after authMiddleware (req.adminId, req.role, req.branchId); the
// public lookups after optionalAuth (req.branchId from ?branch_id).
export function makeAttendanceController({ useCases, reads }) {
  const actorOf = (req) => ({ kind: "admin", id: req.adminId, role: req.role, branchId: req.branchId ?? null });
  const scopeOf = (req) => ({ branchId: req.branchId ?? null });

  const handle = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language, "attendance_fetch_failed");
    }
  };

  const ok = (res, data) => res.status(200).json({ success: true, data });
  const listed = (res, rows) => res.status(200).json({ success: true, data: rows, count: rows.length });
  const list = (read) => handle(async (req, res) => listed(res, await read(req)));

  return {
    // ── Reads ──
    all: list((req) => reads.all(scopeOf(req))),
    byStudent: list((req) => reads.byStudent({ ...scopeOf(req), studentId: req.params.studentID })),
    byClass: list((req) => reads.byClass({ ...scopeOf(req), classId: req.params.classID })),
    byDate: list((req) => reads.byDate({ ...scopeOf(req), date: req.params.date })),
    byDateRange: list((req) =>
      reads.byDateRange({ ...scopeOf(req), startDate: req.params.startDate, endDate: req.params.endDate }),
    ),
    byClassSection: list((req) =>
      reads.byClassSection({ ...scopeOf(req), className: req.params.className, section: req.params.section }),
    ),
    byNameRoll: list((req) =>
      reads.byNameRoll({
        ...scopeOf(req),
        firstName: req.params.firstName,
        roll: req.params.roll,
        className: req.params.class,
        section: req.params.section,
      }),
    ),
    classDaySummary: list((req) =>
      reads.classDaySummary({ ...scopeOf(req), classId: req.params.classID, date: req.params.date }),
    ),

    byId: handle(async (req, res) => ok(res, await reads.byId({ ...scopeOf(req), id: req.params.id }))),
    count: handle(async (req, res) => ok(res, { count: await reads.count(scopeOf(req)) })),
    statistics: handle(async (req, res) => ok(res, await reads.statistics(scopeOf(req)))),
    studentSummary: handle(async (req, res) =>
      ok(res, await reads.studentSummary({ ...scopeOf(req), studentId: req.params.studentID })),
    ),
    exists: handle(async (req, res) =>
      ok(res, { exists: await reads.exists({ ...scopeOf(req), studentId: req.query.studentID, date: req.query.classDate }) }),
    ),
    grid: handle(async (req, res) => {
      const { className, section, startDate, endDate } = req.query;
      ok(res, await reads.grid({ ...scopeOf(req), className, section, startDate, endDate }));
    }),

    // ── Taking attendance ──
    roster: handle(async (req, res) =>
      ok(res, await useCases.getRoster({ actor: actorOf(req), classId: req.query.classId, date: req.query.date })),
    ),

    /** A class's whole day in one request: { entries: [{ studentId, status }] }. */
    saveDay: handle(async (req, res) => {
      const day = await useCases.saveDay({
        actor: actorOf(req),
        classId: req.params.classId,
        date: req.params.date,
        entries: req.body?.entries,
      });
      res.status(200).json({ success: true, message: t("attendance_saved", req.language), data: day });
    }),

    /** One student's day: { studentId, classDate, status } (a cell of the grid). */
    markStudent: handle(async (req, res) => {
      const { studentId, classDate, status } = req.body ?? {};
      const mark = await useCases.markStudent({ actor: actorOf(req), studentId, date: classDate, status });
      res.status(200).json({ success: true, message: t("attendance_saved", req.language), data: mark });
    }),

    /** { studentID, classID, classDate, status }: the student must be in that class. */
    create: handle(async (req, res) => {
      const { studentID, classID, classDate, status } = req.body ?? {};
      const mark = await useCases.recordForClass({ actor: actorOf(req), studentId: studentID, classId: classID, date: classDate, status });
      res.status(201).json({ success: true, message: t("attendance_recorded", req.language), data: { attendanceID: mark.attendanceId } });
    }),

    /** { attendanceRecords: [{ studentID, classID, classDate, status }] }, all or nothing checked. */
    bulk: handle(async (req, res) => {
      const recordsCreated = await useCases.recordMany({ actor: actorOf(req), records: req.body?.attendanceRecords });
      res.status(201).json({ success: true, message: t("attendance_recorded", req.language), data: { recordsCreated } });
    }),

    update: handle(async (req, res) => {
      await useCases.updateRecord({ actor: actorOf(req), id: req.params.id, status: req.body?.status });
      res.status(200).json({ success: true, message: t("attendance_updated", req.language) });
    }),

    remove: handle(async (req, res) => {
      await useCases.removeRecord({ actor: actorOf(req), id: req.params.id });
      res.status(200).json({ success: true, message: t("attendance_deleted", req.language) });
    }),
  };
}
