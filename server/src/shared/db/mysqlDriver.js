// mysql2 driver for makeDb. `executor` is a pooled connection inside a
// transaction, or null to use the pool.

const ERROR_KINDS = {
  ER_DUP_ENTRY: "unique",
  ER_NO_REFERENCED_ROW_2: "foreignKey",
  ER_ROW_IS_REFERENCED_2: "foreignKey",
  ER_LOCK_DEADLOCK: "deadlock",
};

export function makeMysqlDriver(pool) {
  const exec = async (executor, sql, params) => {
    const [result] = await (executor ?? pool).query(sql, params);
    return result;
  };

  return {
    dialect: "mysql",

    async run(executor, sql, params) {
      const result = await exec(executor, sql, params);
      return Array.isArray(result) ? { rows: result, rowCount: result.length } : { rows: [], rowCount: result.affectedRows };
    },

    async insert(executor, sql, params) {
      const result = await exec(executor, sql, params);
      return result.insertId;
    },

    connect: () => pool.getConnection(),
    release: (connection) => connection.release(),
    begin: (connection) => connection.beginTransaction(),
    commit: (connection) => connection.commit(),
    rollback: (connection) => connection.rollback(),
    quote: (name) => `\`${name.replaceAll("`", "``")}\``,
    classify: (err) => ERROR_KINDS[err.code] ?? null,
    end: () => pool.end(),
  };
}
