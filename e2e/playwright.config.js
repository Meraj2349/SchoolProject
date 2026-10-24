import { defineConfig, devices } from "@playwright/test";

// The public website in a real browser, against the real API and a seeded
// database (seed.js). Every spec runs on desktop and phone, in Bangla (the
// site's default) and English.
const CI = Boolean(process.env.CI);

const backendEnv = {
  PORT: "3000",
  NODE_ENV: "test",
  DB_HOST: process.env.E2E_DB_HOST || "127.0.0.1",
  DB_PORT: process.env.E2E_DB_PORT || "3306",
  DB_USER: process.env.E2E_DB_USER || "school_test",
  DB_PASSWORD: process.env.E2E_DB_PASSWORD ?? "school_test",
  DB_NAME: process.env.E2E_DB_NAME || "school_e2e",
  JWT_SECRET_KEY: "e2e-secret",
  JWT_EXPIRES_IN: "1h",
  FRONTEND_URL: "http://localhost:5173",
  CLOUDINARY_CLOUD_NAME: "e2e",
  CLOUDINARY_API_KEY: "e2e",
  CLOUDINARY_API_SECRET: "e2e",
  ATTENDANCE_SMS_ENABLED: "false",
  // Every project sends job applications from the same address.
  JOB_APPLICATIONS_PER_HOUR: "200",
};

const languages = ["bn", "en"];
const screens = [
  { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 } } },
  { name: "phone", use: { ...devices["Pixel 7"] } },
];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : 4,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: screens.flatMap((screen) =>
    languages.map((language) => ({ name: `${screen.name}-${language}`, use: { ...screen.use, language } })),
  ),
  webServer: [
    {
      // Fresh data for every run, then the API.
      command: "node seed.js && cd ../server && node app.js",
      url: "http://127.0.0.1:3000/",
      env: backendEnv,
      reuseExistingServer: !CI,
      timeout: 120_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "npm run build && npm start -- --port 5173",
      cwd: "../frontend",
      url: "http://localhost:5173",
      env: { NEXT_PUBLIC_API_URL: "http://localhost:3000/api", BACKEND_URL: "http://localhost:3000", NEXT_TELEMETRY_DISABLED: "1" },
      reuseExistingServer: !CI,
      timeout: 600_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
