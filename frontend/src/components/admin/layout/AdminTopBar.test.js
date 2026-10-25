import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery as render } from "@/test-utils";
import AdminTopBar from "./AdminTopBar";

const push = vi.fn();
const logout = vi.fn(async () => {});
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/results", useRouter: () => ({ push }) }));
vi.mock("@/services/auth.service", () => ({ authService: { logout: () => logout() } }));
vi.mock("@/components/ui/BranchSelector", () => ({ default: () => <span>branch selector</span> }));
vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: async () => [{ id: 1, name_en: "Natiapara Head Office", name_bn: "নাটিয়াপাড়া প্রধান কার্যালয়" }] },
}));

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

  it("names a branch admin's branch in the admin's language", async () => {
    useLanguageStore.getState().setLanguage("bn");
    useAuthStore.setState({ role: "branch_admin", branchId: 1 });
    useBranchStore.getState().lockBranch(1, "Natiapara Head Office");
    render(<AdminTopBar />);

    fireEvent.click(screen.getByRole("button", { name: /শাখা অ্যাডমিন/ }));

    expect(await within(screen.getByRole("menu")).findByText("নাটিয়াপাড়া প্রধান কার্যালয়")).toBeInTheDocument();
  });
});
