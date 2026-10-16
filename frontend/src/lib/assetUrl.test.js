import { describe, expect, it } from "vitest";
import { assetUrl, isRemoteImage } from "./assetUrl";

describe("assetUrl", () => {
  it("serves files uploaded to the server from the server", () => {
    expect(assetUrl("/uploads/achievements/a.png")).toBe("http://localhost:3000/uploads/achievements/a.png");
  });

  it("keeps full URLs (e.g. Cloudinary) and site images as they are", () => {
    expect(assetUrl("https://res.cloudinary.com/x.png")).toBe("https://res.cloudinary.com/x.png");
    expect(assetUrl("/images/logo1.png")).toBe("/images/logo1.png");
    expect(assetUrl(null)).toBeNull();
  });
});

describe("isRemoteImage", () => {
  it("is true for full URLs, which the browser loads directly", () => {
    expect(isRemoteImage("http://localhost:3000/uploads/a.png")).toBe(true);
    expect(isRemoteImage("https://res.cloudinary.com/x.png")).toBe(true);
  });

  it("is false for the site's own images, which Next.js optimises", () => {
    expect(isRemoteImage("/images/logo1.png")).toBe(false);
    expect(isRemoteImage(null)).toBe(false);
  });
});
