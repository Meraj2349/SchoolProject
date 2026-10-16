// Runs before every integration test file, before the app (and its DB pool) is imported.
process.env.DB_HOST = process.env.TEST_DB_HOST || "127.0.0.1";
process.env.DB_PORT = process.env.TEST_DB_PORT || "3306";
process.env.DB_USER = process.env.TEST_DB_USER || "school_test";
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD ?? "school_test";
process.env.DB_NAME = process.env.TEST_DB_NAME || "school_test";
process.env.JWT_SECRET_KEY = "integration-test-secret";
process.env.JWT_EXPIRES_IN = "1h";
// Test requests come from 127.0.0.1 and name their visitor in X-Forwarded-For.
process.env.TRUST_PROXY = "loopback";
process.env.JOB_APPLICATIONS_PER_HOUR = "5";
// CVs go to a throw-away folder, never the server's real private_uploads.
process.env.JOB_APPLICATION_CV_DIR = `${process.env.TMPDIR || "/tmp"}/school-test-cvs-${process.pid}`;
// Absence SMS are queued (log-only sender); tests send them themselves.
process.env.ATTENDANCE_SMS_ENABLED = "true";
process.env.ATTENDANCE_SMS_DELAY_MINUTES = "15";
process.env.SMS_PROVIDER = "log";
