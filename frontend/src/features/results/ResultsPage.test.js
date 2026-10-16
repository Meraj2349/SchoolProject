import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import ResultsPage from "./ResultsPage";

const results = vi.hoisted(() => ({ search: vi.fn() }));
const exams = vi.hoisted(() => ({ getPublicNames: vi.fn(async () => ({ success: true, data: ["Annual Exam 2026", "Half Yearly 2026"] })) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/results" }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/results.service", () => ({ resultsService: results }));
vi.mock("@/services/exams.service", () => ({ examsService: exams }));
vi.mock("@/lib/httpClient", () => ({ default: { get: vi.fn(() => Promise.reject(new Error("components must not call httpClient"))) } }));
vi.mock("@/services/classes.service", () => ({
  classesService: { getNames: async () => ["Class 5"], getStandardSections: async () => ["Good"] },
}));

async function fillAndSearch() {
  await screen.findByRole("option", { name: "Class 5" });
  fireEvent.change(screen.getByLabelText(/Class Name/), { target: { value: "Class 5" } });
  await screen.findByRole("option", { name: "Good" });
  fireEvent.change(screen.getByLabelText(/^Section/), { target: { value: "Good" } });
  fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: " Rahim " } });
  fireEvent.change(screen.getByLabelText(/Roll Number/), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Search Results" }));
}

describe("ResultsPage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    results.search.mockReset();
  });

  it("has one class and one section field, and exam names from the exams service", async () => {
    const { container } = renderWithQuery(<ResultsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Student Results" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Class Name/)).toHaveLength(1);
    expect(screen.getAllByLabelText(/^Section/)).toHaveLength(1);
    const examInput = screen.getByLabelText(/Exam Name/);
    const suggestions = container.querySelector(`#${examInput.getAttribute("list")}`);
    await vi.waitFor(() => expect([...suggestions.options].map((o) => o.value)).toEqual(["Annual Exam 2026", "Half Yearly 2026"]));
  });

  it("asks for the required fields before searching", async () => {
    renderWithQuery(<ResultsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Search Results" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Please fill in all required fields.");
    expect(results.search).not.toHaveBeenCalled();
  });

  it("shows the results with grades", async () => {
    results.search.mockResolvedValue({
      success: true,
      data: [
        { FirstName: "Rahim", LastName: "Uddin", ClassName: "Class 5", Section: "Good", SubjectName: "Math", ExamName: "Annual Exam 2026", MarksObtained: 92, TotalMarks: 100 },
        { FirstName: "Rahim", LastName: "Uddin", ClassName: "Class 5", Section: "Good", SubjectName: "English", ExamName: "Annual Exam 2026", MarksObtained: 30, TotalMarks: 100 },
      ],
    });
    renderWithQuery(<ResultsPage />);
    await fillAndSearch();

    const rows = within(await screen.findByRole("table")).getAllByRole("row");
    expect(results.search).toHaveBeenCalledWith({ firstName: "Rahim", rollNumber: "7", className: "Class 5", section: "Good", examName: undefined });
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByText("A+")).toBeInTheDocument();
    expect(within(rows[2]).getByText("F")).toBeInTheDocument();
  });

  it("says so when there are no results or the search fails", async () => {
    results.search.mockResolvedValueOnce({ success: true, data: [] });
    renderWithQuery(<ResultsPage />);
    await fillAndSearch();
    expect(await screen.findByText("No results found.")).toBeInTheDocument();

    results.search.mockRejectedValueOnce(new Error("boom"));
    fireEvent.change(screen.getByLabelText(/Roll Number/), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Search Results" }));
    expect(await screen.findByText("Failed to fetch results.")).toBeInTheDocument();
  });
});
