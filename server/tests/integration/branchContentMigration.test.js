import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { BRANCH_B, db, insert, resetDb, seedStudent } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/branch_content_migration.sql"), "utf8");
const CONTENT_TABLES = ["Notices", "NoticeAnnouncements", "News", "Messages", "Images", "Applications"];

afterAll(() => db.end());

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  try {
    await connection.query(MIGRATION);
  } finally {
    await connection.end();
  }
}

// Puts a table back the way it was before branches had content: no branch_id.
async function dropBranchColumn(table) {
  const { rows: fks } = await db.query(
    `SELECT CONSTRAINT_NAME AS name FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'branch_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [table],
  );
  for (const { name } of fks) await db.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${name}\``);
  await db.query(`ALTER TABLE \`${table}\` DROP COLUMN branch_id`);
}

describe("branch_content_migration.sql", () => {
  beforeEach(resetDb);

  it("adds the branch to content and applications, keeps old rows school-wide, and is safe to run twice", async () => {
    const { studentId } = await seedStudent({ branchId: BRANCH_B });
    for (const table of CONTENT_TABLES) await dropBranchColumn(table);
    await insert("Notices", { Title: "Old", Description: "Old notice" });
    await insert("Images", { ImagePath: "https://cdn.test/s.png", PublicID: "pid-s", ImageType: "student", StudentID: studentId });
    await insert("Images", { ImagePath: "https://cdn.test/x.png", PublicID: "pid-x", ImageType: "school" });

    await runMigration();
    await runMigration();

    const notice = await db.one("SELECT branch_id FROM Notices");
    const { rows: images } = await db.query("SELECT ImageType, branch_id FROM Images ORDER BY ImageID");
    expect(notice.branch_id).toBeNull();
    // A student's photo belongs to the student's branch.
    expect(images).toEqual([
      { ImageType: "student", branch_id: BRANCH_B },
      { ImageType: "school", branch_id: null },
    ]);
    await expect(insert("News", { title_bn: "x", title_en: "x", date: "2030-01-01", branch_id: 999 })).rejects.toThrow(
      /foreign key/i,
    );
  });
});
