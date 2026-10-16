import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import StudentListPage from "./StudentListPage";

const images = vi.hoisted(() => ({
  getAll: vi.fn(async () => [{ ImageID: 1, ImageType: "student", StudentID: 11, ImagePath: "/uploads/students/rahim.png" }]),
  getByStudent: vi.fn(async () => []),
}));
const students = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/students" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/images.service", () => ({ imagesService: images }));
vi.mock("@/services/students.service", () => ({ studentsService: students }));
vi.mock("@/services/classes.service", () => ({
  classesService: { getNames: async () => ["Class 5", "Class 6"], getStandardSections: async () => ["Better", "Good"] },
}));

const rahim = { StudentID: 11, FirstName: "Rahim", LastName: "Uddin", RollNumber: 7, ClassName: "Class 5", Section: "Good", Gender: "Male", DateOfBirth: "2014-05-09" };

async function fillAndSearch() {
  await screen.findByRole("option", { name: "Class 5" });
  fireEvent.change(screen.getByLabelText(/Class Name/), { target: { value: "Class 5" } });
  await screen.findByRole("option", { name: "Good" });
  fireEvent.change(screen.getByLabelText(/^Section/), { target: { value: "Good" } });
  fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: " rahim " } });
  fireEvent.change(screen.getByLabelText(/Roll Number/), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Search Students" }));
}

describe("StudentListPage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    images.getAll.mockClear();
    images.getByStudent.mockClear();
    students.search.mockReset();
  });

  it("asks for every field before searching", async () => {
    renderWithQuery(<StudentListPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Student Search" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Search Students" }));
    expect(await screen.findByText("Please fill in all search fields.")).toBeInTheDocument();
    expect(students.search).not.toHaveBeenCalled();
  });

  it("shows only exact matches, with the photo from one images request", async () => {
    students.search.mockResolvedValue({ success: true, data: [rahim, { ...rahim, StudentID: 12, FirstName: "Rahima", RollNumber: 17 }] });
    renderWithQuery(<StudentListPage />);
    await fillAndSearch();

    expect(await screen.findByRole("heading", { level: 3, name: "Rahim Uddin" })).toBeInTheDocument();
    expect(students.search).toHaveBeenCalledWith({ FirstName: "rahim", RollNumber: "7", ClassName: "Class 5", Section: "Good" });
    expect(screen.queryByRole("heading", { level: 3, name: /Rahima/ })).not.toBeInTheDocument();
    expect(screen.getByText("1 student found")).toBeInTheDocument();
    expect(screen.getByText("9 May 2014")).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "Rahim Uddin" })).toHaveAttribute("data-src", "http://localhost:3000/uploads/students/rahim.png");
    expect(images.getByStudent).not.toHaveBeenCalled();
    expect(images.getAll).toHaveBeenCalledTimes(1);
  });

  it("says so when nobody matches, and shows its own message when the search fails", async () => {
    students.search.mockResolvedValueOnce({ success: true, data: [] });
    renderWithQuery(<StudentListPage />);
    await fillAndSearch();
    expect(await screen.findByText("No students found matching your exact criteria.")).toBeInTheDocument();

    students.search.mockRejectedValueOnce(new Error("ER_BAD_FIELD_ERROR: secret column"));
    fireEvent.change(screen.getByLabelText(/Roll Number/), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Search Students" }));
    expect(await screen.findByText("An error occurred while searching")).toBeInTheDocument();
    expect(screen.queryByText(/secret column/)).not.toBeInTheDocument();
  });

  it("clears the search with Reset", async () => {
    students.search.mockResolvedValue({ success: true, data: [rahim] });
    renderWithQuery(<StudentListPage />);
    await fillAndSearch();
    await screen.findByRole("heading", { level: 3, name: "Rahim Uddin" });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/)).toHaveValue("");
  });
});
