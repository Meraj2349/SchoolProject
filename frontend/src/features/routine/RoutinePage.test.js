import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import RoutinePage from "./RoutinePage";

const routines = vi.hoisted(() => ({ getAll: vi.fn(), getFilterOptions: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/routine" }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/routines.service", () => ({ routinesService: routines }));

const ROUTINES = [
  { RoutineID: 1, RoutineTitle: "Class 5 weekly routine", ClassName: "Class 5", Section: "Good", RoutineDate: "2026-10-05", CreatedDate: "2026-10-01", FileURL: "/uploads/routines/c5.pdf", FileType: "pdf" },
  { RoutineID: 2, RoutineTitle: "Class 6 exam routine", ClassName: "Class 6", Section: "Better", RoutineDate: "2026-11-20", FileURL: "https://res.cloudinary.com/demo/c6.png", FileType: "image" },
];

const titles = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("RoutinePage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    routines.getAll.mockReset().mockResolvedValue({ routines: ROUTINES });
    routines.getFilterOptions.mockReset().mockResolvedValue({ options: { classes: ["Class 5", "Class 6"], sections: ["Better", "Good"] } });
  });

  it("keeps the page shell while loading", () => {
    routines.getAll.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<RoutinePage />);

    expect(screen.getByRole("heading", { level: 1, name: "School Routines" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading routines…");
  });

  it("lists routines newest first, with server files linked to the API", async () => {
    renderWithQuery(<RoutinePage />);

    expect(await screen.findByRole("heading", { level: 3, name: "Class 6 exam routine" })).toBeInTheDocument();
    expect(titles()).toEqual(["Class 6 exam routine", "Class 5 weekly routine"]);
    const pdf = screen.getByRole("heading", { level: 3, name: "Class 5 weekly routine" }).closest("article");
    expect(within(pdf).getByRole("link", { name: /View PDF/ })).toHaveAttribute("href", "http://localhost:3000/uploads/routines/c5.pdf");
    expect(within(pdf).getByText("5 Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("2 Routines Found")).toBeInTheDocument();
  });

  it("filters by class, section and search", async () => {
    renderWithQuery(<RoutinePage />);
    await screen.findByRole("heading", { level: 3, name: "Class 6 exam routine" });

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "Class 5" } });
    expect(titles()).toEqual(["Class 5 weekly routine"]);
    fireEvent.change(screen.getByLabelText("Section"), { target: { value: "Better" } });
    expect(screen.getByText("No Routines Found")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));
    fireEvent.change(screen.getByLabelText("Search routines"), { target: { value: "exam" } });
    expect(titles()).toEqual(["Class 6 exam routine"]);
  });

  it("translates the file badges and dates into Bangla", async () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<RoutinePage />);

    const pdf = (await screen.findByRole("heading", { level: 3, name: "Class 5 weekly routine" })).closest("article");
    expect(within(pdf).getByText("পিডিএফ")).toBeInTheDocument();
    expect(within(pdf).getByText(/৫ অক্টো/)).toBeInTheDocument();
    expect(screen.queryByText("IMG")).not.toBeInTheDocument();
  });
});
