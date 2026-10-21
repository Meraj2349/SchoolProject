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

  it("takes the first value of a repeated parameter", async () => {
    const page = await render({ classId: ["10", "11"] });

    expect(page.props.initialClassId).toBe("10");
  });
});
