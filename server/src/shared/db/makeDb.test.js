import { describe, expect, it, jest } from "@jest/globals";
import { makeDb } from "./makeDb.js";

// A driver double that records every call, so the tests see what makeDb asks of it.
function fakeDriver({ results = [], classify = () => null } = {}) {
  const calls = [];
  const queue = [...results];
  const client = { id: "client" };
  return {
    calls,
    client,
    dialect: "fake",
    run: jest.fn(async (executor, sql, params) => {
      calls.push({ executor, sql, params });
      return queue.shift() ?? { rows: [], rowCount: 0 };
    }),
    insert: jest.fn(async (executor, sql, params, idColumn) => {
      calls.push({ executor, sql, params, idColumn });
      return 42;
    }),
    connect: jest.fn(async () => client),
    release: jest.fn(),
    begin: jest.fn(async () => calls.push("BEGIN")),
    commit: jest.fn(async () => calls.push("COMMIT")),
    rollback: jest.fn(async () => calls.push("ROLLBACK")),
    classify,
    end: jest.fn(async () => {}),
  };
}

describe("makeDb", () => {
  it("returns rows and a row count", async () => {
    const driver = fakeDriver({ results: [{ rows: [{ id: 1 }, { id: 2 }], rowCount: 2 }] });
    const db = makeDb(driver);

    await expect(db.query("SELECT id FROM t WHERE a = ?", [5])).resolves.toEqual({
      rows: [{ id: 1 }, { id: 2 }],
      rowCount: 2,
    });
    expect(driver.calls[0]).toEqual({ executor: null, sql: "SELECT id FROM t WHERE a = ?", params: [5] });
  });

  it("defaults params to an empty list", async () => {
    const driver = fakeDriver();
    await makeDb(driver).query("SELECT 1");

    expect(driver.calls[0].params).toEqual([]);
  });

  it("one() gives the first row, or null when there is none", async () => {
    const driver = fakeDriver({ results: [{ rows: [{ id: 7 }], rowCount: 1 }, { rows: [], rowCount: 0 }] });
    const db = makeDb(driver);

    await expect(db.one("SELECT 1")).resolves.toEqual({ id: 7 });
    await expect(db.one("SELECT 1")).resolves.toBeNull();
  });

  it("insert() returns the new row's id", async () => {
    const driver = fakeDriver();

    await expect(makeDb(driver).insert("INSERT INTO t (a) VALUES (?)", [1], "id")).resolves.toBe(42);
    expect(driver.calls[0]).toMatchObject({ executor: null, idColumn: "id" });
  });

  describe("withTransaction", () => {
    it("runs the work on one client and commits", async () => {
      const driver = fakeDriver();
      const db = makeDb(driver);

      const result = await db.withTransaction(async (tx) => {
        await tx.query("UPDATE t SET a = ?", [1]);
        await tx.insert("INSERT INTO t (a) VALUES (?)", [2], "id");
        return "done";
      });

      expect(result).toBe("done");
      expect(driver.calls).toEqual([
        "BEGIN",
        { executor: driver.client, sql: "UPDATE t SET a = ?", params: [1] },
        { executor: driver.client, sql: "INSERT INTO t (a) VALUES (?)", params: [2], idColumn: "id" },
        "COMMIT",
      ]);
      expect(driver.release).toHaveBeenCalledWith(driver.client);
    });

    it("rolls back, releases the client and rethrows when the work fails", async () => {
      const driver = fakeDriver();
      const failure = new Error("boom");

      await expect(
        makeDb(driver).withTransaction(async () => {
          throw failure;
        }),
      ).rejects.toBe(failure);
      expect(driver.calls).toEqual(["BEGIN", "ROLLBACK"]);
      expect(driver.release).toHaveBeenCalledWith(driver.client);
    });

    it("gives nested work the same transaction", async () => {
      const driver = fakeDriver();

      await makeDb(driver).withTransaction(async (tx) => {
        await tx.withTransaction(async (inner) => inner.query("SELECT 1"));
      });

      expect(driver.calls.filter((c) => c === "BEGIN")).toHaveLength(1);
      expect(driver.calls[1].executor).toBe(driver.client);
    });
  });

  it("names the database errors the app handles", () => {
    const classify = (err) => err.kind;
    const db = makeDb(fakeDriver({ classify }));

    expect(db.isUniqueViolation({ kind: "unique" })).toBe(true);
    expect(db.isUniqueViolation({ kind: "foreignKey" })).toBe(false);
    expect(db.isForeignKeyViolation({ kind: "foreignKey" })).toBe(true);
    expect(db.isDeadlock({ kind: "deadlock" })).toBe(true);
    expect(db.isUniqueViolation(null)).toBe(false);
  });

  it("tells which database it talks to", () => {
    expect(makeDb(fakeDriver()).dialect).toBe("fake");
  });
});

describe("ident", () => {
  it("quotes an identifier the driver's way", () => {
    const driver = { ...fakeDriver(), quote: (name) => `[${name}]` };

    expect(makeDb(driver).ident("Students")).toBe("[Students]");
  });
});
