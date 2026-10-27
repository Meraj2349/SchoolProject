import { absenceSms } from "../notifications/index.js";
import { makeAttendanceReads } from "./application/attendanceReads.usecases.js";
import { makeAttendanceUseCases } from "./application/attendance.usecases.js";
import { postgresAttendanceRepository } from "./infrastructure/postgres-attendance.repository.js";
import { makeAttendanceController } from "./interface/attendance.controller.js";

// Composition root for class attendance.

export const attendance = makeAttendanceUseCases({
  repository: postgresAttendanceRepository,
  absenceAlerts: absenceSms,
  clock: { now: () => new Date() },
});

export const attendanceController = makeAttendanceController({
  useCases: attendance,
  reads: makeAttendanceReads({ repository: postgresAttendanceRepository }),
});
