import { describe, expect, it } from "@jest/globals";
import { assignments, inList, insertList, valuesRows } from "./sql.js";

describe("inList", () => {
  it("expands a list into placeholders and parameters", () => {
    expect(inList([3, 4, 5])).toEqual({ sql: "(?, ?, ?)", params: [3, 4, 5] });
  });

  it("matches nothing for an empty list instead of producing invalid SQL", () => {
    expect(inList([])).toEqual({ sql: "(NULL)", params: [] });
  });
});

describe("valuesRows", () => {
  it("builds a multi-row VALUES list", () => {
    expect(
      valuesRows([
        [1, "a"],
        [2, "b"],
      ]),
    ).toEqual({ sql: "(?, ?), (?, ?)", params: [1, "a", 2, "b"] });
  });

  it("refuses rows of different lengths", () => {
    expect(() => valuesRows([[1, 2], [3]])).toThrow(/same number of values/);
  });

  it("refuses an empty list", () => {
    expect(() => valuesRows([])).toThrow(/at least one row/);
  });
});

describe("insertList / assignments", () => {
  const quote = (name) => `"${name}"`;

  it("lists an object's columns and values for an INSERT", () => {
    expect(insertList({ Title: "Hi", branch_id: 2 }, quote)).toEqual({ sql: '("Title", "branch_id") VALUES (?, ?)', params: ["Hi", 2] });
  });

  it("builds SET assignments from an object", () => {
    expect(assignments({ Title: "Hi", IsVisible: true }, quote)).toEqual({ sql: '"Title" = ?, "IsVisible" = ?', params: ["Hi", true] });
  });

  it("writes undefined as NULL", () => {
    expect(assignments({ Title: "Hi", Body: undefined }, quote).params).toEqual(["Hi", null]);
  });

  it("refuses a column name that is not a plain identifier", () => {
    expect(() => assignments({ "a = 1; --": 1 }, quote)).toThrow(/column name/);
    expect(() => insertList({ "x`": 1 }, quote)).toThrow(/column name/);
  });

  it("refuses an empty object", () => {
    expect(() => assignments({}, quote)).toThrow(/at least one column/);
  });
});
