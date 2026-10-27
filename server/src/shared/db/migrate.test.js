import { describe, expect, it, jest } from "@jest/globals";
import { migrateUp, pendingMigrations, runMigrations } from "./migrate.js";

describe("migrateUp", () => {
  it("takes the SQL between dbmate's up and down markers", () => {
    expect(migrateUp("-- migrate:up\nCREATE TABLE a ();\n-- migrate:down\nDROP TABLE a;\n")).toBe("-- migrate:up\nCREATE TABLE a ();\n");
  });

  it("takes the whole file when there are no markers", () => {
    expect(migrateUp("CREATE TABLE a ();")).toBe("CREATE TABLE a ();");
  });
});

describe("pendingMigrations", () => {
  it("lists files not applied yet, oldest first, by their version", () => {
    const files = ["20261101000000_b.sql", "README.md", "20261024000000_a.sql", "20261201000000_c.sql"];

    expect(pendingMigrations(files, new Set(["20261024000000"]))).toEqual([
      { version: "20261101000000", file: "20261101000000_b.sql" },
      { version: "20261201000000", file: "20261201000000_c.sql" },
    ]);
  });
});

describe("runMigrations", () => {
  const fakeClient = (applied = []) => {
    const calls = [];
    return {
      calls,
      query: jest.fn(async (sql, params) => {
        calls.push(params ? [sql, params] : sql);
        if (sql.startsWith("SELECT version")) return { rows: applied.map((version) => ({ version })) };
        return { rows: [] };
      }),
    };
  };
  const files = {
    "20261024000000_initial.sql": "-- migrate:up\nCREATE TABLE a ();\n-- migrate:down\n",
    "20261101000000_more.sql": "-- migrate:up\nALTER TABLE a ADD b int;\n",
  };
  const read = (file) => files[file];

  it("applies each pending migration in its own transaction and records it, under a lock", async () => {
    const client = fakeClient(["20261024000000"]);

    const applied = await runMigrations({ client, files: Object.keys(files), read });

    expect(applied).toEqual(["20261101000000_more.sql"]);
    expect(client.calls).toEqual([
      expect.stringContaining("CREATE TABLE IF NOT EXISTS schema_migrations"),
      expect.stringContaining("pg_advisory_lock"),
      "SELECT version FROM schema_migrations",
      "BEGIN",
      "-- migrate:up\nALTER TABLE a ADD b int;\n",
      ["INSERT INTO schema_migrations (version) VALUES ($1)", ["20261101000000"]],
      "COMMIT",
      expect.stringContaining("pg_advisory_unlock"),
    ]);
  });

  it("rolls back a failing migration, stops, and still unlocks", async () => {
    const client = fakeClient();
    client.query.mockImplementation(async (sql) => {
      client.calls.push(sql);
      if (sql.startsWith("SELECT version")) return { rows: [] };
      if (sql.includes("CREATE TABLE a")) throw new Error("boom");
      return { rows: [] };
    });

    await expect(runMigrations({ client, files: Object.keys(files), read })).rejects.toThrow("boom");
    expect(client.calls).toContain("ROLLBACK");
    expect(client.calls).not.toContain("ALTER TABLE a ADD b int;");
    expect(client.calls.at(-1)).toEqual(expect.stringContaining("pg_advisory_unlock"));
  });
});
