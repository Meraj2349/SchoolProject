import { E2E } from "../../fixtures/data.js";
import { branchLabel, expect, signedIn, signIn, test } from "../../fixtures/admin.js";

// Signs each admin in once through the real login page and saves the signed-in
// browser (the token cookie and the stored role and branch) for the admin tests.
test.use({ role: null, language: "en" });

for (const role of ["super", "branch"]) {
  test(`sign in as the ${role} admin`, async ({ page, language }) => {
    await signIn(page, language, E2E.admins[role], role === "branch" ? branchLabel(language) : null);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.getByRole("complementary", { name: "Menu" })).toBeVisible();

    // Each admin project sets its own language.
    await page.evaluate(() => localStorage.removeItem("language"));
    await page.context().storageState({ path: signedIn(role) });
  });
}
