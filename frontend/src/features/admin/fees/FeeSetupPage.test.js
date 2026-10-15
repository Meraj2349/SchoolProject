import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import FeeSetupPage from "./FeeSetupPage";

const api = vi.hoisted(() => ({
  getStructures: vi.fn(), createStructure: vi.fn(), updateStructure: vi.fn(), deleteStructure: vi.fn(),
  getHeads: vi.fn(), createHead: vi.fn(), updateHead: vi.fn(), deleteHead: vi.fn(),
  getSettings: vi.fn(), updateSettings: vi.fn(),
}));
vi.mock("@/services/fees.service", () => ({ feesService: api }));
vi.mock("@/services/classes.service", () => ({ classesService: { getNames: async () => ["Class 5", "Class 6", "Class 7"] } }));
vi.mock("@/lib/dates", () => ({ localDateString: () => "2026-03-15" }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() }, ToastContainer: () => null }));

const tuitionRow = (name) => screen.getByText(name).closest("tr");

describe("Fee setup page", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset().mockResolvedValue({ success: true }));
    api.getStructures.mockResolvedValue({ success: true, data: [{ id: 1, class_name: "Class 5", academic_year: 2026, monthly_tuition: "1500.00" }] });
    api.getHeads.mockResolvedValue({ success: true, data: [{ id: 4, name_en: "Exam fee", name_bn: "পরীক্ষা ফি", default_amount: "300.00", active: 1 }] });
    api.getSettings.mockResolvedValue({ success: true, data: { due_day: 10, late_fine: "50.00", receipt_prefix: "MC" } });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1 });
  });

  it("lists this year's class tuition", async () => {
    renderWithQuery(<FeeSetupPage />);

    expect(await screen.findByText("Class 5")).toBeInTheDocument();
    expect(api.getStructures).toHaveBeenCalledWith({ academic_year: 2026 });
    expect(within(tuitionRow("Class 5")).getByText("৳1,500.00")).toBeInTheDocument();
  });

  it("adds tuition for a class", async () => {
    renderWithQuery(<FeeSetupPage />);
    await screen.findByText("Class 5");

    fireEvent.click(screen.getByRole("button", { name: "Add tuition" }));
    const drawer = screen.getByRole("dialog", { name: "Add tuition" });
    fireEvent.change(await within(drawer).findByLabelText("Class", { exact: false }), { target: { value: "Class 6" } });
    fireEvent.change(within(drawer).getByLabelText("Monthly tuition", { exact: false }), { target: { value: "1800" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.createStructure).toHaveBeenCalledWith({ class_name: "Class 6", academic_year: "2026", monthly_tuition: "1800" }));
  });

  it("edits and deletes tuition", async () => {
    renderWithQuery(<FeeSetupPage />);
    await screen.findByText("Class 5");

    fireEvent.click(within(tuitionRow("Class 5")).getByRole("button", { name: "Edit" }));
    const drawer = screen.getByRole("dialog", { name: "Edit tuition" });
    fireEvent.change(within(drawer).getByLabelText("Monthly tuition", { exact: false }), { target: { value: "1600" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(api.updateStructure).toHaveBeenCalledWith(1, { class_name: "Class 5", academic_year: "2026", monthly_tuition: "1600" }));

    fireEvent.click(within(tuitionRow("Class 5")).getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Delete this item?" })).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(api.deleteStructure).toHaveBeenCalledWith(1));
  });

  it("adds a fee head", async () => {
    renderWithQuery(<FeeSetupPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Fee heads" }));
    await screen.findByText("Exam fee");

    fireEvent.click(screen.getByRole("button", { name: "Add fee head" }));
    const drawer = screen.getByRole("dialog", { name: "Add fee head" });
    fireEvent.change(within(drawer).getByLabelText("Name (English)", { exact: false }), { target: { value: "Transport" } });
    fireEvent.change(within(drawer).getByLabelText("Default amount", { exact: false }), { target: { value: "600" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.createHead).toHaveBeenCalledWith({ name_en: "Transport", name_bn: "", default_amount: "600", active: true }),
    );
  });

  it("saves the billing settings", async () => {
    renderWithQuery(<FeeSetupPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));
    const lateFine = await screen.findByLabelText("Late fine", { exact: false });
    await waitFor(() => expect(lateFine).toHaveValue("50"));

    fireEvent.change(lateFine, { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.updateSettings).toHaveBeenCalledWith({ due_day: "10", late_fine: "100", receipt_prefix: "MC" }));
  });

  it("shows the newly chosen branch's settings after switching branch", async () => {
    useAuthStore.setState({ role: "super_admin" });
    api.getSettings.mockImplementation(async () => ({
      success: true,
      data: { due_day: useBranchStore.getState().currentBranchId === 2 ? 5 : 10, late_fine: "50.00", receipt_prefix: "MC" },
    }));
    renderWithQuery(<FeeSetupPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));
    await waitFor(() => expect(screen.getByLabelText("Due day of the month", { exact: false })).toHaveValue("10"));

    act(() => useBranchStore.getState().setBranch(2, "North"));
    await waitFor(() => expect(screen.getByLabelText("Due day of the month", { exact: false })).toHaveValue("5"));

    // Back to branch 1, whose settings are already cached.
    act(() => useBranchStore.getState().setBranch(1, "Main"));
    await waitFor(() => expect(screen.getByLabelText("Due day of the month", { exact: false })).toHaveValue("10"));
  });

  it("shows the server's message when saving fails", async () => {
    api.createStructure.mockRejectedValue({ response: { data: { message: "Tuition for this class and year already exists." } } });
    renderWithQuery(<FeeSetupPage />);
    await screen.findByText("Class 5");

    fireEvent.click(screen.getByRole("button", { name: "Add tuition" }));
    const drawer = screen.getByRole("dialog", { name: "Add tuition" });
    fireEvent.change(await within(drawer).findByLabelText("Class", { exact: false }), { target: { value: "Class 5" } });
    fireEvent.change(within(drawer).getByLabelText("Monthly tuition", { exact: false }), { target: { value: "1500" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));

    expect(await within(drawer).findByRole("alert")).toHaveTextContent("already exists");
  });

  it("asks a super admin on all branches to pick a branch first", () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null });
    renderWithQuery(<FeeSetupPage />);

    expect(screen.getByRole("note")).toHaveTextContent("Choose a branch");
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(api.getSettings).not.toHaveBeenCalled();
  });
});
