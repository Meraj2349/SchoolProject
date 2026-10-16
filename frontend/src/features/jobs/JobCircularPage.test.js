import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import JobCircularPage from "./JobCircularPage";

const POSTS = [
  { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1, salary_min: 10000, salary_max: 20000 },
  { title_en: "Assistant Teacher (Bangla)", title_bn: "সহকারি শিক্ষক (বাংলা)", vacancies: 1 },
];
const OPEN = { id: 5, title_en: "Teachers wanted", title_bn: "শিক্ষক নিয়োগ", circular_date: "2026-10-01", deadline: null, posts: POSTS, image_url: "/images/circulars/a.jpg", accepting: true, branch_id: null, how_to_apply_en: null, how_to_apply_bn: null };
const circulars = vi.hoisted(() => ({ getById: vi.fn() }));
const applications = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/jobs/5" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/jobCirculars.service", () => ({ jobCircularsService: circulars }));
vi.mock("@/services/jobApplications.service", () => ({ jobApplicationsService: applications }));

const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
async function fillForm() {
  await screen.findByRole("heading", { level: 2, name: "Apply online" });
  fill(/Post applied for/, "1");
  fill(/Full name/, "Nusrat Jahan");
  fill(/Mobile number/, "01712345678");
  fill(/Highest qualification/, "MA (Bangla)");
  fill(/^Address/, "Natiapara, Delduar");
}

describe("JobCircularPage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    circulars.getById.mockReset().mockResolvedValue(OPEN);
    applications.submit.mockReset().mockResolvedValue({ success: true, message: "Your application has been received.", data: { id: 9 } });
  });

  it("shows the circular, its poster and how to apply by hand", async () => {
    renderWithQuery(<JobCircularPage id="5" />);

    expect(await screen.findByRole("heading", { level: 1, name: "Teachers wanted" })).toBeInTheDocument();
    expect(circulars.getById).toHaveBeenCalledWith("5");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Job Circulars");
    expect(screen.getByRole("img", { name: "Teachers wanted" })).toHaveAttribute("data-src", "/images/circulars/a.jpg");
    const how = screen.getByRole("heading", { level: 2, name: "How to apply" }).closest("section");
    expect(within(how).getByText(/2 passport-size photos/)).toBeInTheDocument();
    expect(within(how).getByText(/Star Academic School \(Head Office\), Natiapara/)).toBeInTheDocument();
    expect(within(how).getByRole("link", { name: "01717-174064" })).toHaveAttribute("href", "tel:+8801717174064");
  });

  it("checks the form before sending it", async () => {
    renderWithQuery(<JobCircularPage id="5" />);
    await screen.findByRole("heading", { level: 2, name: "Apply online" });

    fireEvent.click(screen.getByRole("button", { name: "Send application" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Please correct the marked fields.");
    expect(screen.getByLabelText(/Full name/)).toHaveAttribute("aria-invalid", "true");
    expect(applications.submit).not.toHaveBeenCalled();
  });

  it("refuses a CV that is too big before uploading it", async () => {
    renderWithQuery(<JobCircularPage id="5" />);
    await fillForm();
    const big = new File(["x"], "cv.pdf", { type: "application/pdf" });
    Object.defineProperty(big, "size", { value: 6 * 1024 * 1024 });

    fireEvent.change(screen.getByLabelText(/^CV/), { target: { files: [big] } });
    fireEvent.click(screen.getByRole("button", { name: "Send application" }));

    expect(await screen.findByText("The CV must be 5 MB or smaller.")).toBeInTheDocument();
    expect(applications.submit).not.toHaveBeenCalled();
  });

  it("sends the application with the CV and shows the school's answer", async () => {
    renderWithQuery(<JobCircularPage id="5" />);
    await fillForm();
    fireEvent.change(screen.getByLabelText(/^CV/), { target: { files: [new File(["%PDF"], "cv.pdf", { type: "application/pdf" })] } });

    fireEvent.click(screen.getByRole("button", { name: "Send application" }));

    expect(await screen.findByRole("heading", { name: "Application sent" })).toBeInTheDocument();
    expect(screen.getByText("Your application has been received.")).toBeInTheDocument();
    const body = applications.submit.mock.calls[0][0];
    expect(body.get("circular_id")).toBe("5");
    expect(body.get("post_index")).toBe("1");
    expect(body.get("cv")).toBeInstanceOf(File);
  });

  it("shows the server's reason when it refuses", async () => {
    applications.submit.mockRejectedValue({ response: { status: 409, data: { message: "You have already applied for this post with this mobile number." } } });
    renderWithQuery(<JobCircularPage id="5" />);
    await fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Send application" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("You have already applied for this post with this mobile number.");
  });

  it("offers no form once the circular is closed", async () => {
    circulars.getById.mockResolvedValue({ ...OPEN, accepting: false });
    renderWithQuery(<JobCircularPage id="5" />);

    expect(await screen.findByText("This circular is no longer taking applications.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send application" })).not.toBeInTheDocument();
  });

  it("says when the circular does not exist", async () => {
    circulars.getById.mockRejectedValue({ response: { status: 404 } });
    renderWithQuery(<JobCircularPage id="99" />);

    await waitFor(() => expect(screen.getByText("This circular could not be found.")).toBeInTheDocument());
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
