import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import Footer from "./Footer";

vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/branch.service", () => ({
  branchService: {
    getAll: async () => [
      { id: 1, name_en: "Main Campus", name_bn: "প্রধান", is_proposed: 0 },
      { id: 2, name_en: "Future Campus", name_bn: "ভবিষ্যৎ", is_proposed: 1 },
    ],
  },
}));

describe("Footer", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("has no dead links; outside sites open in a new tab", async () => {
    renderWithQuery(<Footer />);
    await screen.findByText("Main Campus");

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(8);
    for (const link of links) expect(link.getAttribute("href")).toMatch(/^(\/|https:\/\/|tel:|mailto:)/);
    const board = screen.getByRole("link", { name: /Education Board Results/ });
    expect(board).toHaveAttribute("href", "https://www.educationboardresults.gov.bd");
    expect(board).toHaveAttribute("target", "_blank");
    expect(board.getAttribute("rel")).toContain("noopener");
  });

  it("lists the active branches and the contact details", async () => {
    renderWithQuery(<Footer />);

    const branches = await screen.findByRole("list", { name: "Our branches" });
    expect(await within(branches).findByRole("link", { name: "Main Campus" })).toHaveAttribute("href", "/branches");
    expect(within(branches).queryByText("Future Campus")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /01997588476/ })).toHaveAttribute("href", "tel:+8801997588476");
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});
