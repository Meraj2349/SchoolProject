import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import PageHero from "./PageHero";

describe("PageHero", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("gives the page its one main heading, with eyebrow and subtitle", () => {
    render(<PageHero eyebrow="Our school" title="About us" subtitle="Who we are" />);

    expect(screen.getByRole("heading", { level: 1, name: "About us" })).toBeInTheDocument();
    expect(screen.getByText("Our school")).toBeInTheDocument();
    expect(screen.getByText("Who we are")).toBeInTheDocument();
  });

  it("shows where the page sits: Home › this page", () => {
    render(<PageHero title="Gallery" />);

    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(crumbs).getByText("Gallery")).toHaveAttribute("aria-current", "page");
  });

  it("can name a parent page in the trail", () => {
    render(<PageHero title="Progress" trail={[{ label: "Quaker", href: "/quaker" }]} />);

    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Quaker" })).toHaveAttribute("href", "/quaker");
  });
});
