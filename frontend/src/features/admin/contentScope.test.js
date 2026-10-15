import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import GalleryPage from "./gallery/AdminPage";
import MessagesPage from "./messages/AdminPage";
import NewsPage from "./news/AdminNewsPage";
import AchievementsPage from "./achievements/AchievementsPage";
import AnnouncementsPage from "./noticeAnnouncements/AdminNoticeAnnouncementsPage";
import NoticesPage from "./notices/AdminNoticesPage";

// Each page lists one item of the admin's own branch (1) and one for the
// whole school (null). A branch admin may change only the first.
const PAGES = [
  {
    name: "Notices",
    Page: NoticesPage,
    url: "/notices",
    rows: [
      { NoticeID: 1, Title: "Own notice", Description: "D", Show: 1, branch_id: 1 },
      { NoticeID: 2, Title: "School notice", Description: "D", Show: 1, branch_id: null },
    ],
  },
  {
    name: "Chairman messages",
    Page: MessagesPage,
    url: "/messages",
    rows: [
      { MessageID: 1, Messages: "Own notice", Show: 1, branch_id: 1 },
      { MessageID: 2, Messages: "School notice", Show: 1, branch_id: null },
    ],
  },
  {
    name: "News",
    Page: NewsPage,
    url: "/news/all",
    rows: [
      { id: 1, title_bn: "খবর ১", title_en: "Own notice", date: "2030-01-01", is_active: 1, branch_id: 1 },
      { id: 2, title_bn: "খবর ২", title_en: "School notice", date: "2030-01-01", is_active: 1, branch_id: null },
    ],
  },
  {
    name: "Notice announcements",
    Page: AnnouncementsPage,
    url: "/notice-announcements/all",
    rows: [
      { id: 1, title_bn: "ক", title_en: "Own notice", category: "Exam", date: "2030-01-01", is_published: 1, branch_id: 1, image_url: null },
      { id: 2, title_bn: "খ", title_en: "School notice", category: "Exam", date: "2030-01-01", is_published: 1, branch_id: null, image_url: null },
    ],
  },
  {
    name: "Achievements",
    Page: AchievementsPage,
    url: "/achievements/all",
    rows: [
      { id: 1, title_en: "Own notice", title_bn: "ক", category: "sports", year: 2025, is_featured: 0, is_published: 1, branch_id: 1 },
      { id: 2, title_en: "School notice", title_bn: "খ", category: "award", year: 2025, is_featured: 0, is_published: 1, branch_id: null },
    ],
  },
  {
    name: "Gallery",
    Page: GalleryPage,
    url: "/images/details",
    rows: [
      { ImageID: 1, ImagePath: "https://cdn.test/1.png", ImageType: "event", Description: "Own notice", branch_id: 1 },
      { ImageID: 2, ImageType: "school", ImagePath: "https://cdn.test/2.png", Description: "School notice", branch_id: null },
    ],
  },
];

const BRANCHES = [{ id: 1, name_en: "Main", name_bn: "প্রধান" }, { id: 2, name_en: "North", name_bn: "উত্তর" }];
const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/lib/httpClient", () => ({ default: http, isExpiredSession: () => false }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/admin" }));
vi.mock("next/image", () => ({ default: ({ src, alt }) => <span data-src={src}>{alt}</span> }));

const itemNamed = async (text) => (await screen.findAllByText(text))[0].closest("tr, article");
const actionsIn = (item) => within(item).queryAllByRole("button", { name: /edit|delete/i });

describe.each(PAGES)("$name admin page", ({ Page, url, rows }) => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    http.get.mockImplementation(async (path) => ({
      data: { success: true, data: path.startsWith("/branches") ? BRANCHES : path.startsWith(url) ? rows : [] },
    }));
  });

  describe("for a branch admin", () => {
    beforeEach(() => {
      useAuthStore.setState({ role: "branch_admin" });
      useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main" });
    });

    it("labels each item with its branch or the whole school", async () => {
      renderWithQuery(<Page />);

      expect(await within(await itemNamed("Own notice")).findByText("Main")).toBeInTheDocument();
      expect(within(await itemNamed("School notice")).getByText("Whole school")).toBeInTheDocument();
    });

    it("offers edit and delete only on their own branch's items", async () => {
      renderWithQuery(<Page />);

      expect(actionsIn(await itemNamed("Own notice")).length).toBeGreaterThan(0);
      const school = await itemNamed("School notice");
      expect(actionsIn(school)).toEqual([]);
      expect(within(school).getByLabelText("Only the super admin can change this.")).toBeInTheDocument();
    });
  });

  it("tells a super admin on All branches that new items are for the whole school", async () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null, currentBranchName: "All Branches" });

    renderWithQuery(<Page />);

    expect(screen.getByRole("note")).toHaveTextContent(/published for the whole school/);
    expect(actionsIn(await itemNamed("School notice")).length).toBeGreaterThan(0);
  });
});
