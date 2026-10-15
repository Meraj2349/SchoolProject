import { describe, expect, it } from "@jest/globals";
import { makeDashboardUseCases } from "./dashboard.usecases.js";

function makeFakes() {
  const calls = { feeSummary: [], repo: [] };
  const dashboardRepository = {
    counts: async (branchId) => {
      calls.repo.push(["counts", branchId]);
      return { students: 120, teachers: 9, classes: 6 };
    },
    attendanceCounts: async (branchId, date) => {
      calls.repo.push(["attendance", branchId, date]);
      return { Present: 90, Late: 6, Absent: 24 };
    },
    recentPayments: async (branchId, limit) => [{ id: 1, amount: 500, limit }],
    upcomingEvents: async (branchId, fromDate, limit) => [{ EventID: 3, fromDate, limit }],
  };
  const feeSummary = async (args) => {
    calls.feeSummary.push(args);
    return { year: 2026, month: 10, invoices: 100, billed: 150000, collected: 90000, outstanding: 60000, overdue: 12 };
  };
  return { calls, dashboardRepository, feeSummary };
}

describe("dashboard summary", () => {
  const setup = () => {
    const fakes = makeFakes();
    const useCases = makeDashboardUseCases({ ...fakes, today: () => "2026-10-15" });
    return { ...fakes, useCases };
  };

  it("combines counts, today's attendance, this month's fees and lists for the branch", async () => {
    const { useCases } = setup();

    const summary = await useCases.summary({ branchId: 1 });

    expect(summary).toEqual({
      date: "2026-10-15",
      counts: { students: 120, teachers: 9, classes: 6 },
      attendance: { present: 90, late: 6, absent: 24, recorded: 120, rate: 80 },
      fees: {
        year: 2026, month: 10, invoices: 100, billed: 150000, collected: 90000, outstanding: 60000, overdue: 12,
        collection_rate: 60,
      },
      recent_payments: [{ id: 1, amount: 500, limit: 5 }],
      upcoming_events: [{ EventID: 3, fromDate: "2026-10-15", limit: 5 }],
    });
  });

  it("asks every source for the same branch and today's period", async () => {
    const { useCases, calls } = setup();

    await useCases.summary({ branchId: 2 });

    expect(calls.repo).toEqual([["counts", 2], ["attendance", 2, "2026-10-15"]]);
    expect(calls.feeSummary).toEqual([{ branchId: 2, input: { year: 2026, month: 10 } }]);
  });

  it("works across all branches for a super admin (no branch)", async () => {
    const { useCases, calls } = setup();

    await useCases.summary({ branchId: null });

    expect(calls.repo[0]).toEqual(["counts", null]);
  });
});
