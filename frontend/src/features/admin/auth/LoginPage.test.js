import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import LoginPage from "./LoginPage";

const replace = vi.fn();
const login = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/auth.service", () => ({ authService: { login: (body) => login(body) } }));
vi.mock("axios", () => ({
  default: {
    get: vi.fn(async () => ({
      data: {
        data: [
          { id: 1, name_en: "Main" },
          { id: 2, name_en: "North" },
          { id: 3, name_en: "Coming soon", is_proposed: 1 },
        ],
      },
    })),
  },
}));

async function logInAs(branch, { email = "admin@school.test", password = "secret123" } = {}) {
  render(<LoginPage />);
  const select = await screen.findByRole("combobox");
  await screen.findByRole("option", { name: "Main" });
  fireEvent.change(select, { target: { value: branch } });
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
  fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ token: null, isAuthenticated: false, role: null, branchId: null });
    useBranchStore.getState().resetBranch();
  });

  it("offers the open branches and a super admin login", async () => {
    render(<LoginPage />);

    expect(await screen.findByRole("option", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "North" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Super Admin/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Coming soon" })).not.toBeInTheDocument();
  });

  it("logs a super admin in to every branch", async () => {
    useBranchStore.getState().lockBranch(2, "North");
    login.mockResolvedValue({ token: "tok", role: "super_admin", branch_id: null, branchName: null });

    await logInAs("super");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/dashboard"));
    expect(login).toHaveBeenCalledWith({ Email: "admin@school.test", Password: "secret123", branch_id: null });
    expect(useAuthStore.getState()).toMatchObject({ token: "tok", role: "super_admin", branchId: null });
    expect(useBranchStore.getState()).toMatchObject({ currentBranchId: null, currentBranchName: "All Branches" });
  });

  it("logs a branch admin in to their branch only", async () => {
    login.mockResolvedValue({ token: "tok", role: "branch_admin", branch_id: 2, branchName: "North" });

    await logInAs("2");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/dashboard"));
    expect(login).toHaveBeenCalledWith({ Email: "admin@school.test", Password: "secret123", branch_id: 2 });
    expect(useAuthStore.getState()).toMatchObject({ token: "tok", role: "branch_admin", branchId: 2 });
    expect(useBranchStore.getState()).toMatchObject({ currentBranchId: 2, currentBranchName: "North" });
  });

  it("shows the server's message and stays on the page when the login is refused", async () => {
    login.mockRejectedValue({ response: { status: 401, data: { error: "Invalid email or password." } } });

    await logInAs("1", { password: "wrong-pass" });

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
