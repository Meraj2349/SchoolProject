import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { count, db, insert, resetDb } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/star_family_branches_migration.sql"), "utf8");

// resetDb seeds two branches ("Main", "North") that match none of the family's names.
const FIXTURE_BRANCHES = 2;

const FAMILY = [
  ["Star Shiksha Paribar, Natiapara (Head Office)", "স্টার শিক্ষা পরিবার, নাটিয়াপাড়া (প্রধান কার্যালয়)", "Natiapara, Delduar, Tangail", "নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল"],
  ["Bathuli Branch", "বাথুলী শাখা", "Bathuli, Delduar, Tangail", "বাথুলী, দেলদুয়ার, টাঙ্গাইল"],
  ["Pakulla Branch", "পাকুল্যা শাখা", "Pakulla Zamindar Bari, Mirzapur, Tangail", "পাকুল্যা জমিদার বাড়ী, মির্জাপুর, টাঙ্গাইল"],
  ["Mirzapur Branch", "মির্জাপুর শাখা", "Samabay Market (2nd floor), Mirzapur, Tangail", "সমবায় মার্কেট (২য় তলা), মির্জাপুর, টাঙ্গাইল"],
  ["Delduar Branch", "দেলদুয়ার শাখা", "Next to the Upazila gate, Delduar, Tangail", "উপজেলা গেইট সংলগ্ন, দেলদুয়ার, টাঙ্গাইল"],
  ["Dulla Branch", "দুল্যা শাখা", "Dulla Bazar, Delduar, Tangail", "দুল্যা বাজার, দেলদুয়ার, টাঙ্গাইল"],
].map(([name_en, name_bn, address_en, address_bn]) => ({ name_en, name_bn, address_en, address_bn }));

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

const addedBranches = async () => {
  const { rows } = await db.query(
    "SELECT name_en, name_bn, address_en, address_bn FROM Branches WHERE id > ? ORDER BY id",
    [FIXTURE_BRANCHES],
  );
  return rows;
};

describe("star_family_branches_migration.sql", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("adds every branch of the family exactly once, however often it runs", async () => {
    await runMigration();
    await runMigration();

    expect(await addedBranches()).toEqual(FAMILY);
  });

  it("never changes a branch the school already has, even one an admin renamed", async () => {
    const edited = { name_en: "Mirzapur Branch (edited)", name_bn: "মির্জাপুর (সম্পাদিত)", address_en: "Old market", address_bn: "পুরনো বাজার" };
    const id = await insert("Branches", edited);

    await runMigration();
    await runMigration();

    const stored = await db.one("SELECT name_en, name_bn, address_en, address_bn FROM Branches WHERE id = ?", [id]);
    expect(stored).toEqual(edited);
    expect(await count("Branches", "name_en LIKE '%Mirzapur%'")).toBe(1);
    expect(await count("Branches")).toBe(FIXTURE_BRANCHES + FAMILY.length);
  });

  it("matches branches by name, not by the town in another branch's address", async () => {
    await insert("Branches", FAMILY[0]); // head office, in Delduar
    await insert("Branches", FAMILY[2]); // Pakulla, in Mirzapur

    await runMigration();

    expect((await addedBranches()).map((b) => b.name_en)).toEqual([
      FAMILY[0].name_en,
      FAMILY[2].name_en,
      "Bathuli Branch",
      "Mirzapur Branch",
      "Delduar Branch",
      "Dulla Branch",
    ]);
  });

  it("matches a branch's name as a whole word, not inside another place's name", async () => {
    await insert("Branches", { name_en: "Abdullapur Branch", name_bn: "আবদুল্যাপুর শাখা" });
    await insert("Branches", { name_en: "Southdelduar Point", name_bn: "দক্ষিণদেলদুয়ার" });

    await runMigration();

    const names = (await addedBranches()).map((b) => b.name_en);
    expect(names).toContain("Dulla Branch");
    expect(names).toContain("Delduar Branch");
  });

  it("recognises the older seed names of the head office, Pakulla and Mirzapur", async () => {
    await insert("Branches", { name_en: "Star Academic School, Natiapara Branch", name_bn: "স্টার একাডেমিক স্কুল, নাটিয়াপাড়া শাখা" });
    await insert("Branches", { name_en: "Star Academic School, Pakullah Bazar Branch", name_bn: "স্টার একাডেমিক স্কুল, পাকুল্লা বাজার শাখা" });
    await insert("Branches", { name_en: "Star Academic School, Mirzapur Branch", name_bn: "স্টার একাডেমিক স্কুল, মির্জাপুর শাখা" });

    await runMigration();

    expect((await addedBranches()).slice(3).map((b) => b.name_en)).toEqual(["Bathuli Branch", "Delduar Branch", "Dulla Branch"]);
  });
});
