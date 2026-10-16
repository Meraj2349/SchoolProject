import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AboutPage from "./AboutPage";

vi.mock("next/navigation", () => ({ usePathname: () => "/about" }));
vi.mock("next/image", () => ({ default: ({ alt }) => <span role="img" aria-label={alt} /> }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));
vi.mock("@/services/notices.service", () => ({ noticesService: { getAll: async () => [] } }));

describe("AboutPage", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("introduces the school under one main heading", () => {
    renderWithQuery(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1, name: "About Us" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "The school gate" })).toBeInTheDocument();
    expect(screen.getByTitle("Map of Star Shikkha Poribar")).toBeInTheDocument();
  });

  it("gives the school's real contact details as links", () => {
    renderWithQuery(<AboutPage />);
    const main = screen.getByRole("main");

    expect(main.querySelector('a[href="tel:+8801997588476"]')).toBeInTheDocument();
    expect(main.querySelector('a[href="mailto:merajislam2349@gmail.com"]')).toBeInTheDocument();
  });

  it("reads in Bangla", () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).not.toBe("About Us");
  });

  it("lists the school's recognition: government approval, EIIN and code", () => {
    renderWithQuery(<AboutPage />);
    const details = screen.getByRole("heading", { name: "School details" }).closest("section");

    expect(details).toHaveTextContent("Recognition");
    expect(details).toHaveTextContent("Government approved");
    expect(details).toHaveTextContent("EIIN135479");
    expect(details).toHaveTextContent("School code306060805");
  });
});
