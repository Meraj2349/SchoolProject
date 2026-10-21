import { describe, expect, it, vi } from "vitest";
import Page from "./page";

vi.mock("@/features/admin/attendance/AdminPage", () => ({ default: () => null }));

const render = (searchParams) => Page({ searchParams: Promise.resolve(searchParams) });

describe("mark attendance route", () => {
  it("opens the class and day given in the link", async () => {
    const page = await render({ classId: "10", date: "2026-10-15" });

    expect(page.props).toEqual({ initialClassId: "10", initialDate: "2026-10-15" });
  });

  it("opens the page without a class when the link has none", async () => {
    const page = await render({});

    expect(page.props).toEqual({ initialClassId: null, initialDate: null });
  });

  it("starts afresh when the link changes, e.g. the menu's plain link after a class link", async () => {
    const opened = await render({ classId: "10", date: "2026-10-15" });
    const other = await render({ classId: "11", date: "2026-10-15" });
    const plain = await render({});

    expect(new Set([opened.key, other.key, plain.key]).size).toBe(3);
  });

  it("takes the first value of a repeated parameter", async () => {
    const page = await render({ classId: ["10", "11"] });

    expect(page.props.initialClassId).toBe("10");
  });
});
