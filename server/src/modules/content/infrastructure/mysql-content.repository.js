import db from "../../../../config/db.config.js";
import { branchOrSchoolFilter } from "../../../../utils/branchFilter.js";

/**
 * MySQL adapter for one content table. `table`, `idColumn`, `visibleColumn`
 * and `orderBy` are fixed in code (index.js), never taken from a request.
 * Rows to insert or change are objects keyed by column name; mysql2 escapes
 * the keys as identifiers and the values as parameters.
 */
export function makeMysqlContentRepository({ table, idColumn, visibleColumn = null, orderBy }) {
  const from = `\`${table}\``;
  const id = `\`${idColumn}\``;

  return {
    async list({ branchId, onlyVisible }) {
      const { clause, params } = branchOrSchoolFilter(branchId);
      const visible = onlyVisible && visibleColumn ? `AND \`${visibleColumn}\` = TRUE` : "";
      const [rows] = await db.query(`SELECT * FROM ${from} WHERE 1=1 ${clause} ${visible} ORDER BY ${orderBy}`, params);
      return rows;
    },

    async find(itemId) {
      const [rows] = await db.query(`SELECT * FROM ${from} WHERE ${id} = ?`, [itemId]);
      return rows[0] ?? null;
    },

    async insert(row) {
      const [result] = await db.query(`INSERT INTO ${from} SET ?`, [row]);
      return result.insertId;
    },

    async update(itemId, changes) {
      await db.query(`UPDATE ${from} SET ? WHERE ${id} = ?`, [changes, itemId]);
    },

    async remove(itemId) {
      await db.query(`DELETE FROM ${from} WHERE ${id} = ?`, [itemId]);
    },
  };
}
