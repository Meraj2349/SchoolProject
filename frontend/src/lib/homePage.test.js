import { describe, expect, it } from "vitest";
import {
  boardResultHighlights,
  dayAndMonth,
  formatDate,
  formatYear,
  categoriesPresent,
  formatNumber,
  heroSlides,
  inCategory,
  localized,
  spotlightOf,
  summariseStats,
  upcomingEvents,
  visibleNotices,
} from "./homePage";

const BRANCHES = [
  { id: 1, studentCount: 120, teacherCount: 9, classCount: 6, is_proposed: 0 },
  { id: 2, studentCount: 80, teacherCount: 5, classCount: 4, is_proposed: 0 },
  { id: 3, studentCount: 0, teacherCount: 0, classCount: 0, is_proposed: 1 },
];

describe("summariseStats", () => {
  it("adds up the active branches when no branch is chosen", () => {
    expect(summariseStats(BRANCHES, null)).toEqual({ students: 200, teachers: 14, classes: 10, branches: 2 });
  });

  it("shows the chosen branch's numbers, still counting every active branch", () => {
    expect(summariseStats(BRANCHES, 2)).toEqual({ students: 80, teachers: 5, classes: 4, branches: 2 });
  });

  it("is zero while nothing is loaded", () => {
    expect(summariseStats(undefined, null)).toEqual({ students: 0, teachers: 0, classes: 0, branches: 0 });
  });
});

describe("heroSlides", () => {
  const gate = { src: "/gate.jpg", alt: "School gate" };

  it("starts with the school photo, then school and event photos from the gallery", () => {
    const images = [
      { ImageID: 1, ImageType: "student", ImagePath: "s.png" },
      { ImageID: 2, ImageType: "event", ImagePath: "e.png", Description: "Sports day" },
      { ImageID: 3, ImageType: "school", ImagePath: "b.png", Description: null },
    ];

    expect(heroSlides(images, gate)).toEqual([
      gate,
      { src: "e.png", alt: "Sports day" },
      { src: "b.png", alt: "School gate" },
    ]);
  });

  it("shows at most five slides", () => {
    const images = Array.from({ length: 9 }, (_, i) => ({ ImageType: "event", ImagePath: `${i}.png`, Description: "x" }));

    expect(heroSlides(images, gate)).toHaveLength(5);
  });
});

const ACHIEVEMENTS = [
  { id: 1, category: "sports", year: 2024, is_featured: 0 },
  { id: 2, category: "board_result", year: 2023, is_featured: 0 },
  { id: 3, category: "board_result", year: 2025, is_featured: 1 },
  { id: 4, category: "award", year: 2022, is_featured: 1 },
];

describe("honours board helpers", () => {
  it("spotlights the first featured achievement", () => {
    expect(spotlightOf(ACHIEVEMENTS).id).toBe(3);
    expect(spotlightOf([{ id: 9, is_featured: 0 }])).toBeNull();
  });

  it("lists board results newest first", () => {
    expect(boardResultHighlights(ACHIEVEMENTS).map((a) => a.id)).toEqual([3, 2]);
  });

  it("offers only categories that have achievements, in the usual order", () => {
    expect(categoriesPresent(ACHIEVEMENTS)).toEqual(["board_result", "sports", "award"]);
  });

  it("filters by category, or shows everything", () => {
    expect(inCategory(ACHIEVEMENTS, "sports").map((a) => a.id)).toEqual([1]);
    expect(inCategory(ACHIEVEMENTS, "all")).toHaveLength(4);
  });
});

describe("visibleNotices", () => {
  it("keeps shown notices, newest first", () => {
    const notices = [
      { NoticeID: 1, Show: 1, CreatedAt: "2026-01-01" },
      { NoticeID: 2, Show: 0, CreatedAt: "2026-03-01" },
      { NoticeID: 3, Show: true, CreatedAt: "2026-02-01" },
    ];

    expect(visibleNotices(notices).map((n) => n.NoticeID)).toEqual([3, 1]);
    expect(visibleNotices(notices, 1)).toHaveLength(1);
  });
});

describe("upcomingEvents", () => {
  const now = new Date("2026-10-15T12:00:00");
  const events = [
    { EventID: 1, StartDate: "2026-11-01", EndDate: "2026-11-01" },
    { EventID: 2, StartDate: "2026-10-20", EndDate: "2026-10-21" },
    { EventID: 3, StartDate: "2026-09-01", EndDate: "2026-09-02" },
  ];

  it("lists events that have not ended, soonest first", () => {
    expect(upcomingEvents(events, now).map((e) => e.EventID)).toEqual([2, 1]);
  });

  it("falls back to the most recent past events", () => {
    expect(upcomingEvents([events[2]], now).map((e) => e.EventID)).toEqual([3]);
  });
});

describe("formatting", () => {
  it("writes numbers with Bangla digits in Bangla", () => {
    expect(formatNumber(1240, "en")).toBe("1,240");
    expect(formatNumber(1240, "bn")).toBe("১,২৪০");
    expect(formatNumber(50, "en", { minimumFractionDigits: 1 })).toBe("50.0");
  });

  it("picks the text in the reader's language, falling back to the other", () => {
    expect(localized({ title_en: "Win", title_bn: "জয়" }, "title", "bn")).toBe("জয়");
    expect(localized({ title_en: "Win", title_bn: "" }, "title", "bn")).toBe("Win");
    expect(localized({ title_en: null, title_bn: "জয়" }, "title", "en")).toBe("জয়");
  });
});

describe("dates", () => {
  it("writes a year without a thousands separator", () => {
    expect(formatYear(2025, "en")).toBe("2025");
    expect(formatYear(2025, "bn")).toBe("২০২৫");
  });

  it("splits a date into day and short month for a calendar badge", () => {
    expect(dayAndMonth("2026-10-05", "en")).toEqual({ day: "05", month: "Oct" });
    expect(dayAndMonth("2026-10-05", "bn").day).toBe("০৫");
    expect(dayAndMonth(null, "en")).toBeNull();
  });
});

describe("formatDate", () => {
  it("writes a date in the reader's language", () => {
    expect(formatDate("2026-10-05", "en")).toBe("5 Oct 2026");
    expect(formatDate("2026-10-05", "bn")).toBe("৫ অক্টো, ২০২৬");
  });

  it("is empty for a missing or broken date instead of 'Invalid Date'", () => {
    expect(formatDate(null, "en")).toBe("");
    expect(formatDate("not a date", "en")).toBe("");
  });
});
