import { describe, expect, it } from "@jest/globals";
import { compareSchemas, copyOrder } from "../../../scripts/mysql-to-postgres/plan.js";

describe("copyOrder", () => {
  it("copies every table after the tables it references", () => {
    const order = copyOrder(
      ["Results", "Students", "Exams", "Branches", "Classes"],
      [
        { table: "Results", references: "Students" },
        { table: "Results", references: "Exams" },
        { table: "Students", references: "Classes" },
        { table: "Students", references: "Branches" },
        { table: "Classes", references: "Branches" },
      ],
    );

    expect(order).toHaveLength(5);
    const before = (a, b) => expect(order.indexOf(a)).toBeLessThan(order.indexOf(b));
    before("Branches", "Classes");
    before("Classes", "Students");
    before("Students", "Results");
    before("Exams", "Results");
  });

  it("is the same order on every run (alphabetical among equals)", () => {
    expect(copyOrder(["b", "c", "a"], [])).toEqual(["a", "b", "c"]);
  });

  it("allows a table that references itself", () => {
    expect(copyOrder(["Admin"], [{ table: "Admin", references: "Admin" }])).toEqual(["Admin"]);
  });

  it("refuses a cycle between tables", () => {
    expect(() =>
      copyOrder(
        ["a", "b"],
        [
          { table: "a", references: "b" },
          { table: "b", references: "a" },
        ],
      ),
    ).toThrow(/cycle.*a.*b/);
  });
});

describe("compareSchemas", () => {
  it("finds nothing when both databases have the same tables and columns", () => {
    const tables = { Students: ["StudentID", "FirstName"] };

    expect(compareSchemas(tables, { Students: ["FirstName", "StudentID"] })).toEqual([]);
  });

  it("names tables and columns missing on either side", () => {
    const problems = compareSchemas(
      { Students: ["StudentID", "Nickname"], OldTable: ["id"] },
      { Students: ["StudentID", "branch_id"], Fees: ["id"] },
    );

    expect(problems).toEqual([
      "Fees: table missing in MySQL (run the Sql/ migrations first)",
      "OldTable: table missing in PostgreSQL",
      'Students."Nickname": column missing in PostgreSQL',
      'Students."branch_id": column missing in MySQL (run the Sql/ migrations first)',
    ]);
  });
});
