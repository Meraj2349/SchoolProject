import mysqlPool from "../../../config/db.config.js";
import { makeDb } from "./makeDb.js";
import { makeMysqlDriver } from "./mysqlDriver.js";

// The app's database. Repositories import this instead of a driver.
const db = makeDb(makeMysqlDriver(mysqlPool));

export default db;
export { assignments, inList, insertList, valuesRows } from "./sql.js";
