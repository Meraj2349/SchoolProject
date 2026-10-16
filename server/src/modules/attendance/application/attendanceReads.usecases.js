import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { addDays } from "../../../shared/schoolDate.js";
import { STATUSES, attendanceRate, buildGrid, parseDay } from "../domain/attendance.js";

/** The longest range one request may read: a school year. */
const MAX_RANGE_DAYS = 366;

const positiveId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new NotFoundError("attendance_not_found");
  return id;
};

function range(startDate, endDate) {
  const from = parseDay(startDate);
  const to = parseDay(endDate);
  if (to < from || addDays(from, MAX_RANGE_DAYS) < to) throw new ValidationError("attendance_range_invalid");
  return { from, to };
}

const totals = (counts) => Object.fromEntries(STATUSES.map((status) => [status, Number(counts[status] ?? 0)]));

/**
 * Reading attendance. `branchId` scopes every read: a branch admin's branch,
 * the branch a super admin or a public visitor picked, or null for all.
 * Records keep the shape the website has always read
 * ({ AttendanceID, StudentID, ClassID, ClassDate, Status, FirstName, ... }).
 */
export function makeAttendanceReads({ repository }) {
  return {
    all: ({ branchId }) => repository.list({ branchId }),

    async byId({ branchId, id }) {
      const [record] = await repository.list({ branchId, id: positiveId(id) });
      if (!record) throw new NotFoundError("attendance_not_found");
      return record;
    },

    byStudent: ({ branchId, studentId }) => repository.list({ branchId, studentId: positiveId(studentId) }),

    byClass: ({ branchId, classId }) => repository.list({ branchId, classId: positiveId(classId) }),

    byDate: ({ branchId, date }) => repository.list({ branchId, date: parseDay(date) }),

    byDateRange: ({ branchId, startDate, endDate }) => repository.list({ branchId, ...range(startDate, endDate) }),

    async byClassSection({ branchId, className, section }) {
      if (!className || !section) throw new ValidationError("attendance_class_section_required");
      return repository.list({ branchId, className, section });
    },

    /** A public lookup: the first name may be partial, the roll number must match exactly. */
    async byNameRoll({ branchId, firstName, roll, className, section }) {
      if (!firstName || !roll || !className || !section) throw new ValidationError("attendance_required_fields");
      return repository.list({ branchId, firstName, roll, className, section });
    },

    count: ({ branchId }) => repository.countRecords(branchId),

    async statistics({ branchId }) {
      const t = totals(await repository.statusCounts({ branchId }));
      return {
        TotalRecords: t.Present + t.Absent + t.Late + t.Leave,
        TotalPresent: t.Present,
        TotalAbsent: t.Absent,
        TotalLate: t.Late,
        TotalLeave: t.Leave,
        OverallAttendancePercentage: attendanceRate(t),
      };
    },

    async studentSummary({ branchId, studentId }) {
      const id = positiveId(studentId);
      const student = await repository.findStudentInfo(id, branchId);
      if (!student) throw new NotFoundError("attendance_not_found");
      const t = totals(await repository.statusCounts({ branchId, studentId: id }));
      const days = t.Present + t.Absent + t.Late + t.Leave;
      if (days === 0) throw new NotFoundError("attendance_not_found");
      return {
        ...student,
        TotalPresent: t.Present,
        TotalAbsent: t.Absent,
        TotalLate: t.Late,
        TotalLeave: t.Leave,
        TotalDays: days,
        AttendancePercentage: attendanceRate(t),
      };
    },

    /** [{ Status, Count }] for one class's day. */
    async classDaySummary({ branchId, classId, date }) {
      const counts = await repository.statusCounts({ branchId, classId: positiveId(classId), date: parseDay(date) });
      return Object.entries(counts).map(([Status, Count]) => ({ Status, Count: Number(Count) }));
    },

    exists: ({ branchId, studentId, date }) =>
      repository.exists({ branchId, studentId: positiveId(studentId), date: parseDay(date) }),

    /** Students × days of one class and section. */
    async grid({ branchId, className, section, startDate, endDate }) {
      if (!className || !section) throw new ValidationError("attendance_class_section_required");
      const { from, to } = range(startDate, endDate);
      const rows = await repository.gridRows({ branchId, className, section, from, to });
      return { ...buildGrid(rows), className, section };
    },
  };
}
