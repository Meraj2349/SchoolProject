import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { BRANCH_A, count, db, insert, resetDb, seedStudent } from "./helpers.js";

// How PostgreSQL compares each kind of text.
// Names and titles ignore case but keep every letter: য় is not য, ড় is not ড.
// Statuses, codes, ids, phone numbers and links compare exactly, so a status
// CHECK refuses 'PRESENT' as MySQL's ENUM did.
describe("text collations", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("refuses a status in the wrong case", async () => {
    const { classId, studentId } = await seedStudent();

    await expect(
      insert("Attendance", { StudentID: studentId, ClassID: classId, ClassDate: "2026-10-01", Status: "PRESENT", branch_id: BRANCH_A }),
    ).rejects.toThrow(/check constraint/i);
  });

  it("keeps distinct Bangla letters apart in names, still ignoring case", async () => {
    await insert("Teachers", { FirstName: "নয়ন", LastName: "Karim", branch_id: BRANCH_A });

    expect(await count("Teachers", `"FirstName" = ?`, ["নযন"])).toBe(0);
    expect(await count("Teachers", `"FirstName" = ?`, ["নয়ন"])).toBe(1);
    expect(await count("Teachers", `"LastName" = ?`, ["KARIM"])).toBe(1);
  });

  it("compares Cloudinary ids and phone numbers exactly", async () => {
    await insert("Images", { ImagePath: "https://res.cloudinary.com/x/AbC.jpg", PublicID: "school/AbC", ImageType: "school" });

    expect(await count("Images", `"PublicID" = ?`, ["school/abc"])).toBe(0);
    expect(await count("Images", `"PublicID" = ?`, ["school/AbC"])).toBe(1);
  });

  it("uses only the exact and the level-2 collations", async () => {
    const { rows } = await db.query(
      `SELECT table_name, column_name FROM information_schema.columns
       WHERE table_schema = current_schema() AND collation_name = 'ci'`,
    );

    expect(rows).toEqual([]);
  });
});
