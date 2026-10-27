// The browser tests' PostgreSQL database. The database named by E2E_DB_NAME
// is dropped and rebuilt by seed.js — never point it at real data.
export const database = {
  host: process.env.E2E_DB_HOST || "127.0.0.1",
  port: process.env.E2E_DB_PORT || "5432",
  user: process.env.E2E_DB_USER || "school_test",
  password: process.env.E2E_DB_PASSWORD ?? "school_test",
  name: process.env.E2E_DB_NAME || "school_e2e",
};

/** The server's DB_* settings for that database. */
export const serverDbEnv = {
  DB_HOST: database.host,
  DB_PORT: database.port,
  DB_USER: database.user,
  DB_PASSWORD: database.password,
  DB_NAME: database.name,
};
