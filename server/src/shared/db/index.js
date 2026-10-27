import { makeDb } from "./makeDb.js";
import { createPgPool, makePgDriver } from "./pgDriver.js";

// The app's database (PostgreSQL). Repositories import this instead of a driver.
// MySQL was retired after the cutover (docs/postgres-cutover.md); an old .env
// still asking for it fails loudly instead of connecting somewhere unexpected.
const dialect = process.env.DB_DIALECT;
if (dialect && dialect !== "postgres") {
  throw new Error(`DB_DIALECT=${dialect} is no longer supported: the app runs on PostgreSQL only (remove DB_DIALECT)`);
}

const db = makeDb(makePgDriver(createPgPool()));

export default db;
export { assignments, inList, insertList, valuesRows } from "./sql.js";
