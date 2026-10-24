import pg from "pg";
import { toPositional } from "./positional.js";

// node-postgres driver for makeDb. `executor` is a pooled client inside a
// transaction, or null to use the pool.

const ERROR_KINDS = { 23505: "unique", 23503: "foreignKey", "40P01": "deadlock" };

const OID = { BOOL: 16, INT8: 20, DATE: 1082 };

// Rows keep the shapes the API had on MySQL (mysql2 with dateStrings: DATE).
// Without the DATE parser, pg builds a local-midnight Date that toISOString()
// turns into the previous day in Bangladesh (UTC+6).
const PARSERS = {
  [OID.DATE]: (text) => text,
  [OID.INT8]: (text) => Number(text),
  [OID.BOOL]: (text) => (text === "t" ? 1 : 0),
};

export function pgTypeParser(oid, format) {
  return PARSERS[oid] ?? pg.types.getTypeParser(oid, format);
}

export function makePgDriver(pool) {
  const exec = (executor, sql, params) => (executor ?? pool).query(toPositional(sql), params);

  return {
    dialect: "postgres",

    async run(executor, sql, params) {
      const result = await exec(executor, sql, params);
      return { rows: result.rows, rowCount: result.rowCount };
    },

    async insert(executor, sql, params, idColumn) {
      const result = await exec(executor, `${sql} RETURNING ${quote(idColumn)}`, params);
      return result.rows[0]?.[idColumn];
    },

    connect: () => pool.connect(),
    release: (client) => client.release(),
    begin: (client) => client.query("BEGIN"),
    commit: (client) => client.query("COMMIT"),
    rollback: (client) => client.query("ROLLBACK"),
    quote,
    classify: (err) => ERROR_KINDS[err.code] ?? null,
    end: () => pool.end(),
  };
}

function quote(name) {
  return `"${name.replaceAll('"', '""')}"`;
}

/** A pool configured from DB_* environment variables. */
export function createPgPool(env = process.env) {
  return new pg.Pool({
    host: env.DB_HOST,
    port: env.DB_PORT ? Number(env.DB_PORT) : 5432,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    max: Number(env.DB_CONNECTION_LIMIT || 10),
    // Functions like CURRENT_DATE use the school's day, as MySQL's did.
    options: `-c TimeZone=${env.DB_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    types: { getTypeParser: pgTypeParser },
  });
}
