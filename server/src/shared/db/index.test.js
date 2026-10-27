import { describe, expect, it } from "@jest/globals";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// index.js connects lazily, so importing it needs no database.
const INDEX = path.join(path.dirname(fileURLToPath(import.meta.url)), "index.js");

const load = (env) =>
  spawnSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(INDEX)}); console.log("loaded")`], {
    encoding: "utf8",
    env: { PATH: process.env.PATH, ...env },
  });

describe("the app's database", () => {
  it("is PostgreSQL without any DB_DIALECT", () => {
    expect(load({}).stdout).toContain("loaded");
  });

  it("accepts DB_DIALECT=postgres", () => {
    expect(load({ DB_DIALECT: "postgres" }).stdout).toContain("loaded");
  });

  it("refuses an old .env that still asks for MySQL", () => {
    const result = load({ DB_DIALECT: "mysql" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/DB_DIALECT=mysql is no longer supported/);
  });
});
