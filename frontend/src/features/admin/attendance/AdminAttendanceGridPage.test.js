import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminAttendanceGridPage from "./AdminAttendanceGridPage";

const attendance = vi.hoisted(() => ({ getGrid: vi.fn() }));
const classes = vi.hoisted(() => ({ getNames: vi.fn(), getDistinct: vi.fn() }));
const xlsx = vi.hoisted(() => ({
  utils: { aoa_to_sheet: vi.fn(() => ({})), book_new: vi.fn(() => ({})), book_append_sheet: vi.fn() },
  write: vi.fn(() => new ArrayBuffer(0)),
}));
vi.mock("@/services/attendance.service", () => ({ attendanceService: attendance }));
vi.mock("@/services/classes.service", () => ({ classesService: classes }));
vi.mock("xlsx", () => xlsx);
vi.mock("file-saver", () => ({ saveAs: vi.fn() }));

const MAIN = { id: 1, nameBn: "প্রধান শাখা", nameEn: "Main Campus" };
const NORTH = { id: 2, nameBn: "উত্তর শাখা", nameEn: "North Branch" };
const student = (id, firstName, branch) => ({
  StudentID: id,
  FirstName: firstName,
  LastName: "Uddin",
  RollNumber: String(id),
  attendance: {},
  branch,
});

async function searchClass5() {
  await screen.findByRole("option", { name: "Class 5" });
  fireEvent.change(screen.getByDisplayValue("Select class"), { target: { value: "Class 5" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
}

describe("attendance grid", () => {
  beforeEach(() => {
    attendance.getGrid.mockReset();
    xlsx.utils.aoa_to_sheet.mockClear();
    classes.getNames.mockResolvedValue(["Class 5"]);
    classes.getDistinct.mockResolvedValue({ data: [{ ClassName: "Class 5", Section: "Good" }] });
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null, currentBranchName: "All Branches" });
  });

  describe("across several branches", () => {
    beforeEach(() => {
      attendance.getGrid.mockResolvedValue({
        success: true,
        data: { branches: [MAIN, NORTH], students: [student(1, "Rahim", MAIN), student(2, "Karim", NORTH)] },
      });
    });

    it("shows one section per branch, with the branch's students", async () => {
      renderWithQuery(<AdminAttendanceGridPage />);
      await searchClass5();

      const main = await screen.findByRole("region", { name: "Main Campus" });
      const north = screen.getByRole("region", { name: "North Branch" });
      expect(within(main).getByText("Rahim Uddin")).toBeInTheDocument();
      expect(within(main).queryByText("Karim Uddin")).not.toBeInTheDocument();
      expect(within(north).getByText("Karim Uddin")).toBeInTheDocument();
    });

    it("keeps the branch heading when a name search leaves students of one branch", async () => {
      renderWithQuery(<AdminAttendanceGridPage />);
      await searchClass5();
      await screen.findByRole("region", { name: "Main Campus" });

      fireEvent.change(screen.getByPlaceholderText("Search by student name or roll number…"), { target: { value: "Karim" } });

      expect(within(screen.getByRole("region", { name: "North Branch" })).getByText("Karim Uddin")).toBeInTheDocument();
      expect(screen.queryByRole("region", { name: "Main Campus" })).not.toBeInTheDocument();
    });

    it("exports a Branch column", async () => {
      renderWithQuery(<AdminAttendanceGridPage />);
      await searchClass5();
      await screen.findByRole("region", { name: "Main Campus" });

      fireEvent.click(screen.getByRole("button", { name: "Export Excel" }));

      await waitFor(() => expect(xlsx.utils.aoa_to_sheet).toHaveBeenCalledTimes(1));
      const [headers, rahim, karim] = xlsx.utils.aoa_to_sheet.mock.calls[0][0];
      expect(headers.slice(0, 4)).toEqual(["#", "Roll", "Student Name", "Branch"]);
      expect(rahim.slice(2, 4)).toEqual(["Rahim Uddin", "Main Campus"]);
      expect(karim.slice(2, 4)).toEqual(["Karim Uddin", "North Branch"]);
    });
  });

  describe("in one branch", () => {
    beforeEach(() => {
      attendance.getGrid.mockResolvedValue({
        success: true,
        data: { branches: [MAIN], students: [student(1, "Rahim", MAIN), student(3, "Nadia", MAIN)] },
      });
    });

    it("shows one table and the branch's name in the header", async () => {
      renderWithQuery(<AdminAttendanceGridPage />);
      await searchClass5();

      expect(await screen.findByText("Rahim Uddin")).toBeInTheDocument();
      expect(screen.getByText("Main Campus")).toBeInTheDocument();
      expect(screen.queryByRole("region", { name: "Main Campus" })).not.toBeInTheDocument();
    });

    it("exports no Branch column", async () => {
      renderWithQuery(<AdminAttendanceGridPage />);
      await searchClass5();
      await screen.findByText("Rahim Uddin");

      fireEvent.click(screen.getByRole("button", { name: "Export Excel" }));

      await waitFor(() => expect(xlsx.utils.aoa_to_sheet).toHaveBeenCalledTimes(1));
      expect(xlsx.utils.aoa_to_sheet.mock.calls[0][0][0]).not.toContain("Branch");
    });
  });
});
