// The MySQL → PostgreSQL data copy for the cutover (docs/postgres-cutover.md).
//
//   node scripts/mysql-to-postgres/index.js check            find data PostgreSQL would refuse
//   node scripts/mysql-to-postgres/index.js copy --replace   replace PostgreSQL's data with MySQL's, then verify
//   node scripts/mysql-to-postgres/index.js verify           compare every table row by row
//
// MySQL (the source, read only): MYSQL_HOST, MYSQL_PORT, MYSQL_USER,
// MYSQL_PASSWORD, MYSQL_DATABASE, and MYSQL_TIMEZONE — the UTC offset its
// DATETIME values were written in (default: the MySQL server's own offset).
// PostgreSQL (the target): DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
// as for the app and `npm run db:migrate`.
import dotenv from "dotenv";
import { checkSource, connectMysql, connectPostgres, copyAll, mysqlOffset, verifyAll } from "./copier.js";
import { formatOffset } from "./values.js";

dotenv.config();
const [command, ...flags] = process.argv.slice(2);
const env = process.env;

const USAGE = "Usage: index.js check | copy --replace | verify";

async function main() {
  if (!["check", "copy", "verify"].includes(command)) throw new Error(USAGE);
  if (command === "copy" && !flags.includes("--replace")) {
    throw new Error(
      `copy deletes every row in PostgreSQL database "${env.DB_NAME}" and replaces it with MySQL's.\n` +
        "Never run it once the app writes to PostgreSQL. To go ahead: copy --replace",
    );
  }

  const source = await connectMysql({
    host: env.MYSQL_HOST,
    port: Number(env.MYSQL_PORT || 3306),
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
  });
  const target = await connectPostgres({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });
  try {
    const offset = env.MYSQL_TIMEZONE ? formatOffset(env.MYSQL_TIMEZONE) : await mysqlOffset(source);
    console.log(`MySQL ${env.MYSQL_DATABASE} → PostgreSQL ${env.DB_NAME}; DATETIME values read as UTC${offset}`);

    if (command === "check") {
      const problems = await checkSource({ source, target });
      if (problems.length) {
        console.log(`Fix these in MySQL first:\n- ${problems.join("\n- ")}`);
        return 1;
      }
      console.log("No problems found: the copy can run.");
      return 0;
    }

    if (command === "copy") {
      const started = Date.now();
      const report = await copyAll({ source, target, offset, log: (line) => console.log(`  ${line}`) });
      const rows = report.reduce((sum, t) => sum + t.rows, 0);
      console.log(`Copied and verified ${report.length} tables, ${rows} rows, in ${Math.round((Date.now() - started) / 1000)} s.`);
      return 0;
    }

    const tables = await verifyAll({ source, target, offset });
    for (const t of tables) {
      const status = t.match ? "ok" : `DIFFERENT (e.g. ${t.differingKeys.join(", ")})`;
      console.log(`  ${t.table.padEnd(22)} ${String(t.mysqlRows).padStart(8)} ${String(t.postgresRows).padStart(8)}  ${t.postgresHash.slice(0, 12)}  ${status}`);
    }
    const differing = tables.filter((t) => !t.match);
    console.log(differing.length ? `${differing.length} table(s) differ.` : `All ${tables.length} tables match.`);
    return differing.length ? 1 : 0;
  } finally {
    await Promise.all([source.end(), target.end()]);
  }
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
