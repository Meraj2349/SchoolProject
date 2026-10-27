import db, { assignments, insertList } from "../../../shared/db/index.js";
import { branchOrSchoolFilter } from "../../../../utils/branchFilter.js";

/**
 * PostgreSQL adapter for one content table. `table`, `idColumn`, `visibleColumn`
 * and `orderBy` are fixed in code (index.js), never taken from a request.
 * Rows to insert or change are objects keyed by column name: the keys become
 * quoted identifiers and the values parameters.
 */
export function makePostgresContentRepository({ table, idColumn, visibleColumn = null, orderBy }) {
  const from = db.ident(table);
  const id = db.ident(idColumn);

  return {
    async list({ branchId, onlyVisible }) {
      const { clause, params } = branchOrSchoolFilter(branchId);
      const visible = onlyVisible && visibleColumn ? `AND ${db.ident(visibleColumn)} = TRUE` : "";
      const { rows } = await db.query(`SELECT * FROM ${from} WHERE 1=1 ${clause} ${visible} ORDER BY ${orderBy}`, params);
      return rows;
    },

    async find(itemId) {
      const { rows } = await db.query(`SELECT * FROM ${from} WHERE ${id} = ?`, [itemId]);
      return rows[0] ?? null;
    },

    /** The item when it is shown (kinds without a visible column are always shown). */
    async findVisible(itemId) {
      const visible = visibleColumn ? `AND ${db.ident(visibleColumn)} = TRUE` : "";
      const { rows } = await db.query(`SELECT * FROM ${from} WHERE ${id} = ? ${visible}`, [itemId]);
      return rows[0] ?? null;
    },

    async insert(row) {
      const values = insertList(row, db.ident);
      return db.insert(`INSERT INTO ${from} ${values.sql}`, values.params, idColumn);
    },

    async update(itemId, changes) {
      const set = assignments(changes, db.ident);
      await db.query(`UPDATE ${from} SET ${set.sql} WHERE ${id} = ?`, [...set.params, itemId]);
    },

    async remove(itemId) {
      await db.query(`DELETE FROM ${from} WHERE ${id} = ?`, [itemId]);
    },
  };
}
