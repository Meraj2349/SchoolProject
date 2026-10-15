import { act, fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import Navbar from "./Navbar";

let pathname = "/result";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: async () => [{ id: 1, name_en: "Main Campus", name_bn: "প্রধান ক্যাম্পাস" }] },
}));

const mainNav = () => screen.getByRole("navigation", { name: "Main navigation" });

describe("Navbar (site header)", () => {
  beforeEach(() => {
    pathname = "/result";
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null, currentBranchName: null });
  });

  it("shows the school's name and how to reach it", () => {
    renderWithQuery(<Navbar />);

    expect(screen.getAllByText("Star Shikkha Poribar").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /01997588476/ })).toHaveAttribute("href", "tel:+8801997588476");
    expect(screen.getByRole("link", { name: /merajislam2349@gmail.com/ })).toHaveAttribute("href", "mailto:merajislam2349@gmail.com");
    expect(screen.getAllByRole("link", { name: "Apply online" })[0]).toHaveAttribute("href", "/apply");
  });

  it("links to the main pages", () => {
    renderWithQuery(<Navbar />);

    expect(within(mainNav()).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(mainNav()).getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/gallery");
  });

  it("opens the Academics menu, marks the current page, and closes on Escape", () => {
    renderWithQuery(<Navbar />);
    const academics = within(mainNav()).getByRole("button", { name: "Academics" });
    expect(academics).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(academics);
    expect(academics).toHaveAttribute("aria-expanded", "true");
    expect(within(mainNav()).getByRole("link", { name: "Results" })).toHaveAttribute("aria-current", "page");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(academics).toHaveAttribute("aria-expanded", "false");
    expect(within(mainNav()).queryByRole("link", { name: "Results" })).not.toBeInTheDocument();
  });

  it("opens a mobile menu with every page and closes it on Escape", () => {
    renderWithQuery(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Menu" });
    expect(within(menu).getByRole("link", { name: "Teachers" })).toHaveAttribute("href", "/teachers");
    expect(within(menu).getByRole("button", { name: "Close menu" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
  });

  it("switches to Bangla", () => {
    renderWithQuery(<Navbar />);

    act(() => fireEvent.click(screen.getAllByRole("button", { name: "বাংলা" })[0]));

    const nav = screen.getByRole("navigation", { name: "প্রধান মেনু" });
    expect(within(nav).getByRole("link", { name: "হোম" })).toBeInTheDocument();
    expect(screen.getAllByText("স্টার শিক্ষা পরিবার").length).toBeGreaterThan(0);
  });
});
