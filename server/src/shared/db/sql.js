// SQL fragments that work the same on MySQL and PostgreSQL. They replace
// mysql2's own expansion of arrays (`IN (?)`, `VALUES ?`), which pg lacks.

/** `IN ${sql}` for a list of values. An empty list matches nothing. */
export function inList(values) {
  if (values.length === 0) return { sql: "(NULL)", params: [] };
  return { sql: `(${values.map(() => "?").join(", ")})`, params: [...values] };
}

/** `VALUES ${sql}` for several rows of values. */
export function valuesRows(rows) {
  if (rows.length === 0) throw new Error("valuesRows needs at least one row");
  const width = rows[0].length;
  if (rows.some((row) => row.length !== width)) throw new Error("valuesRows: every row needs the same number of values");
  const tuple = `(${Array(width).fill("?").join(", ")})`;
  return { sql: rows.map(() => tuple).join(", "), params: rows.flat() };
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function columnsOf(row, quote) {
  // Like mysql2's `SET ?`: functions are skipped and undefined is written as NULL.
  const entries = Object.entries(row)
    .filter(([, value]) => typeof value !== "function")
    .map(([name, value]) => [name, value === undefined ? null : value]);
  if (entries.length === 0) throw new Error("Need at least one column to write");
  for (const [name] of entries) if (!IDENTIFIER.test(name)) throw new Error(`Invalid column name: ${name}`);
  return { names: entries.map(([name]) => quote(name)), params: entries.map(([, value]) => value) };
}

/** `INSERT INTO t ${sql}` for an object keyed by column name. */
export function insertList(row, quote) {
  const { names, params } = columnsOf(row, quote);
  return { sql: `(${names.join(", ")}) VALUES (${names.map(() => "?").join(", ")})`, params };
}

/** `UPDATE t SET ${sql}` for an object keyed by column name. */
export function assignments(changes, quote) {
  const { names, params } = columnsOf(changes, quote);
  return { sql: names.map((name) => `${name} = ?`).join(", "), params };
}
