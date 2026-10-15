// Runs before every integration test file, before the app (and its DB pool) is imported.
process.env.DB_HOST = process.env.TEST_DB_HOST || "127.0.0.1";
process.env.DB_PORT = process.env.TEST_DB_PORT || "3306";
process.env.DB_USER = process.env.TEST_DB_USER || "school_test";
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD ?? "school_test";
process.env.DB_NAME = process.env.TEST_DB_NAME || "school_test";
process.env.JWT_SECRET_KEY = "integration-test-secret";
process.env.JWT_EXPIRES_IN = "1h";
