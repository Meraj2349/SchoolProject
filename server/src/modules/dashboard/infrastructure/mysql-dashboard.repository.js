import db from "../../../shared/db/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

const scalar = async (sql, params) => {
  const row = await db.one(sql, params);
  return Number(row.total);
};

// MySQL adapter for the dashboard. branchId null = all branches (super admin).
export const mysqlDashboardRepository = {
  async counts(branchId) {
    const { clause, params } = branchFilter(branchId);
    const [students, teachers, classes] = await Promise.all(
      ["Students", "Teachers", "Classes"].map((table) =>
        scalar(`SELECT COUNT(*) AS total FROM ${table} WHERE 1=1 ${clause}`, params),
      ),
    );
    return { students, teachers, classes };
  },

  async attendanceCounts(branchId, date) {
    const { clause, params } = branchFilter(branchId, "a");
    const { rows } = await db.query(
      `SELECT a.Status AS status, COUNT(*) AS total FROM Attendance a
        WHERE a.ClassDate = ? ${clause} GROUP BY a.Status`,
      [date, ...params],
    );
    return Object.fromEntries(rows.map((row) => [row.status, Number(row.total)]));
  },

  async recentPayments(branchId, limit) {
    const { clause, params } = branchFilter(branchId, "p");
    const { rows } = await db.query(
      `SELECT p.id, p.receipt_no, p.amount, p.method, p.paid_on, p.branch_id,
              i.student_id, CONCAT(s.FirstName, ' ', s.LastName) AS student_name,
              i.class_name, i.section, i.\`year\`, i.\`month\`
         FROM FeePayments p
         JOIN FeeInvoices i ON i.id = p.invoice_id
         JOIN Students s ON s.StudentID = i.student_id
        WHERE p.voided_at IS NULL ${clause}
        ORDER BY p.paid_on DESC, p.id DESC
        LIMIT ?`,
      [...params, limit],
    );
    return rows.map((row) => ({ ...row, amount: Number(row.amount) }));
  },

  // Events from today on: the branch's own plus school-wide (branch_id NULL) ones.
  async upcomingEvents(branchId, fromDate, limit) {
    const branchClause = branchId == null ? "" : "AND (branch_id = ? OR branch_id IS NULL)";
    const { rows } = await db.query(
      `SELECT EventID, EventName, EventType, StartDate, EndDate, Venue, branch_id
         FROM Events
        WHERE EndDate >= ? ${branchClause}
        ORDER BY StartDate, EventID
        LIMIT ?`,
      [fromDate, ...(branchId == null ? [] : [branchId]), limit],
    );
    return rows;
  },
};
