import { makeAttendanceReads } from "./application/attendanceReads.usecases.js";
import { makeAttendanceUseCases } from "./application/attendance.usecases.js";
import { mysqlAttendanceRepository } from "./infrastructure/mysql-attendance.repository.js";
import { makeAttendanceController } from "./interface/attendance.controller.js";

// Composition root for class attendance.

// Absence SMS to parents are not wired yet: saving a day tells nobody.
const noAbsenceAlerts = { daySaved: async () => {} };

export const attendance = makeAttendanceUseCases({
  repository: mysqlAttendanceRepository,
  absenceAlerts: noAbsenceAlerts,
  clock: { now: () => new Date() },
});

export const attendanceController = makeAttendanceController({
  useCases: attendance,
  reads: makeAttendanceReads({ repository: mysqlAttendanceRepository }),
});
