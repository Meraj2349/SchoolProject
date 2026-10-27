import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

// scripts/backup-postgres.sh (run nightly by cron on the server), with fake
// `docker` and `rsync` commands in place of the real ones.
const SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../scripts/backup-postgres.sh");

const FAKE_DOCKER = `#!/bin/sh
echo "docker $*" >> "$FAKE_LOG"
case "$*" in
  *pg_dumpall*) [ -n "$FAKE_DUMPALL_FAILS" ] && exit 1; echo "-- roles" ;;
  *pg_dump*) [ -n "$FAKE_DUMP_FAILS" ] && { printf 'PGDMP partial'; exit 1; }; printf 'PGDMP fake dump' ;;
  *pg_restore*) cat > /dev/null; [ -n "$FAKE_RESTORE_FAILS" ] && exit 1; echo "; Archive" ;;
esac
`;
const FAKE_RSYNC = `#!/bin/sh
echo "rsync $*" >> "$FAKE_LOG"
`;

let dir;
let backups;
let log;

const run = (env = {}) =>
  spawnSync("bash", [SCRIPT], {
    encoding: "utf8",
    env: {
      PATH: `${path.join(dir, "bin")}:${process.env.PATH}`,
      FAKE_LOG: log,
      BACKUP_DIR: backups,
      ...env,
    },
  });

const files = () => fs.readdirSync(backups).sort();
const calls = () => (fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "");

const ageFile = (name, days) => {
  const file = path.join(backups, name);
  fs.writeFileSync(file, "old");
  const when = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  fs.utimesSync(file, when, when);
};

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "backup-test-"));
  backups = path.join(dir, "backups");
  log = path.join(dir, "calls.log");
  fs.mkdirSync(path.join(dir, "bin"));
  fs.writeFileSync(path.join(dir, "bin/docker"), FAKE_DOCKER, { mode: 0o755 });
  fs.writeFileSync(path.join(dir, "bin/rsync"), FAKE_RSYNC, { mode: 0o755 });
});

afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("backup-postgres.sh", () => {
  it("writes the database dump and the roles, named by date and time", () => {
    const result = run();

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    const [globals, dump] = files();
    expect(dump).toMatch(/^school-\d{8}-\d{6}\.dump$/);
    expect(globals).toMatch(/^globals-\d{8}-\d{6}\.sql$/);
    expect(fs.readFileSync(path.join(backups, dump), "utf8")).toBe("PGDMP fake dump");
    expect(fs.readFileSync(path.join(backups, globals), "utf8")).toBe("-- roles\n");
  });

  it("dumps inside the postgres container, in pg_dump's custom format", () => {
    run();

    expect(calls()).toMatch(/docker compose exec -T postgres .*pg_dump .*-Fc/);
    expect(calls()).toMatch(/docker compose exec -T postgres .*pg_dumpall .*--globals-only/);
  });

  it("checks that the new dump can be read back", () => {
    run();

    expect(calls()).toMatch(/docker compose exec -T postgres pg_restore --list/);
  });

  it("deletes backups older than BACKUP_KEEP_DAYS and keeps the rest", () => {
    fs.mkdirSync(backups);
    ageFile("school-20260101-020000.dump", 40);
    ageFile("globals-20260101-020000.sql", 40);
    ageFile("school-20261020-020000.dump", 5);
    ageFile("notes.txt", 40);

    const result = run({ BACKUP_KEEP_DAYS: "14" });

    expect(result.status).toBe(0);
    expect(files()).not.toContain("school-20260101-020000.dump");
    expect(files()).not.toContain("globals-20260101-020000.sql");
    expect(files()).toEqual(expect.arrayContaining(["school-20261020-020000.dump", "notes.txt"]));
    expect(files()).toHaveLength(4);
  });

  it("fails without leaving a half-written dump, and deletes nothing old", () => {
    fs.mkdirSync(backups);
    ageFile("school-20260101-020000.dump", 40);

    const result = run({ FAKE_DUMP_FAILS: "1" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/pg_dump failed/);
    expect(files()).toEqual(["school-20260101-020000.dump"]);
  });

  it("fails when the dump cannot be read back", () => {
    const result = run({ FAKE_RESTORE_FAILS: "1" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/cannot be read back/);
    expect(files().filter((f) => f.endsWith(".dump"))).toEqual([]);
  });

  it("fails when the roles cannot be dumped", () => {
    const result = run({ FAKE_DUMPALL_FAILS: "1" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/pg_dumpall failed/);
    expect(files()).toEqual([]);
  });

  it("copies the new files off the server when BACKUP_REMOTE is set", () => {
    run({ BACKUP_REMOTE: "backup@files.example:/srv/school" });

    expect(calls()).toMatch(/rsync .*school-\d{8}-\d{6}\.dump .*globals-\d{8}-\d{6}\.sql backup@files\.example:\/srv\/school/);
  });

  it("does not try to copy anywhere without BACKUP_REMOTE", () => {
    run();

    expect(calls()).not.toMatch(/rsync/);
  });
});
