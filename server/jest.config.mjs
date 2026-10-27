// Integration tests run against MySQL or PostgreSQL (TEST_DB_DIALECT).
// *Migration.test.js files test the old MySQL migration scripts in Sql/, so
// they run on MySQL only.
const dialect = process.env.TEST_DB_DIALECT || "mysql";

export default {
  projects: [
    {
      displayName: "unit",
      testEnvironment: "node",
      transform: {},
      roots: ["<rootDir>/src", "<rootDir>/tests/unit"],
      collectCoverageFrom: ["src/**/*.js", "!src/**/index.js"],
    },
    {
      displayName: "integration",
      testEnvironment: "node",
      transform: {},
      roots: ["<rootDir>/tests/integration"],
      testPathIgnorePatterns: dialect === "postgres" ? ["/node_modules/", "Migration\\.test\\.js$"] : ["/node_modules/"],
      globalSetup: "<rootDir>/tests/integration/globalSetup.js",
      setupFiles: ["<rootDir>/tests/integration/env.js"],
    },
    {
      // The MySQL → PostgreSQL data copy: needs both servers at once.
      displayName: "copy",
      testEnvironment: "node",
      transform: {},
      roots: ["<rootDir>/tests/copy"],
    },
  ],
};
