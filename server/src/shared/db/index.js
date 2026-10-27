import { makeDb } from "./makeDb.js";

// The app's database. Repositories import this instead of a driver.
// DB_DIALECT picks the engine: "postgres" (default) or "mysql" (the old
// database, kept for rollback until PostgreSQL is signed off).
async function createDriver(dialect) {
  if (dialect === "postgres") {
    const { createPgPool, makePgDriver } = await import("./pgDriver.js");
    return makePgDriver(createPgPool());
  }
  if (dialect !== "mysql") throw new Error(`DB_DIALECT must be "postgres" or "mysql", not "${dialect}"`);
  const [{ default: pool }, { makeMysqlDriver }] = await Promise.all([
    import("../../../config/db.config.js"),
    import("./mysqlDriver.js"),
  ]);
  return makeMysqlDriver(pool);
}

const db = makeDb(await createDriver(process.env.DB_DIALECT || "postgres"));

export default db;
export { assignments, inList, insertList, valuesRows } from "./sql.js";
