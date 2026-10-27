import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { BRANCH_A, db, insert, resetDb } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POST = { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1, qualification_en: "Masters", qualification_bn: "স্নাতকোত্তর", salary_min: 10000, salary_max: 20000 };
const CIRCULAR = { title_en: "Urgent recruitment", title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি", circular_date: "2026-10-01", posts: [POST] };
const seed = (extra = {}) => insert("JobCirculars", { ...CIRCULAR, posts: JSON.stringify(CIRCULAR.posts), branch_id: BRANCH_A, ...extra });

afterAll(() => db.end());

describe("job circular migrations", () => {
  beforeEach(resetDb);

  async function run(file) {
    const sql = fs.readFileSync(path.resolve(__dirname, "../../Sql", file), "utf8");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });
    try {
      await connection.query(sql);
    } finally {
      await connection.end();
    }
  }

  it("create both tables with their links and the school's two past circulars, and are safe to run twice", async () => {
    await db.query("DROP TABLE JobApplications");
    await db.query("DROP TABLE JobCirculars");

    for (let i = 0; i < 2; i += 1) {
      await run("job_circulars_migration.sql");
      await run("job_applications_migration.sql");
    }

    const { rows: circulars } = await db.query(`SELECT title_bn, is_open, image_url FROM "JobCirculars" ORDER BY circular_date`);
    expect(circulars).toEqual([
      { title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি: অ্যাকাউন্টেন্ট", is_open: 0, image_url: "/images/circulars/accountant-2025-06-28.jpg" },
      { title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি: সহকারি শিক্ষক (বাংলা)", is_open: 0, image_url: "/images/circulars/assistant-teacher-bangla-2025-07-29.jpg" },
    ]);
    await expect(seed({ branch_id: 999 })).rejects.toThrow(/foreign key/i);
    await expect(insert("JobApplications", { circular_id: 999, post_index: 0, post_title_en: "x", post_title_bn: "x", full_name: "x", phone: "01700000000", address: "x", education: "x" })).rejects.toThrow(/foreign key/i);
  });
});
