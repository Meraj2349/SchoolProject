import { describe, expect, it, jest } from "@jest/globals";
import { makeMysqlDriver } from "./mysqlDriver.js";

const pool = (result) => ({ query: jest.fn(async () => [result]) });

describe("MySQL driver", () => {
  it("returns SELECT rows with their count", async () => {
    const driver = makeMysqlDriver(pool([{ id: 1 }]));

    await expect(driver.run(null, "SELECT 1", [])).resolves.toEqual({ rows: [{ id: 1 }], rowCount: 1 });
  });

  it("returns the affected row count for writes", async () => {
    const driver = makeMysqlDriver(pool({ affectedRows: 3, insertId: 0 }));

    await expect(driver.run(null, "UPDATE t SET a = 1", [])).resolves.toEqual({ rows: [], rowCount: 3 });
  });

  it("runs on the transaction's connection when given one", async () => {
    const connection = pool([]);
    const driver = makeMysqlDriver(pool([]));

    await driver.run(connection, "SELECT 1", [5]);

    expect(connection.query).toHaveBeenCalledWith("SELECT 1", [5]);
  });

  it("returns insertId for an insert", async () => {
    const driver = makeMysqlDriver(pool({ affectedRows: 1, insertId: 17 }));

    await expect(driver.insert(null, "INSERT INTO t (a) VALUES (?)", [1], "id")).resolves.toBe(17);
  });

  it.each([
    ["ER_DUP_ENTRY", "unique"],
    ["ER_NO_REFERENCED_ROW_2", "foreignKey"],
    ["ER_ROW_IS_REFERENCED_2", "foreignKey"],
    ["ER_LOCK_DEADLOCK", "deadlock"],
    ["ER_PARSE_ERROR", null],
  ])("classifies %s as %s", (code, kind) => {
    expect(makeMysqlDriver(pool([])).classify({ code })).toBe(kind);
  });
});

describe("MySQL identifiers", () => {
  it("quotes with backticks", () => {
    expect(makeMysqlDriver({}).quote("year")).toBe("`year`");
  });
});
