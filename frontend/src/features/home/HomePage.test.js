import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import HomePage from "./HomePage";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/image", () => ({ default: ({ alt, src }) => <span role="img" aria-label={alt} data-src={src} /> }));
vi.mock("@/services/branch.service", () => ({
  branchService: {
    getAll: async () => [{ id: 1, name_en: "Main Campus", name_bn: "প্রধান", is_proposed: 0 }],
    getStats: async () => [{ id: 1, studentCount: 300, teacherCount: 20, classCount: 12, is_proposed: 0 }],
  },
}));
vi.mock("@/services/achievements.service", () => ({
  achievementsService: { getPublished: async () => [{ id: 1, title_en: "Football champions", title_bn: "ফুটবল", category: "sports", year: 2025, is_featured: 0 }] },
}));
vi.mock("@/services/notices.service", () => ({
  noticesService: {
    getAll: async () => [
      { NoticeID: 1, Title: "School closed on Friday", Description: "Holiday", Show: 1, CreatedAt: "2026-10-01" },
      { NoticeID: 2, Title: "Hidden draft", Description: "x", Show: 0, CreatedAt: "2026-10-02" },
    ],
  },
}));
vi.mock("@/services/messages.service", () => ({ messagesService: { getAll: async () => [{ MessageID: 1, Messages: "Welcome to our school family.", Show: 1 }] } }));
vi.mock("@/services/chairman.service", () => ({ chairmanService: { getProfile: async () => ({ name_en: "Md. Rashedul Islam", title_en: "Chairman" }) } }));
vi.mock("@/services/events.service", () => ({ eventsService: { getAll: async () => [{ EventID: 1, EventName: "Annual sports day", StartDate: "2099-01-10", EndDate: "2099-01-10", Venue: "Field" }] } }));
vi.mock("@/services/news.service", () => ({ newsService: { getAll: async () => [{ id: 1, title_en: "New science lab opened", title_bn: "নতুন ল্যাব", date: "2026-09-01", link: "/events" }] } }));
vi.mock("@/services/notice-announcements.service", () => ({ noticeAnnouncementsService: { getPublished: async () => [] } }));
vi.mock("@/services/images.service", () => ({
  imagesService: { getAll: async () => [{ ImageID: 5, ImageType: "event", ImagePath: "https://cdn.test/e.png", Description: "Prize giving" }] },
}));
vi.mock("@/services/classes.service", () => ({ classesService: { getAll: async () => [], getStudentCount: async () => ({ totalStudents: 0 }) } }));

describe("HomePage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null });
  });

  it("presents the school in the classic order", async () => {
    renderWithQuery(<HomePage />);
    await screen.findByText("Football champions");

    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    const order = ["At a glance", "Honours Board", "From the Chairman's desk", "Notice Board", "Upcoming events", "Latest news", "From our gallery", "Admission is open"];
    const positions = order.map((title) => headings.findIndex((h) => h.includes(title)));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("shows the chairman's message and only the notices meant for the website", async () => {
    renderWithQuery(<HomePage />);

    expect(await screen.findByText(/Welcome to our school family/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the full message" })).toHaveAttribute("href", "/chairman-message");
    const board = screen.getByRole("region", { name: "Notice Board" });
    expect(await within(board).findByText("School closed on Friday")).toBeInTheDocument();
    expect(within(board).queryByText("Hidden draft")).not.toBeInTheDocument();
  });

  it("lists events and news, links to the gallery, and invites families to apply", async () => {
    renderWithQuery(<HomePage />);

    expect(await screen.findByText("Annual sports day")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /New science lab opened/ })).toHaveAttribute("href", "/events");
    expect(await screen.findByRole("img", { name: "Prize giving" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View the gallery" })).toHaveAttribute("href", "/gallery");
    const admission = screen.getByRole("region", { name: "Admission is open" });
    expect(within(admission).getByRole("link", { name: "Apply online" })).toHaveAttribute("href", "/apply");
  });
});
