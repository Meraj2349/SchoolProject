import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import RegisterPage from "./RegisterPage";

const register = vi.fn();
const getBranches = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/auth.service", () => ({ authService: { register: (body) => register(body) } }));
vi.mock("axios", () => ({ default: { get: (...args) => getBranches(...args) } }));

const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

function fillAccount({ confirm = "secret123" } = {}) {
  fill("Name", "Karim");
  fill("Email", "karim@school.test");
  fill("Password", "secret123");
  fill("Confirm password", confirm);
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Create account" }));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBranches.mockResolvedValue({ data: { data: [{ id: 1, name_en: "Main" }] } });
    useLanguageStore.getState().setLanguage("en");
  });

  it("explains that only a super admin can add accounts after setup", () => {
    render(<RegisterPage />);

    expect(screen.getByText(/only a super admin can create admin accounts/i)).toBeInTheDocument();
  });

  it("creates a branch admin for the chosen branch, then offers the sign-in page", async () => {
    register.mockResolvedValue({ success: true });
    render(<RegisterPage />);
    await screen.findByRole("option", { name: "Main" });

    fill("Branch", "1");
    fillAccount();
    submit();

    expect(await screen.findByRole("status")).toHaveTextContent("Account created");
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute("href", "/admin/login");
    expect(register).toHaveBeenCalledWith({
      Username: "Karim",
      Email: "karim@school.test",
      Password: "secret123",
      role: "branch_admin",
      branch_id: 1,
    });
  });

  it("creates a super admin without a branch", async () => {
    register.mockResolvedValue({ success: true });
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("radio", { name: /Super admin/ }));
    fillAccount();
    submit();

    await screen.findByRole("status");
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ role: "super_admin", branch_id: null }));
  });

  it("stops when the passwords do not match", () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("radio", { name: /Super admin/ }));
    fillAccount({ confirm: "different1" });
    submit();

    expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match");
    expect(register).not.toHaveBeenCalled();
  });

  it("shows the server's message when the account is refused", async () => {
    register.mockRejectedValue({ response: { status: 401, data: { error: "Only a super admin can create admin accounts." } } });
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("radio", { name: /Super admin/ }));
    fillAccount();
    submit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Only a super admin can create admin accounts.");
  });
});
