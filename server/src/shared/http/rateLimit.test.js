import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { parseTrustProxy, rateLimit } from "./rateLimit.js";

function appWith(options, { trustProxy } = {}) {
  const app = express();
  if (trustProxy !== undefined) app.set("trust proxy", trustProxy);
  app.use((req, _res, next) => ((req.language = "bn"), next()));
  app.post("/", rateLimit(options), (_req, res) => res.json({ ok: true }));
  return app;
}

// Calls the middleware directly with a given req.ip; resolves 200 or 429.
const call = (limiter, ip) =>
  new Promise((resolve) => {
    const res = { status: (code) => ((res.code = code), res), set: () => res, json: () => resolve(res.code) };
    limiter({ ip, language: "en" }, res, () => resolve(200));
  });

describe("rateLimit", () => {
  it("lets an address through up to the limit, then answers 429 in its language", async () => {
    let now = 0;
    const app = appWith({ max: 2, windowMs: 1000, now: () => now });

    await request(app).post("/").expect(200);
    await request(app).post("/").expect(200);
    const third = await request(app).post("/");

    expect(third.status).toBe(429);
    expect(third.body).toEqual({ success: false, message: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" });
    expect(Number(third.headers["retry-after"])).toBeGreaterThan(0);

    now = 1001; // the window has passed
    await request(app).post("/").expect(200);
  });

  it("counts each address on its own", async () => {
    const limiter = rateLimit({ max: 1, windowMs: 1000, now: () => 0 });

    expect(await call(limiter, "203.0.113.1")).toBe(200);
    expect(await call(limiter, "203.0.113.2")).toBe(200);
    expect(await call(limiter, "203.0.113.1")).toBe(429);
  });

  it("ignores X-Forwarded-For unless the app trusts the proxy", async () => {
    const untrusted = appWith({ max: 1, windowMs: 1000, now: () => 0 });
    await request(untrusted).post("/").set("X-Forwarded-For", "198.51.100.1").expect(200);
    await request(untrusted).post("/").set("X-Forwarded-For", "198.51.100.2").expect(429); // same real address

    const trusted = appWith({ max: 1, windowMs: 1000, now: () => 0 }, { trustProxy: "loopback" });
    await request(trusted).post("/").set("X-Forwarded-For", "198.51.100.1").expect(200);
    await request(trusted).post("/").set("X-Forwarded-For", "198.51.100.2").expect(200);
  });

  it("does not let made-up addresses grow its memory: anything not an IP shares one key, and old keys are dropped", async () => {
    const limiter = rateLimit({ max: 1, windowMs: 1000, maxKeys: 2, now: () => 0 });

    expect(await call(limiter, "not-an-ip")).toBe(200);
    expect(await call(limiter, "x".repeat(5000))).toBe(429); // same "unknown" key
    expect(await call(limiter, "203.0.113.1")).toBe(200);
    expect(await call(limiter, "203.0.113.2")).toBe(200); // the oldest key ("unknown") is dropped
    expect(limiter.size()).toBe(2);
  });
});

describe("parseTrustProxy", () => {
  it("reads the TRUST_PROXY setting as Express expects it", () => {
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy("")).toBe(false);
    expect(parseTrustProxy("1")).toBe(1);
    expect(parseTrustProxy("true")).toBe(true);
    expect(parseTrustProxy("false")).toBe(false);
    expect(parseTrustProxy("loopback, uniquelocal")).toBe("loopback, uniquelocal");
  });
});
