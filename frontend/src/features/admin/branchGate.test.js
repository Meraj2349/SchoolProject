import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import ApplicationsPage from "./applications/AdminPage";
import AttendancePage from "./attendance/AdminPage";
import ExamsPage from "./exams/AdminPage";
import ResultsPage from "./results/AdminPage";
import RoutinePage from "./routine/AdminPage";
import StudentsPage from "./studentList/AdminPage";
import SubjectsPage from "./subject/AdminPage";
import TeachersPage from "./teacherList/AdminPage";

// Every read answers an empty list, whichever shape a service expects
// (a bare array or { success, data }); writes must not happen at all.
const emptyList = () => Object.assign([], { success: true, data: [] });
const http = vi.hoisted(() => ({
  get: vi.fn(async () => ({ data: emptyList() })),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@/lib/httpClient", () => ({ default: http, isExpiredSession: () => false }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/admin" }));

// Buttons that add, change or remove records.
const WRITE_BUTTON = /^(\+\s*)?(add|create|new|save|submit|delete|remove|edit|update|upload|mark|accept|reject|approve)\b/i;

describe.each([
  ["Students", StudentsPage],
  ["Teachers", TeachersPage],
  ["Subjects", SubjectsPage],
  ["Routine", RoutinePage],
  ["Exams", ExamsPage],
  ["Results", ResultsPage],
  ["Attendance", AttendancePage],
  ["Applications", ApplicationsPage],
])("%s page", (_name, Page) => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null, currentBranchName: null });
  });

  it("asks a super admin on All branches to choose a branch, and offers no way to change records", async () => {
    renderWithQuery(<Page />);

    expect(await screen.findByText(/Choose a branch in the top bar/)).toBeInTheDocument();
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    const writes = screen.queryAllByRole("button").filter((b) => WRITE_BUTTON.test(b.textContent.trim() || b.getAttribute("aria-label") || b.title));
    expect(writes.map((b) => b.textContent.trim() || b.getAttribute("aria-label") || b.title)).toEqual([]);
  });

  it("shows no notice once a branch is chosen", async () => {
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main" });

    renderWithQuery(<Page />);

    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(screen.queryByText(/Choose a branch in the top bar/)).not.toBeInTheDocument();
  });
});
