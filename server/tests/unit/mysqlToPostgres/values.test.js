import { describe, expect, it } from "@jest/globals";
import {
  canonicalRow,
  formatOffset,
  fromMysql,
  fromPostgres,
  toPostgres,
} from "../../../scripts/mysql-to-postgres/values.js";

// The copy reads MySQL with dateStrings, bigNumberStrings and its session
// time_zone set to the offset below, so DATETIME and TIMESTAMP both arrive
// as the school's wall-clock time.
const DHAKA = "+06:00";

describe("formatOffset", () => {
  it("turns MySQL's TIMEDIFF(NOW(), UTC_TIMESTAMP()) into an offset", () => {
    expect(formatOffset("06:00:00")).toBe("+06:00");
    expect(formatOffset("-05:30:00")).toBe("-05:30");
    expect(formatOffset("00:00:00")).toBe("+00:00");
  });

  it("keeps an offset that is already written as one", () => {
    expect(formatOffset("+06:00")).toBe("+06:00");
  });

  it("rejects anything else", () => {
    expect(() => formatOffset("Asia/Dhaka")).toThrow(/offset/);
  });
});

describe("toPostgres", () => {
  it("passes NULL through for every type", () => {
    for (const type of ["boolean", "jsonb", "timestamp with time zone", "integer", "text"]) {
      expect(toPostgres(null, type, DHAKA)).toBeNull();
    }
  });

  it("turns TINYINT(1) into a boolean", () => {
    expect(toPostgres(1, "boolean", DHAKA)).toBe(true);
    expect(toPostgres(0, "boolean", DHAKA)).toBe(false);
    expect(toPostgres("1", "boolean", DHAKA)).toBe(true);
  });

  it("sends JSON as text so arrays stay JSON arrays, not PostgreSQL arrays", () => {
    expect(toPostgres([1, 2], "jsonb", DHAKA)).toBe("[1,2]");
    expect(toPostgres({ a: "ক" }, "jsonb", DHAKA)).toBe('{"a":"ক"}');
    expect(toPostgres('{"a":1}', "jsonb", DHAKA)).toBe('{"a":1}');
  });

  it("gives a wall-clock time the source's offset", () => {
    expect(toPostgres("2026-10-27 08:15:00", "timestamp with time zone", DHAKA)).toBe("2026-10-27 08:15:00+06:00");
  });

  it("leaves dates, numbers and text as they are", () => {
    expect(toPostgres("2026-01-05", "date", DHAKA)).toBe("2026-01-05");
    expect(toPostgres("1500.50", "numeric", DHAKA)).toBe("1500.50");
    expect(toPostgres(42, "integer", DHAKA)).toBe(42);
    expect(toPostgres("চাঁদ", "text", DHAKA)).toBe("চাঁদ");
  });
});

describe("canonical values (what verify compares)", () => {
  const same = (mysqlValue, pgValue, type) =>
    expect(fromMysql(mysqlValue, type, DHAKA)).toBe(fromPostgres(pgValue, type));

  it("compares booleans as 0/1", () => {
    same(1, true, "boolean");
    same(0, false, "boolean");
    expect(fromMysql(1, "boolean", DHAKA)).not.toBe(fromPostgres(false, "boolean"));
  });

  it("compares times as instants", () => {
    same("2026-10-27 08:15:00", new Date("2026-10-27T02:15:00Z"), "timestamp with time zone");
    expect(fromMysql("2026-10-27 08:15:00", "timestamp with time zone", DHAKA)).not.toBe(
      fromPostgres(new Date("2026-10-27T08:15:00Z"), "timestamp with time zone"),
    );
  });

  it("compares decimals by value, not by trailing zeros", () => {
    same("1500.50", "1500.5", "numeric");
    same("0.00", "0", "numeric");
    same("-3.10", "-3.1", "numeric");
    expect(fromMysql("1500.50", "numeric", DHAKA)).not.toBe(fromPostgres("1500.05", "numeric"));
  });

  it("compares JSON whatever the key order (jsonb reorders keys)", () => {
    same({ b: 1, a: [1, { d: 2, c: 3 }] }, { a: [1, { c: 3, d: 2 }], b: 1 }, "jsonb");
  });

  it("ignores the trailing spaces PostgreSQL pads CHAR(n) with", () => {
    same("ab", "ab   ", "character");
  });

  it("compares big integers as strings", () => {
    same("9007199254740993", "9007199254740993", "bigint");
    same(7, 7, "integer");
  });

  it("tells NULL apart from an empty string", () => {
    same(null, null, "text");
    expect(fromMysql(null, "text", DHAKA)).not.toBe(fromPostgres("", "text"));
  });

  it("is case-sensitive for text", () => {
    expect(fromMysql("Karim", "character varying", DHAKA)).not.toBe(fromPostgres("karim", "character varying"));
  });
});

describe("canonicalRow", () => {
  it("is the same for equal rows from both databases", () => {
    const columns = [
      { name: "id", type: "integer" },
      { name: "active", type: "boolean" },
      { name: "created_at", type: "timestamp with time zone" },
    ];
    const fromMy = canonicalRow({ id: 1, active: 1, created_at: "2026-10-27 08:15:00" }, columns, "mysql", DHAKA);
    const fromPg = canonicalRow({ id: 1, active: true, created_at: new Date("2026-10-27T02:15:00Z") }, columns, "postgres");

    expect(fromMy).toBe(fromPg);
  });
});
