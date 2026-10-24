import { makeDb } from "./makeDb.js";

// The app's database. Repositories import this instead of a driver.
// DB_DIALECT picks the engine: "mysql" (default until the cutover) or "postgres".
async function createDriver(dialect) {
  if (dialect === "postgres") {
    const { createPgPool, makePgDriver } = await import("./pgDriver.js");
    return makePgDriver(createPgPool());
  }
  const [{ default: pool }, { makeMysqlDriver }] = await Promise.all([
    import("../../../config/db.config.js"),
    import("./mysqlDriver.js"),
  ]);
  return makeMysqlDriver(pool);
}

const db = makeDb(await createDriver(process.env.DB_DIALECT || "mysql"));

export default db;
export { assignments, inList, insertList, valuesRows } from "./sql.js";
