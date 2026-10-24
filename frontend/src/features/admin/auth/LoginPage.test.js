import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import LoginPage from "./LoginPage";

const replace = vi.fn();
const login = vi.fn();
const getBranches = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/auth.service", () => ({ authService: { login: (body) => login(body) } }));
vi.mock("axios", () => ({ default: { get: (...args) => getBranches(...args) } }));

const BRANCHES = [
  { id: 1, name_en: "Main", name_bn: "প্রধান" },
  { id: 2, name_en: "North", name_bn: "উত্তর" },
  { id: 3, name_en: "Coming soon", is_proposed: 1 },
];

const fillCredentials = ({ email = "admin@school.test", password = "secret123" } = {}) => {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
};
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

async function logInToBranch(branchId, credentials) {
  render(<LoginPage />);
  await screen.findByRole("option", { name: "Main" });
  fireEvent.change(screen.getByLabelText("Branch"), { target: { value: String(branchId) } });
  fillCredentials(credentials);
  submit();
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBranches.mockResolvedValue({ data: { data: BRANCHES } });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ token: null, isAuthenticated: false, role: null, branchId: null });
    useBranchStore.getState().resetBranch();
  });

  it("asks a branch admin for their branch, listing only open branches", async () => {
    render(<LoginPage />);

    expect(screen.getByRole("radio", { name: /Branch admin/ })).toBeChecked();
    expect(await screen.findByRole("option", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "North" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Coming soon" })).not.toBeInTheDocument();
  });

  it("shows branch names in Bangla when the page is in Bangla", async () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<LoginPage />);

    expect(await screen.findByRole("option", { name: "প্রধান" })).toBeInTheDocument();
  });

  it("says so when the branches cannot be loaded", async () => {
    getBranches.mockRejectedValue(new Error("offline"));
    render(<LoginPage />);

    expect(await screen.findByText(/Couldn't load the branches/)).toBeInTheDocument();
  });

  it("logs a super admin in to every branch, without asking for a branch", async () => {
    useBranchStore.getState().lockBranch(2, "North");
    login.mockResolvedValue({ token: "tok", role: "super_admin", branch_id: null, branchName: null });
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("radio", { name: /Super admin/ }));
    expect(screen.queryByLabelText("Branch")).not.toBeInTheDocument();
    fillCredentials();
    submit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/dashboard"));
    expect(login).toHaveBeenCalledWith({ Email: "admin@school.test", Password: "secret123", branch_id: null });
    expect(useAuthStore.getState()).toMatchObject({ token: "tok", role: "super_admin", branchId: null });
    expect(useBranchStore.getState()).toMatchObject({ currentBranchId: null, currentBranchName: "All Branches" });
  });

  it("logs a branch admin in to their branch only", async () => {
    login.mockResolvedValue({ token: "tok", role: "branch_admin", branch_id: 2, branchName: "North" });

    await logInToBranch(2);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/dashboard"));
    expect(login).toHaveBeenCalledWith({ Email: "admin@school.test", Password: "secret123", branch_id: 2 });
    expect(useAuthStore.getState()).toMatchObject({ token: "tok", role: "branch_admin", branchId: 2 });
    expect(useBranchStore.getState()).toMatchObject({ currentBranchId: 2, currentBranchName: "North" });
  });

  it("needs a branch before a branch admin can sign in", async () => {
    render(<LoginPage />);
    await screen.findByRole("option", { name: "Main" });

    fillCredentials();
    submit();

    expect(login).not.toHaveBeenCalled();
  });

  it("shows and hides the password", () => {
    render(<LoginPage />);
    const password = screen.getByLabelText("Password");

    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("shows the server's message and stays on the page when the login is refused", async () => {
    login.mockRejectedValue({ response: { status: 401, data: { error: "Invalid email or password." } } });

    await logInToBranch(1, { password: "wrong-pass" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(replace).not.toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
