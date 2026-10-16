import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import JobCircularsPage from "./JobCircularsPage";

const POST = { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1, salary_min: 10000, salary_max: 20000 };
const ROWS = [
  { id: 1, title_en: "Urgent recruitment", title_bn: "জরুরি নিয়োগ", circular_date: "2026-10-01", deadline: "2026-10-31", posts: [POST], is_open: true, is_published: true, accepting: true, branch_id: 1 },
  { id: 2, title_en: "School-wide circular", title_bn: "সব শাখার বিজ্ঞপ্তি", circular_date: "2025-06-28", deadline: null, posts: [POST], is_open: false, is_published: true, accepting: false, branch_id: null },
];
const service = vi.hoisted(() => ({ getAll: vi.fn(), create: vi.fn(), update: vi.fn(), setPublished: vi.fn(), remove: vi.fn() }));
const applications = vi.hoisted(() => ({ getCounts: vi.fn() }));
vi.mock("@/services/jobCirculars.service", () => ({ jobCircularsService: service }));
vi.mock("@/services/jobApplications.service", () => ({ jobApplicationsService: applications }));
vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: async () => [{ id: 1, name_en: "Main Campus" }, { id: 2, name_en: "North Campus" }] },
}));

const rowOf = async (title) => (await screen.findByText(title)).closest("tr");
const openDrawer = async () => {
  fireEvent.click(await screen.findByRole("button", { name: "Add circular" }));
  return screen.getByRole("dialog", { name: "Add circular" });
};

describe("JobCircularsPage", () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.getAll.mockResolvedValue(ROWS);
    service.create.mockResolvedValue({ success: true });
    applications.getCounts.mockReset().mockResolvedValue({ 1: 3 });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main Campus" });
  });

  it("shows each circular's dates, posts, state and number of applications", async () => {
    renderWithQuery(<JobCircularsPage />);

    const own = await rowOf("Urgent recruitment");
    expect(within(own).getByText("1 Oct 2026")).toBeInTheDocument();
    expect(within(own).getByText("Open")).toBeInTheDocument();
    expect(within(own).getByRole("link", { name: "3" })).toHaveAttribute("href", "/admin/job-applications?circular=1");
    expect(within(await rowOf("School-wide circular")).getByText("Closed")).toBeInTheDocument();
  });

  it("lets a branch admin change only their branch's circulars", async () => {
    renderWithQuery(<JobCircularsPage />);

    expect(within(await rowOf("Urgent recruitment")).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(within(await rowOf("School-wide circular")).queryByRole("button", { name: /edit|delete/i })).not.toBeInTheDocument();
  });

  it("adds and removes posts, and checks them before saving", async () => {
    renderWithQuery(<JobCircularsPage />);
    const drawer = await openDrawer();

    fireEvent.click(within(drawer).getByRole("button", { name: "Add post" }));
    expect(within(drawer).getAllByRole("group", { name: /^Post \d$/ })).toHaveLength(2);
    fireEvent.click(within(drawer).getByRole("button", { name: "Remove post 2" }));
    expect(within(drawer).getAllByRole("group", { name: /^Post \d$/ })).toHaveLength(1);

    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));
    expect(within(drawer).getAllByText("Required").length).toBeGreaterThan(0);
    expect(service.create).not.toHaveBeenCalled();
  });

  it("saves a circular with its posts as JSON", async () => {
    renderWithQuery(<JobCircularsPage />);
    const drawer = await openDrawer();
    const post = within(drawer).getByRole("group", { name: "Post 1" });

    fireEvent.change(within(drawer).getByLabelText(/^Title \(English\)/), { target: { value: "Teachers wanted" } });
    fireEvent.change(within(drawer).getByLabelText(/^Title \(Bangla\)/), { target: { value: "শিক্ষক নিয়োগ" } });
    fireEvent.change(within(post).getByLabelText(/Post name \(English\)/), { target: { value: "Assistant Teacher" } });
    fireEvent.change(within(post).getByLabelText(/Post name \(Bangla\)/), { target: { value: "সহকারি শিক্ষক" } });
    fireEvent.change(within(post).getByLabelText(/Number of posts/), { target: { value: "2" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(service.create).toHaveBeenCalledTimes(1));
    const body = service.create.mock.calls[0][0];
    expect(body.get("title_en")).toBe("Teachers wanted");
    expect(JSON.parse(body.get("posts"))).toEqual([expect.objectContaining({ title_en: "Assistant Teacher", vacancies: 2 })]);
  });

  it("warns that deleting removes the circular's applications", async () => {
    renderWithQuery(<JobCircularsPage />);
    fireEvent.click(within(await rowOf("Urgent recruitment")).getByRole("button", { name: "Delete" }));

    expect(await screen.findByText(/Its 3 application\(s\) and their CVs will be deleted too/)).toBeInTheDocument();
  });
});
