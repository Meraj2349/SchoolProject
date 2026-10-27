import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, bearer, branchAdminToken, db, resetDb } from "./helpers.js";

// Branches, the chairman's profile and new classes are the super admin's. A
// branch admin who tries gets the same translated refusal as everywhere else.

beforeEach(() => resetDb());
afterAll(() => db.end());

describe("super-admin-only endpoints", () => {
  it.each([
    ["post", "/api/classes/add", { className: "Class 8", section: "Better" }],
    ["post", "/api/branches", { name_en: "New branch" }],
    ["put", "/api/chairman", { name_en: "Someone" }],
  ])("refuse a branch admin's %s %s with a translated 403", async (method, url, body) => {
    const res = await request(app)[method](url).set(bearer(branchAdminToken(BRANCH_A))).set("Accept-Language", "bn").send(body);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ success: false, message: "প্রবেশাধিকার নিষিদ্ধ।" });
  });
});
