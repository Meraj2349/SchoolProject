import { describe, expect, it } from "@jest/globals";
import { toPage } from "./paging.js";

describe("toPage", () => {
  it("turns page and pageSize into an offset", () => {
    expect(toPage({ page: "3", pageSize: "20" })).toEqual({ page: 3, pageSize: 20, offset: 40 });
  });

  it("falls back to sensible values for missing or nonsense input", () => {
    expect(toPage({})).toEqual({ page: 1, pageSize: 25, offset: 0 });
    expect(toPage({ page: "abc", pageSize: "-4" })).toEqual({ page: 1, pageSize: 25, offset: 0 });
  });

  it("caps the page size", () => {
    expect(toPage({ pageSize: "5000" }, { maxPageSize: 100 })).toMatchObject({ pageSize: 100 });
  });
});
