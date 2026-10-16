import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import JobsPage from "./JobsPage";

const POST = { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1, qualification_en: "Honours / Masters (Accounting)", qualification_bn: "স্নাতক সম্মান / স্নাতকোত্তর (অ্যাকাউন্টিং)", salary_min: 10000, salary_max: 20000 };
const OPEN = { id: 5, title_en: "Teachers wanted", title_bn: "শিক্ষক নিয়োগ", circular_date: "2026-10-01", deadline: "2026-10-31", posts: [POST], image_url: "/uploads/job-circulars/c.pdf", accepting: true, branch_id: 1 };
const PAST = { id: 1, title_en: "Urgent recruitment: Accountant", title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি: অ্যাকাউন্টেন্ট", circular_date: "2025-06-28", deadline: null, posts: [POST], image_url: "/images/circulars/accountant-2025-06-28.jpg", accepting: false, branch_id: null };
const circulars = vi.hoisted(() => ({ getPublished: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/jobs" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [{ id: 1, name_en: "Natiapara Branch", name_bn: "নাটিয়াপাড়া শাখা" }] } }));
vi.mock("@/services/jobCirculars.service", () => ({ jobCircularsService: circulars }));

const cardOf = async (title) => (await screen.findByRole("heading", { level: 3, name: title })).closest("article");

describe("JobsPage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    circulars.getPublished.mockReset().mockResolvedValue([OPEN, PAST]);
  });

  it("shows open circulars with their posts and an Apply link, then past ones as closed", async () => {
    renderWithQuery(<JobsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Job Circulars" })).toBeInTheDocument();
    const open = await cardOf("Teachers wanted");
    expect(within(open).getByRole("cell", { name: "Accountant" })).toBeInTheDocument();
    expect(within(open).getByText("10,000 – 20,000 Tk")).toBeInTheDocument();
    expect(within(open).getByText("31 Oct 2026")).toBeInTheDocument();
    expect(await within(open).findByText("Natiapara Branch")).toBeInTheDocument();
    expect(within(open).getByRole("link", { name: /Apply online/ })).toHaveAttribute("href", "/jobs/5");
    expect(within(open).getByRole("link", { name: /View the circular/ })).toHaveAttribute("href", "http://localhost:3000/uploads/job-circulars/c.pdf");

    const past = await cardOf("Urgent recruitment: Accountant");
    expect(screen.getByRole("heading", { level: 2, name: "Past circulars" }).compareDocumentPosition(past) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(past).getByText("Closed")).toBeInTheDocument();
    expect(within(past).getByText("Until the posts are filled")).toBeInTheDocument();
    expect(within(past).queryByRole("link", { name: /Apply online/ })).not.toBeInTheDocument();
    expect(within(past).getByRole("link", { name: /View the circular/ })).toHaveAttribute("href", "/images/circulars/accountant-2025-06-28.jpg");
  });

  it("says so when nothing is open, and reads in Bangla", async () => {
    useLanguageStore.getState().setLanguage("bn");
    circulars.getPublished.mockResolvedValue([PAST]);
    renderWithQuery(<JobsPage />);

    expect(await screen.findByText(/এই মুহূর্তে কোনো পদে আবেদন চলছে না/)).toBeInTheDocument();
    const past = await cardOf("জরুরি নিয়োগ বিজ্ঞপ্তি: অ্যাকাউন্টেন্ট");
    expect(within(past).getByText("১০,০০০ – ২০,০০০ টাকা")).toBeInTheDocument();
    expect(within(past).getByText("১ জন")).toBeInTheDocument();
    expect(within(past).getByText("সব শাখা")).toBeInTheDocument();
  });

  it("shows an empty page and a load failure plainly", async () => {
    circulars.getPublished.mockResolvedValueOnce([]);
    const { unmount } = renderWithQuery(<JobsPage />);
    expect(await screen.findByText("No circulars right now")).toBeInTheDocument();
    unmount();

    circulars.getPublished.mockRejectedValueOnce(new Error("boom"));
    renderWithQuery(<JobsPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the job circulars.");
  });
});
