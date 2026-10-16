import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AttendancePage from "./AttendancePage";

const attendance = vi.hoisted(() => ({ getByClassSection: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/attendance" }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/attendance.service", () => ({ attendanceService: attendance }));
vi.mock("@/services/classes.service", () => ({
  classesService: { getNames: async () => ["Class 5"], getStandardSections: async () => ["Good"] },
}));

const RECORDS = [
  { AttendanceID: 1, FirstName: "Rahim", LastName: "Uddin", ClassDate: "2026-10-05", Status: "Present" },
  { AttendanceID: 2, FirstName: "Karima", LastName: null, ClassDate: "2026-10-05", Status: "Absent" },
  { AttendanceID: 3, StudentID: 9, ClassDate: "2026-10-05", Status: "Late" },
];

async function search() {
  await screen.findByRole("option", { name: "Class 5" });
  fireEvent.change(screen.getByLabelText("Class Name"), { target: { value: "Class 5" } });
  await screen.findByRole("option", { name: "Good" });
  fireEvent.change(screen.getByLabelText("Section"), { target: { value: "Good" } });
  fireEvent.click(screen.getByRole("button", { name: "Search Attendance" }));
}

describe("AttendancePage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    attendance.getByClassSection.mockReset();
  });

  it("shows the records with a summary and no 'undefined' names", async () => {
    attendance.getByClassSection.mockResolvedValue({ success: true, data: RECORDS });
    renderWithQuery(<AttendancePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Attendance Records" })).toBeInTheDocument();
    await search();

    const rows = within(await screen.findByRole("table")).getAllByRole("row");
    expect(attendance.getByClassSection).toHaveBeenCalledWith("Class 5", "Good");
    expect(rows).toHaveLength(4);
    expect(within(rows[2]).getByText("Karima")).toBeInTheDocument();
    expect(within(rows[3]).getByText("9")).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    expect(within(rows[1]).getByText("5 Oct 2026")).toBeInTheDocument();

    const summary = screen.getByRole("list", { name: "Summary" });
    expect(within(summary).getByText("33.3%")).toBeInTheDocument();
    expect(within(summary).getByText("Absent").previousSibling).toHaveTextContent("1");
  });

  it("translates the statuses", async () => {
    useLanguageStore.getState().setLanguage("bn");
    attendance.getByClassSection.mockResolvedValue({ success: true, data: RECORDS });
    renderWithQuery(<AttendancePage />);
    await screen.findByRole("option", { name: "Class 5" });
    fireEvent.change(screen.getByLabelText("শ্রেণির নাম"), { target: { value: "Class 5" } });
    await screen.findByRole("option", { name: "Good" });
    fireEvent.change(screen.getByLabelText("বিভাগ"), { target: { value: "Good" } });
    fireEvent.submit(screen.getByRole("button", { name: /খুঁজুন/ }).closest("form"));

    const rows = within(await screen.findByRole("table")).getAllByRole("row");
    expect(within(rows[3]).getByText("দেরিতে")).toBeInTheDocument();
  });

  it("shows its own message when the search fails", async () => {
    attendance.getByClassSection.mockRejectedValue(new Error("ECONNREFUSED 10.0.0.5"));
    renderWithQuery(<AttendancePage />);
    await search();

    expect(await screen.findByText("Failed to fetch attendance")).toBeInTheDocument();
    expect(screen.queryByText(/ECONNREFUSED/)).not.toBeInTheDocument();
  });
});
