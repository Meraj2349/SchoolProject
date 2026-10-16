import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import JobApplicationsPage from "./JobApplicationsPage";

const ROWS = [
  { id: 7, circular_id: 1, post_title_en: "Accountant", post_title_bn: "অ্যাকাউন্টেন্ট", full_name: "Nusrat Jahan", phone: "01712345678", email: "nj@example.com", education: "MA", address: "Natiapara", experience: null, cv_file: "cv-1.pdf", status: "new", created_at: "2026-10-05T10:00:00Z", branch_id: 1 },
  { id: 8, circular_id: 1, post_title_en: "Accountant", post_title_bn: "অ্যাকাউন্টেন্ট", full_name: "Karim Uddin", phone: "01812345678", education: "BCom", address: "Delduar", cv_file: null, status: "shortlisted", created_at: "2026-10-06T10:00:00Z", branch_id: 1 },
];
const service = vi.hoisted(() => ({ getAll: vi.fn(), setStatus: vi.fn(), remove: vi.fn(), downloadCv: vi.fn(), getCounts: vi.fn() }));
const circulars = vi.hoisted(() => ({ getAll: vi.fn() }));
vi.mock("@/services/jobApplications.service", () => ({ jobApplicationsService: service }));
vi.mock("@/services/jobCirculars.service", () => ({ jobCircularsService: circulars }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [{ id: 1, name_en: "Main Campus" }] } }));

describe("JobApplicationsPage", () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.getAll.mockResolvedValue(ROWS);
    service.setStatus.mockResolvedValue({ success: true });
    circulars.getAll.mockResolvedValue([{ id: 1, title_en: "Urgent recruitment", title_bn: "জরুরি নিয়োগ", posts: [] }]);
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main Campus" });
    globalThis.URL.createObjectURL = vi.fn(() => "blob:cv");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("lists applications, starting from the circular in the link", async () => {
    renderWithQuery(<JobApplicationsPage initialCircularId="1" />);

    const row = (await screen.findByText("Nusrat Jahan")).closest("tr");
    expect(within(row).getByText("Accountant")).toBeInTheDocument();
    expect(within(row).getByText("New")).toBeInTheDocument();
    expect(service.getAll).toHaveBeenCalledWith({ circularId: "1", status: "" });
    expect(await screen.findByRole("option", { name: "Urgent recruitment" })).toBeInTheDocument();
    expect(screen.getByLabelText("Circular")).toHaveValue("1");
  });

  it("filters by status", async () => {
    renderWithQuery(<JobApplicationsPage />);
    await screen.findByText("Nusrat Jahan");

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "shortlisted" } });

    await waitFor(() => expect(service.getAll).toHaveBeenLastCalledWith({ circularId: "", status: "shortlisted" }));
  });

  it("shows an applicant's details, downloads the CV with the admin's login and changes the status", async () => {
    service.downloadCv.mockResolvedValue(new Blob(["%PDF"], { type: "application/pdf" }));
    renderWithQuery(<JobApplicationsPage />);
    fireEvent.click(within((await screen.findByText("Nusrat Jahan")).closest("tr")).getByRole("button", { name: "Details" }));
    const drawer = screen.getByRole("dialog", { name: "Nusrat Jahan" });

    expect(within(drawer).getByRole("link", { name: "01712345678" })).toHaveAttribute("href", "tel:01712345678");
    expect(within(drawer).getByText("MA")).toBeInTheDocument();
    fireEvent.click(within(drawer).getByRole("button", { name: "Download CV" }));
    await waitFor(() => expect(service.downloadCv).toHaveBeenCalledWith(7));
    expect(URL.createObjectURL).toHaveBeenCalled();
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cv"), { timeout: 2000 }); // later, so the download is not cut off

    fireEvent.change(within(drawer).getByLabelText("Status"), { target: { value: "hired" } });
    await waitFor(() => expect(service.setStatus).toHaveBeenCalledWith(7, "hired"));
  });

  it("says when an applicant sent no CV", async () => {
    renderWithQuery(<JobApplicationsPage />);
    fireEvent.click(within((await screen.findByText("Karim Uddin")).closest("tr")).getByRole("button", { name: "Details" }));

    const drawer = screen.getByRole("dialog", { name: "Karim Uddin" });
    expect(within(drawer).getByText("No CV attached")).toBeInTheDocument();
    expect(within(drawer).queryByRole("button", { name: "Download CV" })).not.toBeInTheDocument();
  });
});
