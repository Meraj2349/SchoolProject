import { attendanceToday, collectionRate, currentPeriod } from "../domain/dashboard.js";

const LIST_LIMIT = 5;

/**
 * The admin dashboard: headline numbers for one branch (or all branches for a
 * super admin, branchId null).
 *
 * @param {object} deps
 * @param {object} deps.dashboardRepository  counts, attendanceCounts, recentPayments, upcomingEvents
 * @param {(args: {branchId, input: {year, month}}) => Promise<object>} deps.feeSummary  fee module's monthly summary
 * @param {() => string} deps.today  "YYYY-MM-DD" in the school's time zone
 */
export function makeDashboardUseCases({ dashboardRepository: repo, feeSummary, today }) {
  return {
    async summary({ branchId }) {
      const date = today();
      const [counts, attendanceCounts, fees, recentPayments, upcomingEvents] = await Promise.all([
        repo.counts(branchId),
        repo.attendanceCounts(branchId, date),
        feeSummary({ branchId, input: currentPeriod(date) }),
        repo.recentPayments(branchId, LIST_LIMIT),
        repo.upcomingEvents(branchId, date, LIST_LIMIT),
      ]);
      const { by_class: _byClass, ...feeTotals } = fees;
      return {
        date,
        counts,
        attendance: attendanceToday(attendanceCounts),
        fees: { ...feeTotals, collection_rate: collectionRate(fees) },
        recent_payments: recentPayments,
        upcoming_events: upcomingEvents,
      };
    },
  };
}
