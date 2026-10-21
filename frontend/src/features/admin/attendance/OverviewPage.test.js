import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import OverviewPage from "./OverviewPage";

const attendance = vi.hoisted(() => ({ getOverview: vi.fn() }));
vi.mock("@/services/attendance.service", () => ({ attendanceService: attendance }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));

const DATE = "2026-10-15";
const NOW = new Date("2026-10-15T06:00:00.000Z"); // 12:00 in Dhaka

const mainCampus = () => ({
  id: 1,
  nameBn: "প্রধান শাখা",
  nameEn: "Main Campus",
  totals: { classes: 2, taken: 1, notTaken: 1, students: 70, present: 30, absent: 3, late: 1, leave: 1 },
  classes: [
    {
      id: 10,
      name: "Class 5",
      section: "Good",
      students: 35,
      classTeacher: { id: 7, name: "Nasima Akter", appAccess: true },
      taken: true,
      takenBy: { type: "teacher", name: "Nasima Akter", at: "2026-10-15T03:15:00.000Z" },
      counts: { present: 30, absent: 3, late: 1, leave: 1 },
    },
    {
      id: 11,
      name: "Class 6",
      section: "Rose",
      students: 35,
      classTeacher: null,
      taken: false,
      takenBy: null,
      counts: { present: 0, absent: 0, late: 0, leave: 0 },
    },
  ],
});

const northBranch = () => ({
  id: 2,
  nameBn: "উত্তর শাখা",
  nameEn: "North Branch",
  totals: { classes: 0, taken: 0, notTaken: 0, students: 0, present: 0, absent: 0, late: 0, leave: 0 },
  classes: [],
});

const overview = (branches) => ({ success: true, data: { date: DATE, branches } });
const branchBox = (name) => screen.findByRole("region", { name });
const rowOf = (box, className) => within(box).getByText(className).closest("tr");

describe("attendance by branch page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    attendance.getOverview.mockReset();
    attendance.getOverview.mockResolvedValue(overview([mainCampus(), northBranch()]));
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null, currentBranchName: "All Branches" });
  });

  afterEach(() => vi.useRealTimers());

  it("asks for today's overview on the school's clock", async () => {
    renderWithQuery(<OverviewPage />);

    await branchBox("Main Campus");
    expect(attendance.getOverview).toHaveBeenCalledWith(DATE);
    expect(screen.getByLabelText("Date")).toHaveValue(DATE);
  });

  it("shows one box per branch with its totals", async () => {
    renderWithQuery(<OverviewPage />);

    const main = await branchBox("Main Campus");
    expect(within(main).getByText("Classes: 2 · Taken: 1 of 2 · Students: 70 · Absent: 3")).toBeInTheDocument();
    expect(await branchBox("North Branch")).toBeInTheDocument();
  });

  it("lists a taken class with its teacher, app access, who took it and the counts", async () => {
    renderWithQuery(<OverviewPage />);

    const row = rowOf(await branchBox("Main Campus"), "Class 5 — Good");
    expect(within(row).getByText("Nasima Akter")).toBeInTheDocument();
    expect(within(row).getByText("App on")).toBeInTheDocument();
    expect(within(row).getByText("Taken 09:15")).toBeInTheDocument();
    expect(within(row).getByText("by class teacher")).toBeInTheDocument();
    expect(within(row).getByRole("cell", { name: "30" })).toBeInTheDocument();
    expect(within(row).getByRole("cell", { name: "3" })).toBeInTheDocument();
  });

  it("labels every cell, so a phone can show each class as a card", async () => {
    renderWithQuery(<OverviewPage />);

    const row = rowOf(await branchBox("Main Campus"), "Class 5 — Good");
    expect(within(row).getByRole("cell", { name: "30" })).toHaveAttribute("data-label", "Present");
    expect(within(row).getByRole("cell", { name: "3" })).toHaveAttribute("data-label", "Absent");
    expect(within(row).getByRole("cell", { name: /Nasima Akter/ })).toHaveAttribute("data-label", "Class teacher");
  });

  it("shows a class nobody has taken and that has no class teacher", async () => {
    renderWithQuery(<OverviewPage />);

    const row = rowOf(await branchBox("Main Campus"), "Class 6 — Rose");
    expect(within(row).getByText("No class teacher")).toBeInTheDocument();
    expect(within(row).getByText("Not taken")).toBeInTheDocument();
    expect(within(row).queryByText("App on")).not.toBeInTheDocument();
  });

  it("shows a day saved before anyone was recorded as taking it as taken, with its counts", async () => {
    const branch = mainCampus();
    branch.classes[1] = { ...branch.classes[1], taken: true, counts: { present: 20, absent: 2, late: 0, leave: 0 } };
    attendance.getOverview.mockResolvedValue(overview([branch]));
    renderWithQuery(<OverviewPage />);

    const row = rowOf(await branchBox("Main Campus"), "Class 6 — Rose");
    expect(within(row).getByText("Taken")).toBeInTheDocument();
    expect(within(row).queryByText("Not taken")).not.toBeInTheDocument();
    expect(within(row).getByRole("cell", { name: "20" })).toBeInTheDocument();
  });

  it("says so when a branch has no classes", async () => {
    renderWithQuery(<OverviewPage />);

    expect(within(await branchBox("North Branch")).getByText("No classes in this branch.")).toBeInTheDocument();
  });

  it("opens a class on the mark page with its class and day chosen", async () => {
    renderWithQuery(<OverviewPage />);

    const row = rowOf(await branchBox("Main Campus"), "Class 5 — Good");
    expect(within(row).getByRole("link", { name: "Open Class 5 — Good" })).toHaveAttribute(
      "href",
      `/admin/attendance?classId=10&date=${DATE}`,
    );
  });

  it("loads another day when the date changes", async () => {
    renderWithQuery(<OverviewPage />);
    await branchBox("Main Campus");

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-10-14" } });

    await waitFor(() => expect(attendance.getOverview).toHaveBeenCalledWith("2026-10-14"));
  });

  it("shows the names, labels and numbers in Bangla", async () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<OverviewPage />);

    const main = await branchBox("প্রধান শাখা");
    expect(screen.getByRole("heading", { level: 1, name: "শাখা অনুযায়ী উপস্থিতি" })).toBeInTheDocument();
    expect(within(main).getByText("শ্রেণি ২টি · নেওয়া হয়েছে ১ / ২ · শিক্ষার্থী ৭০ জন · অনুপস্থিত ৩ জন")).toBeInTheDocument();
    expect(within(main).getByText("শ্রেণি শিক্ষক নেই")).toBeInTheDocument();
    expect(within(main).getByText("অ্যাপ চালু")).toBeInTheDocument();
    expect(within(main).getByText("নেওয়া হয়েছে ০৯:১৫")).toBeInTheDocument();
    expect(within(main).getByText("নেওয়া হয়নি")).toBeInTheDocument();
  });

  it("says so when there are no branches", async () => {
    attendance.getOverview.mockResolvedValue(overview([]));
    renderWithQuery(<OverviewPage />);

    expect(await screen.findByText("No branches to show.")).toBeInTheDocument();
  });

  it("shows the server's message when the overview cannot be loaded", async () => {
    attendance.getOverview.mockRejectedValue({ response: { data: { message: "Server down" } } });
    renderWithQuery(<OverviewPage />);

    expect(await screen.findByText("Server down")).toBeInTheDocument();
  });
});
