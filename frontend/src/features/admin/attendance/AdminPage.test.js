import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminPage from "./AdminPage";

const attendance = vi.hoisted(() => ({ getRoster: vi.fn(), saveDay: vi.fn(), getSms: vi.fn() }));
const classes = vi.hoisted(() => ({ getNames: vi.fn(), getDistinct: vi.fn(), getAll: vi.fn() }));
vi.mock("@/services/attendance.service", () => ({ attendanceService: attendance }));
vi.mock("@/services/classes.service", () => ({ classesService: classes }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [{ id: 1, name_en: "Main Campus" }] } }));

const DATE = "2026-10-15";
const roster = (overrides = {}) => ({
  class: { id: 10, name: "Class 5", section: "Good", branchId: 1 },
  date: DATE,
  editable: true,
  takenBy: { type: "teacher", id: 7, name: "Nasima Akter", at: "2026-10-15T03:15:00.000Z" },
  students: [
    { studentId: 101, firstName: "Rahim", lastName: "Uddin", roll: "1", status: "Present" },
    { studentId: 102, firstName: "Karim", lastName: "Uddin", roll: "2", status: "Absent" },
    { studentId: 103, firstName: "Nadia", lastName: "Akter", roll: "3", status: null },
  ],
  ...overrides,
});

async function chooseClass() {
  await screen.findByRole("option", { name: "Class 5" });
  fireEvent.change(screen.getByLabelText("Class Name"), { target: { value: "Class 5" } });
  await screen.findByRole("option", { name: "Good" });
  fireEvent.change(screen.getByLabelText("Section"), { target: { value: "Good" } });
  fireEvent.change(screen.getByLabelText("Date"), { target: { value: DATE } });
}

const rowOf = async (name) => (await screen.findByText(name)).closest("tr");

describe("admin attendance page", () => {
  beforeEach(() => {
    Object.values(attendance).forEach((fn) => fn.mockReset());
    classes.getNames.mockResolvedValue(["Class 5"]);
    classes.getDistinct.mockResolvedValue({ data: [{ ClassName: "Class 5", Section: "Good" }] });
    classes.getAll.mockResolvedValue({ data: [{ ClassID: 10, ClassName: "Class 5", Section: "Good", branch_id: 1 }] });
    attendance.getRoster.mockResolvedValue({ success: true, data: roster() });
    attendance.getSms.mockResolvedValue({ success: true, data: [] });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main Campus" });
  });

  it("shows the class's saved day, who took it and when, with unmarked students as present", async () => {
    renderWithQuery(<AdminPage />);
    await chooseClass();

    expect(within(await rowOf("Karim Uddin")).getByRole("radio", { name: "Absent" })).toBeChecked();
    expect(within(await rowOf("Nadia Akter")).getByRole("radio", { name: "Present" })).toBeChecked();
    expect(screen.getByText("Taken by Nasima Akter (class teacher) at 09:15")).toBeInTheDocument();
    expect(screen.getByText("2 present · 1 absent · 0 late · 0 on leave")).toBeInTheDocument();
    expect(attendance.getRoster).toHaveBeenCalledWith(10, DATE);
  });

  it("saves the whole class in one request, with Leave", async () => {
    attendance.saveDay.mockResolvedValue({ success: true, data: { ...roster(), kept: [] } });
    renderWithQuery(<AdminPage />);
    await chooseClass();

    fireEvent.click(within(await rowOf("Nadia Akter")).getByRole("radio", { name: "Leave" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Attendance" }));

    await waitFor(() => expect(attendance.saveDay).toHaveBeenCalledTimes(1));
    expect(attendance.saveDay).toHaveBeenCalledWith(10, DATE, [
      { studentId: 101, status: "Present" },
      { studentId: 102, status: "Absent" },
      { studentId: 103, status: "Leave" },
    ]);
  });

  it("says so when someone else's newer change was kept", async () => {
    attendance.saveDay.mockResolvedValue({ success: true, data: { ...roster(), kept: [102] } });
    renderWithQuery(<AdminPage />);
    await chooseClass();
    await rowOf("Karim Uddin");

    fireEvent.click(screen.getByRole("button", { name: "Save Attendance" }));

    expect(await screen.findByText("1 students were changed later by someone else, so their newer status was kept.")).toBeInTheDocument();
  });

  it("shows the day's SMS to parents of this class", async () => {
    attendance.getSms.mockResolvedValue({
      success: true,
      data: [
        { id: 1, studentId: 102, studentName: "Karim Uddin", className: "Class 5", section: "Good", status: "sent", phone: "01711000002" },
        { id: 2, studentId: 900, studentName: "Other Class", className: "Class 6", section: "Good", status: "pending" },
      ],
    });
    renderWithQuery(<AdminPage />);
    await chooseClass();

    const sms = await screen.findByRole("region", { name: "SMS to parents" });
    expect(within(sms).getByText("Karim Uddin")).toBeInTheDocument();
    expect(within(sms).getByText("Sent")).toBeInTheDocument();
    expect(within(sms).queryByText("Other Class")).not.toBeInTheDocument();
    expect(attendance.getSms).toHaveBeenCalledWith(DATE);
  });

  it("lets a super admin on All branches look but not save", async () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null, currentBranchName: null });
    renderWithQuery(<AdminPage />);
    await chooseClass();
    await rowOf("Karim Uddin");

    expect(screen.queryByRole("button", { name: "Save Attendance" })).not.toBeInTheDocument();
  });

  it("shows a day nobody has taken, read-only when it cannot be changed", async () => {
    attendance.getRoster.mockResolvedValue({ success: true, data: roster({ takenBy: null, editable: false }) });
    renderWithQuery(<AdminPage />);
    await chooseClass();

    expect(await screen.findByText("Not taken yet for this day.")).toBeInTheDocument();
    expect(within(await rowOf("Rahim Uddin")).getByRole("radio", { name: "Present" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save Attendance" })).not.toBeInTheDocument();
  });
});
