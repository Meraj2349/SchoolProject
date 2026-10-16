import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import EventsNews from "./EventsNews";

const NEWS = [
  { id: 1, title_en: "Prize day", date: "2026-09-01", link: "/events" },
  { id: 2, title_en: "Board notice", date: "2026-09-02", link: "https://dshe.gov.bd/notice" },
  { id: 3, title_en: "Odd link", date: "2026-09-03", link: "//evil.example" },
  { id: 4, title_en: "Script link", date: "2026-09-04", link: "javascript:alert(1)" },
];
vi.mock("@/services/news.service", () => ({ newsService: { getAll: async () => NEWS } }));
vi.mock("@/services/events.service", () => ({ eventsService: { getAll: async () => [] } }));

describe("EventsNews", () => {
  beforeEach(() => useLanguageStore.getState().setLanguage("en"));

  it("links news to this site's pages, or to outside sites in a new tab", async () => {
    renderWithQuery(<EventsNews />);

    expect(await screen.findByRole("link", { name: "Prize day" })).toHaveAttribute("href", "/events");
    const board = screen.getByRole("link", { name: "Board notice" });
    expect(board).toHaveAttribute("target", "_blank");
    expect(board.getAttribute("rel")).toContain("noopener");
  });

  it("shows news with an unsafe link as plain text", async () => {
    renderWithQuery(<EventsNews />);

    expect(await screen.findByText("Odd link")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Odd link" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Script link" })).not.toBeInTheDocument();
  });

  it("says when there are no upcoming events", async () => {
    renderWithQuery(<EventsNews />);

    expect(await screen.findByText("No upcoming events.")).toBeInTheDocument();
  });
});
