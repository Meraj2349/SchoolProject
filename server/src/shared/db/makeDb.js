// The database port every repository uses. The engine-specific work (running
// SQL, transactions, error codes) lives in a driver, so the same code runs on
// MySQL and PostgreSQL.
//
//   query(sql, params)            → { rows, rowCount }
//   one(sql, params)              → first row or null
//   insert(sql, params, idColumn) → the new row's id
//   withTransaction(async (tx) => …) — tx has the same methods
//
// SQL uses `?` placeholders on both engines.

export function makeDb(driver, executor = null) {
  const db = {
    dialect: driver.dialect,

    /** A table or column name quoted for this engine. */
    ident: (name) => driver.quote(name),

    query: (sql, params = []) => driver.run(executor, sql, params),

    async one(sql, params = []) {
      const { rows } = await driver.run(executor, sql, params);
      return rows[0] ?? null;
    },

    insert: (sql, params, idColumn) => driver.insert(executor, sql, params, idColumn),

    async withTransaction(work) {
      // Already inside a transaction: join it.
      if (executor) return work(db);
      const client = await driver.connect();
      try {
        await driver.begin(client);
        const result = await work(makeDb(driver, client));
        await driver.commit(client);
        return result;
      } catch (error) {
        await driver.rollback(client);
        throw error;
      } finally {
        driver.release(client);
      }
    },

    isUniqueViolation: (err) => Boolean(err) && driver.classify(err) === "unique",
    isForeignKeyViolation: (err) => Boolean(err) && driver.classify(err) === "foreignKey",
    isDeadlock: (err) => Boolean(err) && driver.classify(err) === "deadlock",

    end: () => driver.end(),
  };
  return db;
}
