import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import { runMigrations } from "../../src/shared/db/migrate.js";
import {
  checkSource,
  connectMysql,
  connectPostgres,
  copyAll,
  verifyAll,
} from "../../scripts/mysql-to-postgres/copier.js";

// The data copy for the cutover (docs/postgres-cutover.md): a MySQL database
// built from Sql/database.sql is copied into a PostgreSQL database built by
// the dbmate migrations. Needs both servers (TEST_MYSQL_* and TEST_PG_*).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MYSQL_SCHEMA = path.resolve(__dirname, "../../Sql/database.sql");
const PG_MIGRATIONS = path.resolve(__dirname, "../../db/migrations");

const SOURCE = "school_copy_source";
const TARGET = "school_copy_target";
const DHAKA = "+06:00";

// Building both databases takes a few seconds.
jest.setTimeout(60_000);

const mysqlSettings = {
  host: process.env.TEST_MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.TEST_MYSQL_PORT || 3306),
  user: process.env.TEST_MYSQL_USER || "school_test",
  password: process.env.TEST_MYSQL_PASSWORD ?? "school_test",
};
const pgSettings = {
  host: process.env.TEST_PG_HOST || "127.0.0.1",
  port: Number(process.env.TEST_PG_PORT || 5432),
  user: process.env.TEST_PG_USER || "school_test",
  password: process.env.TEST_PG_PASSWORD ?? "school_test",
};

let source; // the tool's MySQL connection
let target; // the tool's PostgreSQL client
let admin; // a plain MySQL connection for setting up awkward data

async function buildSource() {
  const setup = await mysql.createConnection({ ...mysqlSettings, multipleStatements: true });
  try {
    await setup.query(`DROP DATABASE IF EXISTS \`${SOURCE}\``);
    await setup.query(`CREATE DATABASE \`${SOURCE}\``);
    await setup.query(`USE \`${SOURCE}\``);
    await setup.query(fs.readFileSync(MYSQL_SCHEMA, "utf8"));
  } finally {
    await setup.end();
  }
}

async function buildTarget() {
  const setup = new pg.Client({ ...pgSettings, database: "postgres" });
  await setup.connect();
  try {
    await setup.query(`DROP DATABASE IF EXISTS "${TARGET}" WITH (FORCE)`);
    await setup.query(`CREATE DATABASE "${TARGET}"`);
  } finally {
    await setup.end();
  }
  const client = new pg.Client({ ...pgSettings, database: TARGET });
  await client.connect();
  try {
    await runMigrations({
      client,
      files: fs.readdirSync(PG_MIGRATIONS),
      read: (file) => fs.readFileSync(path.join(PG_MIGRATIONS, file), "utf8"),
    });
  } finally {
    await client.end();
  }
}

async function connect() {
  source = await connectMysql({ ...mysqlSettings, database: SOURCE });
  target = await connectPostgres({ ...pgSettings, database: TARGET });
  admin = await mysql.createConnection({ ...mysqlSettings, database: SOURCE });
  await admin.query("SET time_zone = '+06:00'");
}

async function disconnect() {
  await Promise.all([source?.end(), target?.end(), admin?.end()]);
}

/** A small school with the column types that need converting. */
async function seedSource() {
  await admin.query(
    `INSERT INTO Branches (id, name_bn, name_en, latitude, is_proposed, established_date, created_at)
     VALUES (7, 'চাঁদপুর শাখা', 'Chandpur', 23.12345678, 1, '2001-01-01', '2026-10-27 08:15:00')`,
  );
  await admin.query("INSERT INTO Classes (ClassID, ClassName, Section, branch_id) VALUES (40, 'Class 5', 'Good', 7)");
  await admin.query(
    `INSERT INTO Students (StudentID, FirstName, LastName, RollNumber, DateOfBirth, Gender, ClassID, AdmissionDate, branch_id)
     VALUES (500, 'রহিম', 'Karim', '12A', '2015-03-01', 'Male', 40, '2026-01-01', 7),
            (501, 'Ayesha', 'Akter', '3', '2015-05-09', 'Female', 40, '2026-01-01', 7)`,
  );
  await admin.query(
    `INSERT INTO Attendance (AttendanceID, StudentID, ClassID, ClassDate, Status, branch_id, MarkedByType, MarkedAt)
     VALUES (900, 500, 40, '2026-10-26', 'Present', 7, 'admin', '2026-10-26 09:30:00.250')`,
  );
  await admin.query(
    `INSERT INTO QuizQuestions (QuestionID, Prompt, OptionsJSON, CorrectAnswer, Active)
     VALUES (60, '২ + ২ = ?', '["3", "4", {"b": 1, "a": 2}]', 'B', 0)`,
  );
  // DATETIME (no time zone of its own): the school's wall-clock time.
  await admin.query(
    `INSERT INTO QuizSessions (SessionID, TotalQuestions, CorrectAnswers, ScorePercentage, TimeTakenSeconds, StartedAt)
     VALUES (70, 10, 7, 70.00, 300, '2026-10-27 10:00:00')`,
  );
}

beforeAll(async () => {
  await Promise.all([buildSource(), buildTarget()]);
  await connect();
});

afterAll(disconnect);

describe("checkSource", () => {
  it("finds nothing wrong with a database built from Sql/database.sql", async () => {
    await seedSource();

    expect(await checkSource({ source, target })).toEqual([]);
  });
});

describe("copyAll", () => {
  let report;

  beforeAll(async () => {
    report = await copyAll({ source, target, offset: DHAKA });
  });

  it("replaces the target's seed rows with MySQL's rows", async () => {
    const [[{ branches }]] = await admin.query("SELECT COUNT(*) AS branches FROM Branches");
    const { rows } = await target.query('SELECT count(*)::int AS branches FROM "Branches"');

    expect(rows[0].branches).toBe(branches);
    expect(report.find((t) => t.table === "Branches").rows).toBe(branches);
  });

  it("keeps text, numbers, dates and booleans", async () => {
    const { rows } = await target.query('SELECT * FROM "Branches" WHERE id = 7');

    expect(rows[0]).toMatchObject({
      name_bn: "চাঁদপুর শাখা",
      latitude: "23.12345678",
      is_proposed: true,
      established_date: "2001-01-01",
    });
  });

  it("keeps the instant of each time, read in the source's time zone", async () => {
    const branch = await target.query('SELECT created_at FROM "Branches" WHERE id = 7');
    const attendance = await target.query('SELECT "MarkedAt" FROM "Attendance" WHERE "AttendanceID" = 900');

    expect(branch.rows[0].created_at.toISOString()).toBe("2026-10-27T02:15:00.000Z");
    expect(attendance.rows[0].MarkedAt.toISOString()).toBe("2026-10-26T03:30:00.250Z");
  });

  it("reads DATETIME, which has no time zone, as the source's wall-clock time", async () => {
    const { rows } = await target.query('SELECT "StartedAt" FROM "QuizSessions" WHERE "SessionID" = 70');

    expect(rows[0].StartedAt.toISOString()).toBe("2026-10-27T04:00:00.000Z");
  });

  it("keeps JSON arrays as JSON and booleans that are false", async () => {
    const { rows } = await target.query('SELECT "OptionsJSON", "Active", "CorrectAnswer" FROM "QuizQuestions" WHERE "QuestionID" = 60');

    expect(rows[0]).toEqual({ OptionsJSON: ["3", "4", { a: 2, b: 1 }], Active: false, CorrectAnswer: "B" });
  });

  it("lets new rows continue after the highest copied id", async () => {
    const { rows } = await target.query(
      `INSERT INTO "Students" ("FirstName", "LastName", "RollNumber", "DateOfBirth", "Gender", "ClassID", "AdmissionDate", branch_id)
       VALUES ('New', 'Student', '9', '2015-01-01', 'Male', 40, '2026-10-28', 7) RETURNING "StudentID"`,
    );
    await target.query('DELETE FROM "Students" WHERE "StudentID" = $1', [rows[0].StudentID]);

    expect(rows[0].StudentID).toBe(502);
  });

  it("finds every table equal afterwards", async () => {
    const tables = await verifyAll({ source, target, offset: DHAKA });

    expect(tables.length).toBeGreaterThan(30);
    expect(tables.filter((t) => !t.match)).toEqual([]);
  });

  it("can be run again (the final copy after a rehearsal)", async () => {
    await admin.query("UPDATE Students SET FirstName = 'Rahim' WHERE StudentID = 500");

    await copyAll({ source, target, offset: DHAKA });

    const { rows } = await target.query('SELECT "FirstName" FROM "Students" WHERE "StudentID" = 500');
    expect(rows[0].FirstName).toBe("Rahim");
  });
});

describe("verifyAll", () => {
  beforeEach(() => copyAll({ source, target, offset: DHAKA }));

  it("names the table and the rows that differ", async () => {
    await target.query(`UPDATE "Students" SET "LastName" = 'Changed' WHERE "StudentID" = 501`);
    await target.query('DELETE FROM "Attendance" WHERE "AttendanceID" = 900');

    const differing = (await verifyAll({ source, target, offset: DHAKA })).filter((t) => !t.match);

    expect(differing).toEqual([
      expect.objectContaining({ table: "Attendance", mysqlRows: 1, postgresRows: 0, differingKeys: ["900"] }),
      expect.objectContaining({ table: "Students", mysqlRows: 2, postgresRows: 2, differingKeys: ["501"] }),
    ]);
  });

  it("notices DATETIME values read in the wrong time zone", async () => {
    const tables = await verifyAll({ source, target, offset: "+00:00" });

    expect(tables.filter((t) => !t.match).map((t) => t.table)).toEqual(["QuizSessions"]);
  });
});

describe("checkSource finds data PostgreSQL would refuse", () => {
  beforeEach(async () => {
    await disconnect();
    await buildSource();
    await connect();
    await seedSource();
  });

  it("a zero date", async () => {
    await admin.query("SET SESSION sql_mode = ''");
    await admin.query("UPDATE Students SET DateOfBirth = '0000-00-00' WHERE StudentID = 501");

    expect(await checkSource({ source, target })).toEqual(['Students."DateOfBirth": 1 zero date(s), e.g. StudentID 501']);
  });

  it("an empty value MySQL stored for an invalid ENUM", async () => {
    await admin.query("SET SESSION sql_mode = ''");
    await admin.query("UPDATE Attendance SET Status = 'Holiday' WHERE AttendanceID = 900");

    expect(await checkSource({ source, target })).toEqual(['Attendance."Status": 1 empty ENUM value(s), e.g. AttendanceID 900']);
  });

  it("values that differ only in case where PostgreSQL's unique key ignores case", async () => {
    // A column MySQL compares exactly (e.g. after a manual ALTER) can hold both.
    await admin.query("ALTER TABLE ClassNames MODIFY name varchar(50) COLLATE utf8mb4_bin NOT NULL");
    await admin.query("INSERT INTO ClassNames (name, sort_order) VALUES ('Class Five', 50), ('class five', 51)");

    expect(await checkSource({ source, target })).toEqual([
      'ClassNames (name): 1 group(s) of rows that differ only in upper/lower case, e.g. "class five"',
    ]);
  });

  it("a NUL character, which PostgreSQL text cannot hold", async () => {
    await admin.query("UPDATE Students SET Address = CONCAT('Road 1', CHAR(0)) WHERE StudentID = 500");

    expect(await checkSource({ source, target })).toEqual(['Students."Address": 1 value(s) with a NUL character, e.g. StudentID 500']);
  });

  it("a MySQL table or column the PostgreSQL schema does not have", async () => {
    await admin.query("ALTER TABLE Students ADD COLUMN Nickname varchar(20)");

    expect(await checkSource({ source, target })).toEqual(['Students."Nickname": column missing in PostgreSQL']);
  });

  it("and copyAll refuses to start", async () => {
    await admin.query("ALTER TABLE Students ADD COLUMN Nickname varchar(20)");

    await expect(copyAll({ source, target, offset: DHAKA })).rejects.toThrow(/Nickname/);
  });
});
