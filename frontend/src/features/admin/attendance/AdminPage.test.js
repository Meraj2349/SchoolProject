import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  branch: { id: 1, nameBn: "প্রধান শাখা", nameEn: "Main Campus" },
  classTeacher: { id: 7, name: "Nasima Akter", appAccess: true },
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

  afterEach(() => vi.useRealTimers());

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
        { id: 1, studentId: 102, studentName: "Karim Uddin", classId: 10, className: "Class 5", section: "Good", status: "sent", phone: "01711000002" },
        { id: 2, studentId: 900, studentName: "Other Class", classId: 11, className: "Class 6", section: "Good", status: "pending" },
        { id: 3, studentId: 901, studentName: "Other Branch", classId: 31, className: "Class 5", section: "Good", status: "pending" },
      ],
    });
    renderWithQuery(<AdminPage />);
    await chooseClass();

    const sms = await screen.findByRole("region", { name: "SMS to parents" });
    expect(within(sms).getByText("Karim Uddin")).toBeInTheDocument();
    expect(within(sms).getByText("Sent")).toBeInTheDocument();
    expect(within(sms).queryByText("Other Class")).not.toBeInTheDocument();
    expect(within(sms).queryByText("Other Branch")).not.toBeInTheDocument();
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

  it("shows the branch and the class teacher with their app access under the class title", async () => {
    renderWithQuery(<AdminPage />);
    await chooseClass();

    const box = await screen.findByRole("region", { name: "Class 5 — Good" });
    expect(within(box).getByText("Main Campus")).toBeInTheDocument();
    expect(within(box).getByText("Class teacher: Nasima Akter")).toBeInTheDocument();
    expect(within(box).getByText("App on")).toBeInTheDocument();
  });

  it("says so when the class has no class teacher", async () => {
    attendance.getRoster.mockResolvedValue({ success: true, data: roster({ classTeacher: null }) });
    renderWithQuery(<AdminPage />);
    await chooseClass();

    const box = await screen.findByRole("region", { name: "Class 5 — Good" });
    expect(within(box).getByText("No class teacher")).toBeInTheDocument();
    expect(within(box).queryByText("App on")).not.toBeInTheDocument();
  });

  it("opens the class and day given in the link, even on All branches where the class name repeats", async () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null, currentBranchName: null });
    classes.getAll.mockResolvedValue({
      data: [
        { ClassID: 10, ClassName: "Class 5", Section: "Good", branch_id: 1 },
        { ClassID: 20, ClassName: "Class 5", Section: "Good", branch_id: 2 },
      ],
    });
    renderWithQuery(<AdminPage initialClassId="10" initialDate={DATE} />);

    expect(await rowOf("Karim Uddin")).toBeInTheDocument();
    expect(attendance.getRoster).toHaveBeenCalledWith(10, DATE);
    expect(screen.getByLabelText("Class Name")).toHaveValue("Class 5");
    expect(screen.getByLabelText("Section")).toHaveValue("Good");
    expect(screen.getByLabelText("Date")).toHaveValue(DATE);
  });

  it("ignores a date in the link that is not a day, and opens today", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-15T20:00:00.000Z"), toFake: ["Date"] }); // 02:00 on the 16th in Dhaka
    renderWithQuery(<AdminPage initialClassId="10" initialDate="tomorrow" />);

    await rowOf("Karim Uddin");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-10-16");
  });

  it("goes back to choosing by name once another class is picked", async () => {
    classes.getNames.mockResolvedValue(["Class 5", "Class 6"]);
    classes.getDistinct.mockResolvedValue({
      data: [
        { ClassName: "Class 5", Section: "Good" },
        { ClassName: "Class 6", Section: "Rose" },
      ],
    });
    classes.getAll.mockResolvedValue({
      data: [
        { ClassID: 10, ClassName: "Class 5", Section: "Good", branch_id: 1 },
        { ClassID: 11, ClassName: "Class 6", Section: "Rose", branch_id: 1 },
      ],
    });
    renderWithQuery(<AdminPage initialClassId="10" initialDate={DATE} />);
    await rowOf("Karim Uddin");

    fireEvent.change(screen.getByLabelText("Class Name"), { target: { value: "Class 6" } });

    await waitFor(() => expect(attendance.getRoster).toHaveBeenCalledWith(11, DATE));
  });
});
