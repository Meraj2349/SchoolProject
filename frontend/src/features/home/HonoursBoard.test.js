import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import HonoursBoard from "./HonoursBoard";

const getPublished = vi.fn();
vi.mock("@/services/achievements.service", () => ({ achievementsService: { getPublished: () => getPublished() } }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));

const ACHIEVEMENTS = [
  {
    id: 1, title_en: "SSC 2025: our best result", title_bn: "এসএসসি ২০২৫", category: "board_result", year: 2025,
    exam_name: "SSC", examinees: 120, passed: 118, gpa5: 42, is_featured: 1, image_url: "/uploads/achievements/a.png",
    description_en: "Every class did well.",
  },
  { id: 2, title_en: "District football champions", title_bn: "জেলা ফুটবল চ্যাম্পিয়ন", category: "sports", year: 2024, is_featured: 0 },
  { id: 3, title_en: "Science olympiad gold", title_bn: "বিজ্ঞান অলিম্পিয়াডে স্বর্ণ", category: "competition", year: 2024, is_featured: 0 },
];

describe("HonoursBoard", () => {
  beforeEach(() => {
    getPublished.mockReset().mockResolvedValue(ACHIEVEMENTS);
    useLanguageStore.getState().setLanguage("en");
  });

  it("spotlights the featured achievement", async () => {
    renderWithQuery(<HonoursBoard />);

    const spotlight = await screen.findByRole("article", { name: "SSC 2025: our best result" });
    expect(within(spotlight).getByText("Featured")).toBeInTheDocument();
    expect(within(spotlight).getByText("Every class did well.")).toBeInTheDocument();
    expect(within(spotlight).getByRole("img")).toHaveAttribute("data-src", "http://localhost:3000/uploads/achievements/a.png");
  });

  it("shows board results with pass rate and GPA-5", async () => {
    renderWithQuery(<HonoursBoard />);

    const results = await screen.findByRole("region", { name: "Board exam results" });
    expect(within(results).getByText("SSC 2025")).toBeInTheDocument();
    expect(within(results).getByText("98.3%")).toBeInTheDocument();
    expect(within(results).getByText("42")).toBeInTheDocument();
    expect(within(results).getByText("120 examinees")).toBeInTheDocument();
  });

  it("filters the achievements by category", async () => {
    renderWithQuery(<HonoursBoard />);
    const tabs = await screen.findByRole("tablist", { name: "Show achievements" });
    expect(within(tabs).getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["All", "Board results", "Sports", "Competitions"]);

    fireEvent.click(within(tabs).getByRole("tab", { name: "Sports" }));

    const panel = screen.getByRole("tabpanel");
    expect(within(tabs).getByRole("tab", { name: "Sports" })).toHaveAttribute("aria-selected", "true");
    expect(within(panel).getByText("District football champions")).toBeInTheDocument();
    expect(within(panel).queryByText("Science olympiad gold")).not.toBeInTheDocument();
  });

  it("moves between categories with the arrow, Home and End keys", async () => {
    renderWithQuery(<HonoursBoard />);
    const tabs = await screen.findByRole("tablist", { name: "Show achievements" });
    const all = within(tabs).getByRole("tab", { name: "All" });

    fireEvent.keyDown(all, { key: "End" });
    expect(within(tabs).getByRole("tab", { name: "Competitions" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(within(tabs).getByRole("tab", { name: "Competitions" }), { key: "Home" });
    expect(all).toHaveAttribute("aria-selected", "true");
    expect(all).toHaveFocus();
  });

  it("is written in Bangla for Bangla readers", async () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<HonoursBoard />);

    expect(await screen.findByRole("heading", { name: "সম্মাননা বোর্ড" })).toBeInTheDocument();
    expect(screen.getAllByText("জেলা ফুটবল চ্যাম্পিয়ন").length).toBeGreaterThan(0);
  });

  it("is left out until there are achievements", async () => {
    getPublished.mockResolvedValue([]);
    const { container } = renderWithQuery(<HonoursBoard />);

    await vi.waitFor(() => expect(getPublished).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
