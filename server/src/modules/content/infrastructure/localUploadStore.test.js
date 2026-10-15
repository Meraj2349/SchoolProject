import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
import { makeLocalUploadStore } from "./localUploadStore.js";

function publicDirWith(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-"));
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), "x");
  }
  return dir;
}

describe("localUploadStore", () => {
  it("serves an upload from its folder", () => {
    const store = makeLocalUploadStore({ publicDir: "/srv/public", folder: "notice-announcements" });

    expect(store.urlFor({ filename: "a.png" })).toBe("/uploads/notice-announcements/a.png");
  });

  it("deletes only files in its own folder", async () => {
    const dir = publicDirWith(["uploads/notice-announcements/a.png", "uploads/routines/b.png", "secret.txt"]);
    const store = makeLocalUploadStore({ publicDir: dir, folder: "notice-announcements" });

    await store.discard("/uploads/routines/b.png");
    await store.discard("/uploads/notice-announcements/../../secret.txt");
    await store.discard("/uploads/notice-announcements/a.png");

    expect(fs.existsSync(path.join(dir, "uploads/routines/b.png"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "secret.txt"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "uploads/notice-announcements/a.png"))).toBe(false);
  });
});
