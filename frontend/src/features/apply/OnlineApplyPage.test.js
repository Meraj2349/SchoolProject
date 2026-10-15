import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import OnlineApplyPage from "./OnlineApplyPage";

const submit = vi.fn();
vi.mock("@/services/application.service", () => ({ applicationService: { submit: (data) => submit(data) } }));
vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: async () => [{ id: 1, name_en: "Main", name_bn: "প্রধান" }, { id: 2, name_en: "North", name_bn: "উত্তর" }] },
}));
vi.mock("@/components/layout/Navbar", () => ({ default: () => null }));
vi.mock("@/components/layout/Footer", () => ({ default: () => null }));
vi.mock("@/components/shared/LatestUpdatesNotice", () => ({ default: () => null }));

const fill = (label, value) => fireEvent.change(screen.getByLabelText(new RegExp(label)), { target: { value } });

function fillRequired() {
  fill("Student Full Name", "Nusrat Jahan");
  fill("Date of Birth", "2016-03-03");
  fill("Gender", "female");
  fill("Applying for Class", "Class 3");
  fill("Parent / Guardian Name", "Jahan");
  fill("Parent Contact Number", "01700000000");
}

describe("OnlineApplyPage", () => {
  beforeEach(() => {
    submit.mockReset().mockResolvedValue({ success: true });
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null });
  });

  it("asks which branch the child is applying to", async () => {
    renderWithQuery(<OnlineApplyPage />);
    fillRequired();

    expect(await screen.findByRole("option", { name: "North" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText(/fill in all required fields/i)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("starts with the branch chosen on the website and sends it", async () => {
    useBranchStore.setState({ currentBranchId: 2 });
    renderWithQuery(<OnlineApplyPage />);
    fillRequired();

    await screen.findByRole("option", { name: "North" });
    expect(screen.getByLabelText(/Branch/)).toHaveValue("2");
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ branch_id: 2, applicant_name: "Nusrat Jahan" })));
  });

  it("picks up the website's branch when it loads after the form", async () => {
    renderWithQuery(<OnlineApplyPage />);
    await screen.findByRole("option", { name: "North" });

    act(() => useBranchStore.setState({ currentBranchId: 2 })); // saved choice restored late

    expect(screen.getByLabelText(/Branch/)).toHaveValue("2");
  });

  it("keeps the family's own choice of branch", async () => {
    useBranchStore.setState({ currentBranchId: 2 });
    renderWithQuery(<OnlineApplyPage />);
    await screen.findByRole("option", { name: "Main" });

    fireEvent.change(screen.getByLabelText(/Branch/), { target: { value: "1" } });

    expect(screen.getByLabelText(/Branch/)).toHaveValue("1");
  });
});
