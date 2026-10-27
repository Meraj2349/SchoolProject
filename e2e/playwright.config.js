import { defineConfig, devices } from "@playwright/test";
import { serverDbEnv } from "./fixtures/database.js";

// The website in a real browser, against the real API and a seeded database
// (seed.js). Public pages: every spec on desktop and phone, in Bangla (the
// site's default) and English. Admin pages (tests/admin): after the public
// tests, so admin changes never race their checks; signed in once per admin
// by auth.setup.js.
const CI = Boolean(process.env.CI);

const backendEnv = {
  PORT: "3000",
  NODE_ENV: "test",
  ...serverDbEnv,
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

const publicProjects = screens.flatMap((screen) =>
  languages.map((language) => ({
    name: `${screen.name}-${language}`,
    testIgnore: "admin/**",
    use: { ...screen.use, language },
  })),
);

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
  projects: [
    ...publicProjects,
    { name: "admin-setup", testMatch: "admin/auth.setup.js" },
    ...languages.map((language) => ({
      name: `admin-desktop-${language}`,
      testMatch: "admin/*.spec.js",
      dependencies: ["admin-setup", ...publicProjects.map((project) => project.name)],
      use: { ...screens[0].use, language },
    })),
    {
      // Every admin page on a phone; the workflows run on desktop.
      name: "admin-phone-en",
      testMatch: "admin/pages.spec.js",
      dependencies: ["admin-setup", ...publicProjects.map((project) => project.name)],
      use: { ...screens[1].use, language: "en" },
    },
  ],
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
