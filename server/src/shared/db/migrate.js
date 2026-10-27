// Applies the dbmate migrations in db/migrations to PostgreSQL. Uses dbmate's
// own bookkeeping (schema_migrations.version), so `npx dbmate status` and
// `dbmate new` keep working alongside it. Runs where dbmate is not installed:
// the docker-compose migrate service and the test setup.

// Any fixed number: only one process migrates at a time.
const LOCK_KEY = 4237001;

/** The SQL between dbmate's `-- migrate:up` and `-- migrate:down` markers. */
export function migrateUp(text) {
  const up = text.indexOf("-- migrate:up");
  const down = text.indexOf("-- migrate:down");
  return text.slice(up === -1 ? 0 : up, down === -1 ? undefined : down);
}

/** Migration files not applied yet, oldest first. A file's version is its leading digits. */
export function pendingMigrations(files, applied) {
  return files
    .map((file) => ({ file, version: /^(\d+)_.*\.sql$/.exec(file)?.[1] }))
    .filter(({ version }) => version && !applied.has(version))
    .sort((a, b) => a.version.localeCompare(b.version))
    .map(({ version, file }) => ({ version, file }));
}

/** Applies pending migrations, each in its own transaction. Returns the files applied. */
export async function runMigrations({ client, files, read }) {
  await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (version varchar(128) PRIMARY KEY)");
  await client.query(`SELECT pg_advisory_lock(${LOCK_KEY})`);
  try {
    const { rows } = await client.query("SELECT version FROM schema_migrations");
    const done = [];
    for (const { version, file } of pendingMigrations(files, new Set(rows.map((row) => row.version)))) {
      await client.query("BEGIN");
      try {
        await client.query(migrateUp(read(file)));
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
      done.push(file);
    }
    return done;
  } finally {
    await client.query(`SELECT pg_advisory_unlock(${LOCK_KEY})`);
  }
}
