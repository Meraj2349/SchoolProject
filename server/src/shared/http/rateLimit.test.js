import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { clientIp, rateLimit } from "./rateLimit.js";

function appWith(options) {
  const app = express();
  app.use((req, _res, next) => ((req.language = "bn"), next()));
  app.post("/", rateLimit(options), (_req, res) => res.json({ ok: true }));
  return app;
}

describe("rateLimit", () => {
  it("lets a visitor through up to the limit, then answers 429 in their language", async () => {
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
    const run = (ip) =>
      new Promise((resolve) => {
        const res = { status: (code) => ((res.code = code), res), set: () => res, json: () => resolve(res.code) };
        limiter({ socket: { remoteAddress: ip }, headers: {}, language: "en" }, res, () => resolve(200));
      });

    expect(await run("1.1.1.1")).toBe(200);
    expect(await run("2.2.2.2")).toBe(200);
    expect(await run("1.1.1.1")).toBe(429);
  });

  it("trusts X-Forwarded-For only from our own proxy (a private or loopback address)", () => {
    const req = (remote, forwarded) => ({ socket: { remoteAddress: remote }, headers: forwarded ? { "x-forwarded-for": forwarded } : {} });

    expect(clientIp(req("172.18.0.3", "203.0.113.9, 172.18.0.3"))).toBe("203.0.113.9"); // via the frontend container
    expect(clientIp(req("::ffff:127.0.0.1", "198.51.100.4"))).toBe("198.51.100.4");
    expect(clientIp(req("203.0.113.9", "1.2.3.4"))).toBe("203.0.113.9"); // a visitor cannot pick their own address
    expect(clientIp(req("10.0.0.7"))).toBe("10.0.0.7");
  });
});
