import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminDashboardPage from "./AdminDashboardPage";

const summary = {
  date: "2026-10-15",
  counts: { students: 120, teachers: 9, classes: 6 },
  attendance: { present: 90, late: 6, absent: 24, recorded: 120, rate: 80 },
  fees: { year: 2026, month: 10, invoices: 100, billed: 150000, collected: 90000, outstanding: 60000, overdue: 12, collection_rate: 60 },
  recent_payments: [
    { id: 7, receipt_no: "RC-2026-00007", student_name: "Rahim Uddin", class_name: "Class 5", amount: 1500, method: "bkash", paid_on: "2026-10-14" },
  ],
  upcoming_events: [{ EventID: 3, EventName: "Sports Day", StartDate: "2026-10-20", EndDate: "2026-10-20" }],
};

const getSummary = vi.fn();
vi.mock("@/services/dashboard.service", () => ({ dashboardService: { getSummary: () => getSummary() } }));
vi.mock("@/services/branch.service", () => ({
  branchService: { getStats: async () => [{ id: 1, name_en: "Main", studentCount: 120, teacherCount: 9, classCount: 6 }] },
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    getSummary.mockReset();
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
  });

  it("shows the headline numbers for a branch admin", async () => {
    getSummary.mockResolvedValue(summary);
    renderWithQuery(<AdminDashboardPage />);

    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("96 of 120 present")).toBeInTheDocument();
    expect(screen.getAllByText("৳90,000.00").length).toBeGreaterThan(0);
    expect(screen.getByText("60% of ৳1,50,000.00 billed")).toBeInTheDocument();
  });

  it("lists recent payments and upcoming events", async () => {
    getSummary.mockResolvedValue(summary);
    renderWithQuery(<AdminDashboardPage />);

    const payments = await screen.findByRole("region", { name: "Recent payments" });
    expect(within(payments).getByText("Rahim Uddin")).toBeInTheDocument();
    expect(within(payments).getByText("RC-2026-00007")).toBeInTheDocument();
    expect(within(payments).getByText("bKash")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Upcoming events" })).toHaveTextContent("Sports Day");
  });

  it("says when attendance is not taken yet and nothing is billed", async () => {
    getSummary.mockResolvedValue({
      ...summary,
      attendance: { present: 0, late: 0, absent: 0, recorded: 0, rate: null },
      fees: { ...summary.fees, billed: 0, collected: 0, outstanding: 0, overdue: 0, collection_rate: null },
      recent_payments: [],
      upcoming_events: [],
    });
    renderWithQuery(<AdminDashboardPage />);

    expect(await screen.findByText("Not taken yet")).toBeInTheDocument();
    expect(screen.getByText("No invoices this month")).toBeInTheDocument();
    expect(screen.getByText("No payments yet")).toBeInTheDocument();
    expect(screen.getByText("No upcoming events")).toBeInTheDocument();
  });

  it("shows an error when the summary cannot be loaded", async () => {
    getSummary.mockRejectedValue(new Error("boom"));
    renderWithQuery(<AdminDashboardPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load dashboard data");
  });

  it("shows the branch overview only to super admins", async () => {
    getSummary.mockResolvedValue(summary);
    useAuthStore.setState({ role: "super_admin" });
    renderWithQuery(<AdminDashboardPage />);

    const branches = await screen.findByRole("region", { name: "Branch Overview" });
    expect(await within(branches).findByText("Main")).toBeInTheDocument();
  });
});
