import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import AdminSidebar from "./AdminSidebar";

let pathname = "/admin/results";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const asRole = (role) => useAuthStore.setState({ role });

describe("AdminSidebar", () => {
  beforeEach(() => {
    pathname = "/admin/results";
    useLanguageStore.getState().setLanguage("en");
    asRole("super_admin");
  });

  it("shows super-admin pages only to super admins", () => {
    const { unmount } = render(<AdminSidebar />);
    fireEvent.click(screen.getByRole("button", { name: "Administration" }));
    expect(screen.getByRole("link", { name: "Branch Management" })).toBeInTheDocument();
    unmount();

    asRole("branch_admin");
    render(<AdminSidebar />);
    fireEvent.click(screen.getByRole("button", { name: "Administration" }));
    expect(screen.queryByRole("link", { name: "Branch Management" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("marks the current page and opens its group", () => {
    render(<AdminSidebar />);

    expect(screen.getByRole("button", { name: "Exams & Results" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Results" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Exams" })).not.toHaveAttribute("aria-current");
  });

  it("marks a sub-page's menu item as current", () => {
    pathname = "/admin/attendance/grid";
    render(<AdminSidebar />);

    expect(screen.getByRole("link", { name: "Attendance Grid" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Mark Attendance" })).not.toHaveAttribute("aria-current");
  });

  it("opens and closes a group", () => {
    render(<AdminSidebar />);
    const academics = screen.getByRole("button", { name: "Academics" });

    expect(academics).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Student List" })).not.toBeInTheDocument();

    fireEvent.click(academics);
    expect(academics).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Student List" })).toHaveAttribute("href", "/admin/studentList");

    fireEvent.click(academics);
    expect(screen.queryByRole("link", { name: "Student List" })).not.toBeInTheDocument();
  });

  it("keeps links named for screen readers when collapsed to icons", () => {
    render(<AdminSidebar collapsed />);

    expect(screen.getByRole("link", { name: "Admin Dashboard" })).toBeInTheDocument();
  });

  it("closes the mobile menu when a link is chosen", () => {
    const onClose = vi.fn();
    render(<AdminSidebar open onClose={onClose} />);
    const link = screen.getByRole("link", { name: "Results" });
    link.addEventListener("click", (event) => event.preventDefault()); // jsdom cannot navigate

    fireEvent.click(link);

    expect(onClose).toHaveBeenCalled();
  });
});
