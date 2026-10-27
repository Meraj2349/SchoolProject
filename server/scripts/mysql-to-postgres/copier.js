// Copies every row of the MySQL database into the PostgreSQL schema built by
// the dbmate migrations, and proves both hold the same data. Used for the
// cutover (docs/postgres-cutover.md); the CLI is index.js.
import crypto from "crypto";
import mysql from "mysql2/promise";
import pg from "pg";
import { compareSchemas, copyOrder } from "./plan.js";
import { canonicalRow, formatOffset, toPostgres } from "./values.js";

const PG_DATE = 1082;
const BATCH_ROWS = 1000;
// PostgreSQL allows 65535 parameters per statement.
const MAX_PARAMS = 60000;
const EXAMPLE_KEYS = 10;

const my = (name) => `\`${name.replaceAll("`", "``")}\``;
const pq = (name) => `"${name.replaceAll('"', '""')}"`;

/** A MySQL connection that reads values the way values.js expects them. */
export function connectMysql({ host, port, user, password, database }) {
  return mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    charset: "utf8mb4",
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
}

/** A PostgreSQL client that reads DATE as text, as the app does. */
export async function connectPostgres({ host, port, user, password, database }) {
  const client = new pg.Client({
    host,
    port,
    user,
    password,
    database,
    types: { getTypeParser: (oid, format) => (oid === PG_DATE ? (text) => text : pg.types.getTypeParser(oid, format)) },
  });
  await client.connect();
  return client;
}

/** The MySQL server's own UTC offset, the time zone its DATETIME values were written in. */
export async function mysqlOffset(source) {
  const [[row]] = await source.query("SELECT CAST(TIMEDIFF(NOW(), UTC_TIMESTAMP()) AS CHAR) AS diff");
  return formatOffset(row.diff);
}

// ── What each database has ──

async function targetSchema(target) {
  const columns = await target.query(
    `SELECT c.table_name, c.column_name, c.data_type, c.is_identity
       FROM information_schema.columns c
       JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = current_schema() AND t.table_type = 'BASE TABLE' AND c.table_name <> 'schema_migrations'
      ORDER BY c.table_name, c.ordinal_position`,
  );
  const tables = {};
  const identities = [];
  for (const row of columns.rows) {
    (tables[row.table_name] ??= []).push({ name: row.column_name, type: row.data_type });
    if (row.is_identity === "YES") identities.push({ table: row.table_name, column: row.column_name });
  }

  const keys = await target.query(
    `SELECT t.relname AS table_name, array_agg(a.attname::text ORDER BY k.ord) AS columns, i.indisprimary AS primary,
            bool_or(co.collname = 'ci2') AS ignores_case
       FROM pg_index i
       JOIN pg_class t ON t.oid = i.indrelid
       CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
       LEFT JOIN pg_collation co ON co.oid = a.attcollation
      WHERE t.relnamespace = current_schema()::regnamespace AND i.indisunique AND i.indexprs IS NULL
      GROUP BY i.indexrelid, t.relname, i.indisprimary`,
  );
  const primaryKeys = {};
  const caseInsensitiveKeys = [];
  for (const row of keys.rows) {
    if (row.primary) primaryKeys[row.table_name] = row.columns;
    else if (row.ignores_case) caseInsensitiveKeys.push({ table: row.table_name, columns: row.columns });
  }

  const foreignKeys = await target.query(
    `SELECT source.relname AS table, target.relname AS references
       FROM pg_constraint k
       JOIN pg_class source ON source.oid = k.conrelid
       JOIN pg_class target ON target.oid = k.confrelid
      WHERE k.contype = 'f' AND source.relnamespace = current_schema()::regnamespace`,
  );

  for (const table of Object.keys(tables)) {
    if (!primaryKeys[table]) throw new Error(`${table} has no primary key in PostgreSQL; the copy needs one`);
  }
  return { tables, identities, primaryKeys, caseInsensitiveKeys, foreignKeys: foreignKeys.rows };
}

async function sourceSchema(source) {
  const [rows] = await source.query(
    `SELECT c.TABLE_NAME AS table_name, c.COLUMN_NAME AS column_name, c.DATA_TYPE AS data_type
       FROM information_schema.COLUMNS c
       JOIN information_schema.TABLES t ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
      WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
      ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION`,
  );
  const tables = {};
  for (const row of rows) (tables[row.table_name] ??= []).push({ name: row.column_name, type: row.data_type });
  return tables;
}

const names = (tables) => Object.fromEntries(Object.entries(tables).map(([table, cols]) => [table, cols.map((c) => c.name)]));

// ── checkSource ──

const DATE_TYPES = new Set(["date", "datetime", "timestamp"]);
const TEXT_TYPES = new Set(["char", "varchar", "tinytext", "text", "mediumtext", "longtext"]);

const keyOf = (pk) => (pk.length === 1 ? my(pk[0]) : `CONCAT_WS(',', ${pk.map(my).join(", ")})`);

/**
 * Everything in MySQL that PostgreSQL would refuse or that has nowhere to go,
 * as sentences. Empty when the copy can run.
 */
export async function checkSource({ source, target }) {
  const pgSchema = await targetSchema(target);
  const mySchema = await sourceSchema(source);
  const schemaProblems = compareSchemas(names(mySchema), names(pgSchema.tables));
  if (schemaProblems.length) return schemaProblems;

  const problems = [];
  const findRows = async (table, column, where, what) => {
    const pk = pgSchema.primaryKeys[table];
    const [[row]] = await source.query(
      `SELECT COUNT(*) AS n, MIN(${keyOf(pk)}) AS example FROM ${my(table)} WHERE ${where}`,
    );
    if (Number(row.n) > 0) problems.push(`${table}."${column}": ${row.n} ${what}, e.g. ${pk.join(",")} ${row.example}`);
  };

  for (const [table, columns] of Object.entries(mySchema).sort(([a], [b]) => a.localeCompare(b))) {
    for (const { name, type } of columns) {
      const col = my(name);
      if (DATE_TYPES.has(type)) {
        // Zero dates and zero months/days ('2026-00-10'): the time part uses ':', never '-'.
        await findRows(table, name, `CAST(${col} AS CHAR) LIKE '0000%' OR CAST(${col} AS CHAR) LIKE '%-00%'`, "zero date(s)");
      } else if (type === "enum") {
        // MySQL without strict mode stores '' for a value not in the list.
        await findRows(table, name, `${col} = ''`, "empty ENUM value(s)");
      }
      if (TEXT_TYPES.has(type)) {
        // Compared as bytes: the _ai_ci collation ignores NUL (and matches it in Bangla text).
        await findRows(table, name, `LOCATE(X'00', CAST(${col} AS BINARY)) > 0`, "value(s) with a NUL character");
      }
    }
  }

  // PostgreSQL's ci2 keys ignore case but not accents; MySQL's columns may
  // have compared differently (a _bin collation), so rows unique there can
  // collide here.
  for (const { table, columns } of pgSchema.caseInsensitiveKeys) {
    const types = Object.fromEntries(pgSchema.tables[table].map((c) => [c.name, c.type]));
    const parts = columns.map((c) =>
      types[c] === "character varying" || types[c] === "text" || types[c] === "character"
        ? `LOWER(${my(c)}) COLLATE utf8mb4_bin`
        : my(c),
    );
    const [groups] = await source.query(
      `SELECT ${parts[0]} AS example FROM ${my(table)}
        WHERE ${columns.map((c) => `${my(c)} IS NOT NULL`).join(" AND ")}
        GROUP BY ${parts.join(", ")} HAVING COUNT(*) > 1 ORDER BY 1`,
    );
    if (groups.length) {
      problems.push(
        `${table} (${columns.join(", ")}): ${groups.length} group(s) of rows that differ only in upper/lower case, e.g. "${groups[0].example}"`,
      );
    }
  }
  return problems;
}

// ── Reading rows in primary-key order ──

/** Rows of one table, a batch at a time, from either side. */
async function* readRows(side, conn, table, columns, pk, batch = BATCH_ROWS) {
  const quote = side === "mysql" ? my : pq;
  const list = columns.map((c) => quote(c.name)).join(", ");
  const keyList = pk.map(quote).join(", ");
  let after = null;
  for (;;) {
    const params = after ?? [];
    let where = "";
    if (after) {
      const marks = side === "mysql" ? pk.map(() => "?") : pk.map((_, i) => `$${i + 1}`);
      where = `WHERE (${keyList}) > (${marks.join(", ")})`;
    }
    const sql = `SELECT ${list} FROM ${quote(table)} ${where} ORDER BY ${keyList} LIMIT ${batch}`;
    const rows = side === "mysql" ? (await conn.query(sql, params))[0] : (await conn.query(sql, params)).rows;
    if (rows.length === 0) return;
    yield rows;
    if (rows.length < batch) return;
    const last = rows[rows.length - 1];
    after = pk.map((column) => last[column]);
  }
}

// ── copyAll ──

async function insertRows(target, table, columns, rows, offset) {
  const params = [];
  const tuples = rows.map((row) => {
    const marks = columns.map(({ name, type }) => {
      params.push(toPostgres(row[name], type, offset));
      return `$${params.length}`;
    });
    return `(${marks.join(", ")})`;
  });
  await target.query(`INSERT INTO ${pq(table)} (${columns.map((c) => pq(c.name)).join(", ")}) VALUES ${tuples.join(", ")}`, params);
}

/**
 * Replaces all data in PostgreSQL with MySQL's, in one transaction on each
 * side: a consistent MySQL snapshot, and nothing changes in PostgreSQL
 * unless every table copied and verified. Returns [{ table, rows }].
 * `offset` is the UTC offset MySQL's DATETIME values were written in.
 */
export async function copyAll({ source, target, offset, log = () => {} }) {
  const problems = await checkSource({ source, target });
  if (problems.length) {
    throw new Error(`MySQL has data PostgreSQL would refuse; fix it first:\n- ${problems.join("\n- ")}`);
  }
  const schema = await targetSchema(target);
  const order = copyOrder(Object.keys(schema.tables), schema.foreignKeys);

  await source.query("SET time_zone = ?", [offset]);
  await source.query("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ");
  await source.query("START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY");
  await target.query("BEGIN");
  try {
    await target.query(`TRUNCATE ${order.map(pq).join(", ")} RESTART IDENTITY CASCADE`);

    const report = [];
    for (const table of order) {
      const columns = schema.tables[table];
      const batch = Math.max(1, Math.min(BATCH_ROWS, Math.floor(MAX_PARAMS / columns.length)));
      let copied = 0;
      for await (const rows of readRows("mysql", source, table, columns, schema.primaryKeys[table], batch)) {
        try {
          await insertRows(target, table, columns, rows, offset);
        } catch (error) {
          throw new Error(`Copying ${table} failed near ${schema.primaryKeys[table].join(",")} ${rows[0][schema.primaryKeys[table][0]]}: ${error.message}`);
        }
        copied += rows.length;
      }
      log(`${table}: ${copied} row(s)`);
      report.push({ table, rows: copied });
    }

    // Identity columns continue after the highest copied id.
    for (const { table, column } of schema.identities) {
      await target.query(
        `SELECT setval(pg_get_serial_sequence($1, $2), COALESCE(MAX(${pq(column)}), 0) + 1, false) FROM ${pq(table)}`,
        [pq(table), column],
      );
    }

    const differing = (await verifyAll({ source, target, offset })).filter((t) => !t.match);
    if (differing.length) {
      throw new Error(`The copy does not match MySQL: ${differing.map((t) => `${t.table} (${t.differingKeys.join(", ")})`).join("; ")}`);
    }

    await target.query("COMMIT");
    return report;
  } catch (error) {
    await target.query("ROLLBACK");
    throw error;
  } finally {
    await source.query("COMMIT");
  }
}

// ── verifyAll ──

async function rowDigests(side, conn, table, columns, pk, offset) {
  const digests = new Map();
  for await (const rows of readRows(side, conn, table, columns, pk)) {
    for (const row of rows) {
      const key = pk.map((column) => String(row[column])).join(",");
      const text = canonicalRow(row, columns, side, offset);
      digests.set(key, crypto.createHash("sha1").update(text).digest("base64"));
    }
  }
  return digests;
}

const tableDigest = (digests) =>
  crypto
    .createHash("sha256")
    .update([...digests.entries()].map(([key, digest]) => `${key}:${digest}`).sort().join("\n"))
    .digest("hex");

/**
 * Compares every table row by row (canonical values, see values.js).
 * Returns [{ table, mysqlRows, postgresRows, mysqlHash, postgresHash, match, differingKeys }],
 * differingKeys being the first few primary keys missing or different on either side.
 */
export async function verifyAll({ source, target, offset }) {
  const schema = await targetSchema(target);
  await source.query("SET time_zone = ?", [offset]);

  const tables = [];
  for (const table of Object.keys(schema.tables).sort()) {
    const columns = schema.tables[table];
    const pk = schema.primaryKeys[table];
    const mine = await rowDigests("mysql", source, table, columns, pk, offset);
    const theirs = await rowDigests("postgres", target, table, columns, pk, offset);

    const differingKeys = [...new Set([...mine.keys(), ...theirs.keys()])]
      .filter((key) => mine.get(key) !== theirs.get(key))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
      .slice(0, EXAMPLE_KEYS);
    const mysqlHash = tableDigest(mine);
    const postgresHash = tableDigest(theirs);
    tables.push({
      table,
      mysqlRows: mine.size,
      postgresRows: theirs.size,
      mysqlHash,
      postgresHash,
      match: differingKeys.length === 0 && mysqlHash === postgresHash,
      differingKeys,
    });
  }
  return tables;
}
