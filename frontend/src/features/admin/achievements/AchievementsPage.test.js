import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AchievementsPage from "./AchievementsPage";

const ROWS = [
  { id: 1, title_en: "SSC 2025", title_bn: "এসএসসি", category: "board_result", year: 2025, exam_name: "SSC", examinees: 120, passed: 118, gpa5: 42, is_featured: 1, is_published: 1, branch_id: 1 },
  { id: 2, title_en: "Football champions", title_bn: "ফুটবল", category: "sports", year: 2024, is_featured: 0, is_published: 1, branch_id: null },
];
const service = vi.hoisted(() => ({ getAll: vi.fn(), create: vi.fn(), update: vi.fn(), setPublished: vi.fn(), remove: vi.fn() }));
vi.mock("@/services/achievements.service", () => ({ achievementsService: service }));
vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: async () => [{ id: 1, name_en: "Main Campus" }, { id: 2, name_en: "North Campus" }] },
}));

const rowOf = async (title) => (await screen.findByText(title)).closest("tr");

describe("AchievementsPage", () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.getAll.mockResolvedValue(ROWS);
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main Campus" });
  });

  it("shows each achievement's category, result and branch", async () => {
    renderWithQuery(<AchievementsPage />);

    const ssc = await rowOf("SSC 2025");
    expect(within(ssc).getByText("Board result")).toBeInTheDocument();
    expect(within(ssc).getByText("98.3% pass · 42 GPA-5")).toBeInTheDocument();
    expect(within(ssc).getByText("Featured")).toBeInTheDocument();
    expect(await within(ssc).findByText("Main Campus")).toBeInTheDocument();
  });

  it("lets a branch admin change only their own branch's achievements", async () => {
    renderWithQuery(<AchievementsPage />);

    expect(within(await rowOf("SSC 2025")).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    const school = await rowOf("Football champions");
    expect(within(school).getByText("Whole school")).toBeInTheDocument();
    expect(within(school).queryByRole("button", { name: /edit|delete/i })).not.toBeInTheDocument();
    expect(within(school).getByLabelText("Only the super admin can change this.")).toBeInTheDocument();
  });

  it("asks for the exam numbers only for a board result", async () => {
    renderWithQuery(<AchievementsPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Add achievement" }));
    const drawer = screen.getByRole("dialog", { name: "Add achievement" });

    fireEvent.change(within(drawer).getByLabelText(/Category/), { target: { value: "sports" } });
    expect(within(drawer).queryByLabelText(/Examinees/)).not.toBeInTheDocument();

    fireEvent.change(within(drawer).getByLabelText(/Category/), { target: { value: "board_result" } });
    fireEvent.change(within(drawer).getByLabelText(/Examinees/), { target: { value: "200" } });
    fireEvent.change(within(drawer).getByLabelText(/^Passed/), { target: { value: "150" } });
    expect(within(drawer).getByText("Pass rate: 75%")).toBeInTheDocument();
  });

  it("saves a new achievement and shows the server's message when it is refused", async () => {
    service.create.mockRejectedValue({ response: { data: { message: "Enter a valid year." } } });
    renderWithQuery(<AchievementsPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Add achievement" }));
    const drawer = screen.getByRole("dialog", { name: "Add achievement" });

    fireEvent.change(within(drawer).getByLabelText(/Title \(English\)/), { target: { value: "Debate" } });
    fireEvent.change(within(drawer).getByLabelText(/Title \(Bangla\)/), { target: { value: "বিতর্ক" } });
    fireEvent.change(within(drawer).getByLabelText(/Category/), { target: { value: "competition" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));

    expect(await within(drawer).findByRole("alert")).toHaveTextContent("Enter a valid year.");
    await waitFor(() => expect(service.create).toHaveBeenCalledTimes(1));
    expect(service.create.mock.calls[0][0].get("title_en")).toBe("Debate");
  });
});
