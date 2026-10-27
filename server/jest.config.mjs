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
      // A real PostgreSQL database built from db/migrations (globalSetup.js).
      displayName: "integration",
      testEnvironment: "node",
      transform: {},
      roots: ["<rootDir>/tests/integration"],
      globalSetup: "<rootDir>/tests/integration/globalSetup.js",
      setupFiles: ["<rootDir>/tests/integration/env.js"],
    },
  ],
};
