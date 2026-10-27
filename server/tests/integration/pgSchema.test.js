import { afterAll, describe, expect, it } from "@jest/globals";
import { db } from "./helpers.js";

// Rules for the PostgreSQL schema that MySQL kept by itself.
const onPostgres = db.dialect === "postgres" ? describe : describe.skip;

onPostgres("PostgreSQL schema rules", () => {
  afterAll(() => db.end());

  // MySQL indexes every foreign-key column automatically; PostgreSQL never
  // does. Without one, deleting a parent scans the child table, and joins and
  // branch filters on the column scan too.
  it("indexes every foreign key", async () => {
    const { rows } = await db.query(`
      SELECT c.conrelid::regclass::text AS "table", c.conname AS "foreignKey"
      FROM pg_constraint c
      WHERE c.contype = 'f' AND c.connamespace = current_schema()::regnamespace
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = c.conrelid
            AND (SELECT array_agg(u.k ORDER BY u.ord)
                 FROM unnest(i.indkey::int2[]) WITH ORDINALITY u(k, ord)
                 WHERE u.ord <= cardinality(c.conkey)) = c.conkey)
      ORDER BY 1, 2`);

    expect(rows).toEqual([]);
  });
});
