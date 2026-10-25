import { test as base, expect } from "@playwright/test";
import fs from "node:fs";

const MESSAGES = Object.fromEntries(
  ["bn", "en"].map((lang) => [lang, JSON.parse(fs.readFileSync(new URL(`../../frontend/src/i18n/${lang}.json`, import.meta.url)))]),
);

/** The site's own text for a key ("attendance.searchBtn") in a language. */
export function tr(language, key) {
  const value = key.split(".").reduce((node, part) => node?.[part], MESSAGES[language]);
  if (typeof value !== "string") throw new Error(`No ${language} text for ${key}`);
  return value;
}

// Every test: the site's language set before the page loads, and the page
// watched for problems a visitor would hit without seeing a message — a
// console error, an uncaught exception, or an API call that failed.
export const test = base.extend({
  language: ["bn", { option: true }],

  // API responses that a test expects to fail (e.g. a search with no match).
  allowedApiErrors: [[], { option: true }],
  // Console errors a test expects (e.g. the 404 of a page that does not exist).
  allowedConsoleErrors: [[], { option: true }],

  problems: [async ({ page, allowedApiErrors, allowedConsoleErrors }, use) => {
    const problems = [];
    page.on("console", (message) => {
      if (message.type() !== "error" || allowedConsoleErrors.some((pattern) => pattern.test(message.text()))) return;
      problems.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
    page.on("response", (response) => {
      const url = response.url();
      if (!url.includes("/api/") || response.status() < 400) return;
      const path = new URL(url).pathname;
      if (allowedApiErrors.some((allowed) => path.includes(allowed))) return;
      problems.push(`API ${response.status()} ${response.request().method()} ${path}`);
    });
    await use(problems);
    expect(problems, "the page should run without errors").toEqual([]);
  }, { auto: true }],

  page: async ({ page, language }, use) => {
    // Only this site and its API: outside services (the Google map) get an
    // empty page, so the tests never depend on the internet.
    await page.route(
      (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
      (route) => route.fulfill({ status: 200, contentType: "text/html", body: "" }),
    );
    // The seeded photos are on this site (real ones are on Cloudinary), and
    // Next's image optimizer refuses local addresses: serve them as they are.
    await page.route("**/_next/image?*", async (route) => {
      const source = new URL(route.request().url()).searchParams.get("url");
      if (!source?.startsWith("http://localhost")) return route.continue();
      return route.fulfill({ response: await route.fetch({ url: source }) });
    });
    // The project's language, unless the visitor already chose one (a reload
    // keeps their choice).
    await page.addInitScript((lang) => {
      if (!localStorage.getItem("language")) localStorage.setItem("language", JSON.stringify({ state: { language: lang }, version: 0 }));
    }, language);
    await use(page);
  },
});

/** Visits a page and checks what every public page must do. */
export async function openPage(page, path) {
  const response = await page.goto(path);
  expect(response?.status(), `${path} should load`).toBeLessThan(400);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `${path} should not scroll sideways`).toBeLessThanOrEqual(1);
}

/**
 * Where the language switch and branch picker are: the header on desktop,
 * the menu on phones (opened here).
 */
export async function headerControls(page, language, isMobile) {
  if (!isMobile) return page.getByRole("banner");
  await page.getByRole("button", { name: tr(language, "site.openMenu") }).click();
  return page.getByRole("dialog", { name: tr(language, "site.menu") });
}

/** Seeded data that has a Bangla and an English version. */
export const pick = (language, { bn, en }) => (language === "bn" ? bn : en);

export { expect };
