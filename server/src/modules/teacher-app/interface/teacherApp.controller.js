import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

const handle = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    sendError(res, error, req.language);
  }
};

const ok = (res, data, message) => res.status(200).json({ success: true, ...(message && { message }), data });

/** HTTP adapter for the phone app (/api/teacher-app/v1). Routes after login run after teacherAuth. */
export function makeTeacherAppController({ useCases }) {
  return {
    login: handle(async (req, res) => {
      const { phone, password } = req.body ?? {};
      ok(res, await useCases.login({ phone, password }));
    }),

    me: handle(async (req, res) => ok(res, await useCases.me({ teacher: req.teacher }))),

    roster: handle(async (req, res) =>
      ok(res, await useCases.roster({ teacher: req.teacher, classId: req.params.classId, date: req.query.date })),
    ),

    /** { entries: [{ studentId, status }], takenAt }: takenAt is when the phone took the day (offline saves). */
    saveDay: handle(async (req, res) => {
      const { entries, takenAt } = req.body ?? {};
      const day = await useCases.saveDay({ teacher: req.teacher, classId: req.params.classId, date: req.params.date, entries, takenAt });
      ok(res, day, t("attendance_saved", req.language));
    }),

    changePassword: handle(async (req, res) => {
      const { current, next } = req.body ?? {};
      ok(res, await useCases.changePassword({ teacher: req.teacher, current, next }), t("teacher_app_password_changed", req.language));
    }),
  };
}

/** HTTP adapter for admins managing app access (/api/teachers/...app-access), after authMiddleware. */
export function makeTeacherAccessController({ useCases }) {
  const adminOf = (req) => ({ role: req.role, branchId: req.branchId ?? null });
  return {
    list: handle(async (req, res) => ok(res, await useCases.list({ admin: adminOf(req) }))),

    setAccess: handle(async (req, res) => {
      const access = await useCases.setAccess({ admin: adminOf(req), teacherId: req.params.id, input: req.body ?? {} });
      ok(res, access, t("teacher_app_access_saved", req.language));
    }),
  };
}
