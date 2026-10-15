import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import AdminTopBar from "./AdminTopBar";

const push = vi.fn();
const logout = vi.fn(async () => {});
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/results", useRouter: () => ({ push }) }));
vi.mock("@/services/auth.service", () => ({ authService: { logout: () => logout() } }));
vi.mock("@/components/ui/BranchSelector", () => ({ default: () => <span>branch selector</span> }));

describe("AdminTopBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin", token: "t", isAuthenticated: true });
  });

  it("shows breadcrumbs for the current page", () => {
    render(<AdminTopBar />);
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(crumbs).toHaveTextContent("Admin");
    expect(crumbs).toHaveTextContent("Exams & Results");
    expect(screen.getByText("Results")).toHaveAttribute("aria-current", "page");
  });

  it("toggles the menu", () => {
    const onToggleMenu = vi.fn();
    render(<AdminTopBar onToggleMenu={onToggleMenu} />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle menu" }));

    expect(onToggleMenu).toHaveBeenCalled();
  });

  it("signs out from the user menu and clears the session", async () => {
    render(<AdminTopBar />);

    fireEvent.click(screen.getByRole("button", { name: /Branch Admin/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/login"));
    expect(logout).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
