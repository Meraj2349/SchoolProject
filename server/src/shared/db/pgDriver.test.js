import { describe, expect, it, jest } from "@jest/globals";
import { makePgDriver, pgTypeParser } from "./pgDriver.js";

const fakePool = (result = { rows: [], rowCount: 0 }) => {
  const client = { query: jest.fn(async () => result), release: jest.fn() };
  return { client, query: jest.fn(async () => result), connect: jest.fn(async () => client), end: jest.fn() };
};

describe("PostgreSQL driver", () => {
  it("sends $n placeholders and returns rows with their count", async () => {
    const pool = fakePool({ rows: [{ id: 1 }], rowCount: 1 });

    await expect(makePgDriver(pool).run(null, "SELECT id FROM t WHERE a = ? AND b = ?", [1, 2])).resolves.toEqual({
      rows: [{ id: 1 }],
      rowCount: 1,
    });
    expect(pool.query).toHaveBeenCalledWith("SELECT id FROM t WHERE a = $1 AND b = $2", [1, 2]);
  });

  it("returns the affected row count for writes", async () => {
    const pool = fakePool({ rows: [], rowCount: 3 });

    await expect(makePgDriver(pool).run(null, "UPDATE t SET a = ?", [1])).resolves.toEqual({ rows: [], rowCount: 3 });
  });

  it("runs on the transaction's client when given one", async () => {
    const pool = fakePool();
    const client = { query: jest.fn(async () => ({ rows: [], rowCount: 0 })) };

    await makePgDriver(pool).run(client, "SELECT 1", []);

    expect(client.query).toHaveBeenCalledWith("SELECT 1", []);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("gets an insert's id with RETURNING", async () => {
    const pool = fakePool({ rows: [{ StudentID: 9 }], rowCount: 1 });

    await expect(makePgDriver(pool).insert(null, "INSERT INTO t (a) VALUES (?)", [1], "StudentID")).resolves.toBe(9);
    expect(pool.query).toHaveBeenCalledWith('INSERT INTO t (a) VALUES ($1) RETURNING "StudentID"', [1]);
  });

  it("gives undefined when an INSERT ... SELECT inserted nothing", async () => {
    const pool = fakePool({ rows: [], rowCount: 0 });

    await expect(makePgDriver(pool).insert(null, "INSERT INTO t (a) SELECT 1 WHERE FALSE", [], "id")).resolves.toBeUndefined();
  });

  it("runs transactions on one pooled client", async () => {
    const pool = fakePool();
    const driver = makePgDriver(pool);

    const client = await driver.connect();
    await driver.begin(client);
    await driver.commit(client);
    await driver.rollback(client);
    driver.release(client);

    expect(client.query.mock.calls.map(([sql]) => sql)).toEqual(["BEGIN", "COMMIT", "ROLLBACK"]);
    expect(client.release).toHaveBeenCalled();
  });

  it.each([
    ["23505", "unique"],
    ["23503", "foreignKey"],
    ["40P01", "deadlock"],
    ["42601", null],
  ])("classifies SQLSTATE %s as %s", (code, kind) => {
    expect(makePgDriver(fakePool()).classify({ code })).toBe(kind);
  });

  it("quotes identifiers with double quotes", () => {
    expect(makePgDriver(fakePool()).quote('Odd"Name')).toBe('"Odd""Name"');
  });
});

describe("type parsing (the API keeps MySQL's shapes)", () => {
  const parse = (oid, text) => pgTypeParser(oid, "text")(text);

  it("keeps DATE as a YYYY-MM-DD string, so no timezone shifts a day", () => {
    expect(parse(1082, "2026-10-24")).toBe("2026-10-24");
  });

  it("returns COUNT and other bigints as numbers", () => {
    expect(parse(20, "42")).toBe(42);
  });

  it("returns booleans as 1 and 0, like MySQL's TINYINT(1)", () => {
    expect(parse(16, "t")).toBe(1);
    expect(parse(16, "f")).toBe(0);
  });

  it("keeps NUMERIC as a string, like mysql2's DECIMAL", () => {
    expect(parse(1700, "12.50")).toBe("12.50");
  });

  it("parses timestamps into Dates", () => {
    expect(parse(1184, "2026-10-24 09:00:00+06")).toEqual(new Date("2026-10-24T03:00:00Z"));
  });
});
