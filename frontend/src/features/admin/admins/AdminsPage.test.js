import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminsPage from "./AdminsPage";

const admins = [
  { id: 1, username: "Boss", email: "boss@school.test", role: "super_admin", branch_id: null, branch_name: null, is_you: true },
  { id: 2, username: "Karim", email: "karim@school.test", role: "branch_admin", branch_id: 1, branch_name: "Main", is_you: false },
  { id: 3, username: "Nadia", email: "nadia@school.test", role: "branch_admin", branch_id: 2, branch_name: "North", is_you: false },
];
const branches = [
  { id: 1, name_en: "Main", name_bn: "প্রধান" },
  { id: 2, name_en: "North", name_bn: "উত্তর" },
  { id: 3, name_en: "South", name_bn: "দক্ষিণ" },
];

const api = vi.hoisted(() => ({ getAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), branches: vi.fn() }));
vi.mock("@/services/admins.service", () => ({
  adminsService: { getAll: api.getAll, create: api.create, update: api.update, remove: api.remove },
}));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: api.branches } }));

const rowOf = (name) => screen.getByText(name).closest("tr");
const fill = (form, label, value) =>
  fireEvent.change(within(form).getByLabelText(label, { exact: false }), { target: { value } });

async function openAddForm() {
  renderWithQuery(<AdminsPage />);
  await screen.findByText("Karim");
  fireEvent.click(screen.getByRole("button", { name: "Add admin" }));
  return screen.getByRole("dialog");
}

describe("Admins page", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.getAll.mockResolvedValue({ success: true, data: admins });
    api.branches.mockResolvedValue(branches);
    api.create.mockResolvedValue({ success: true });
    api.update.mockResolvedValue({ success: true });
    api.remove.mockResolvedValue({ success: true });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "super_admin" });
  });

  it("is only for super admins", async () => {
    useAuthStore.setState({ role: "branch_admin" });

    renderWithQuery(<AdminsPage />);

    expect(screen.getByText("Only super admins can manage admin accounts.")).toBeInTheDocument();
    expect(api.getAll).not.toHaveBeenCalled();
  });

  it("lists admins with their role and branch, and marks you", async () => {
    renderWithQuery(<AdminsPage />);

    expect(await screen.findByText("Karim")).toBeInTheDocument();
    expect(within(rowOf("Karim")).getByText("Branch admin")).toBeInTheDocument();
    expect(within(rowOf("Karim")).getByText("Main")).toBeInTheDocument();
    expect(within(rowOf("Boss")).getByText("Super admin")).toBeInTheDocument();
    expect(within(rowOf("Boss")).getByText("All branches")).toBeInTheDocument();
    expect(within(rowOf("Boss")).getByText("You")).toBeInTheDocument();
  });

  it("does not offer to remove your own account", async () => {
    renderWithQuery(<AdminsPage />);
    await screen.findByText("Karim");

    expect(within(rowOf("Boss")).queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(within(rowOf("Karim")).getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("warns about branches that have no admin, once the admins have loaded", async () => {
    let finish;
    api.getAll.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderWithQuery(<AdminsPage />);
    await screen.findByRole("option", { name: "South" }); // branches are in
    expect(screen.queryByRole("note")).not.toBeInTheDocument();

    finish({ success: true, data: admins });

    expect(await screen.findByRole("note")).toHaveTextContent("South");
    expect(screen.getByRole("note")).not.toHaveTextContent("North");
  });

  it("filters by branch", async () => {
    renderWithQuery(<AdminsPage />);
    await screen.findByText("Karim");

    fireEvent.change(screen.getByLabelText("Branch"), { target: { value: "2" } });

    expect(screen.getByText("Nadia")).toBeInTheDocument();
    expect(screen.queryByText("Karim")).not.toBeInTheDocument();
  });

  it("adds a branch admin", async () => {
    const form = await openAddForm();
    fill(form, "Name", "Rahim");
    fill(form, "Email", "rahim@school.test");
    fill(form, "Password", "secret123");
    fill(form, "Branch", "3");

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.create).toHaveBeenCalled());
    expect(api.create.mock.calls[0][0]).toEqual({
      Username: "Rahim",
      Email: "rahim@school.test",
      Password: "secret123",
      role: "branch_admin",
      branch_id: 3,
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("adds a super admin without a branch", async () => {
    const form = await openAddForm();
    fill(form, "Name", "Head");
    fill(form, "Email", "head@school.test");
    fill(form, "Password", "secret123");
    fill(form, "Role", "super_admin");

    expect(within(form).queryByLabelText("Branch", { exact: false })).not.toBeInTheDocument();
    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.create).toHaveBeenCalled());
    expect(api.create.mock.calls[0][0]).toMatchObject({ role: "super_admin", branch_id: null });
  });

  it("does not save an incomplete admin", async () => {
    const form = await openAddForm();
    fill(form, "Email", "nope");

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    expect(within(form).getAllByText("This field is required").length).toBeGreaterThan(0);
    expect(within(form).getByText("Enter a valid email address")).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();
  });

  it("moves an admin to another branch without touching the password", async () => {
    renderWithQuery(<AdminsPage />);
    await screen.findByText("Karim");

    fireEvent.click(within(rowOf("Karim")).getByRole("button", { name: "Edit" }));
    const form = screen.getByRole("dialog");
    expect(within(form).getByLabelText("Email", { exact: false })).toHaveValue("karim@school.test");
    expect(within(form).getByLabelText("Password", { exact: false })).toHaveValue("");
    fill(form, "Branch", "2");
    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.update).toHaveBeenCalled());
    expect(api.update.mock.calls[0][0]).toBe(2);
    expect(api.update.mock.calls[0][1]).toEqual({
      Username: "Karim",
      Email: "karim@school.test",
      role: "branch_admin",
      branch_id: 2,
    });
  });

  it("does not let you change your own role", async () => {
    renderWithQuery(<AdminsPage />);
    await screen.findByText("Karim");

    fireEvent.click(within(rowOf("Boss")).getByRole("button", { name: "Edit" }));

    expect(within(screen.getByRole("dialog")).getByLabelText("Role", { exact: false })).toBeDisabled();
  });

  it("shows the server's message when saving fails", async () => {
    api.create.mockRejectedValue({ response: { data: { message: "Another admin already logs in with this email." } } });
    const form = await openAddForm();
    fill(form, "Name", "Rahim");
    fill(form, "Email", "karim@school.test");
    fill(form, "Password", "secret123");
    fill(form, "Branch", "1");

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    expect(await within(form).findByRole("alert")).toHaveTextContent("Another admin already logs in with this email.");
  });

  it("removes an admin after confirming", async () => {
    renderWithQuery(<AdminsPage />);
    await screen.findByText("Karim");

    fireEvent.click(within(rowOf("Nadia")).getByRole("button", { name: "Remove" }));
    const dialog = screen.getByRole("dialog", { name: "Remove this admin?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));

    await waitFor(() => expect(api.remove).toHaveBeenCalledWith(3));
  });
});
