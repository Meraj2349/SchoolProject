import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import { bearer, db, insert, resetDb, superAdminToken } from "./helpers.js";

// Fake Cloudinary: records calls; each upload gets a new id.
const cloud = { uploaded: [], deleted: [], failNextUpload: false };
jest.unstable_mockModule("../../config/cloudinary.config.js", () => ({
  uploadToCloudinary: async (filePath, folder) => {
    if (cloud.failNextUpload) {
      cloud.failNextUpload = false;
      throw new Error("Cloudinary is down");
    }
    const n = cloud.uploaded.push({ filePath, folder });
    return { secure_url: `https://cdn.test/${n}.png`, public_id: `pid-${n}`, format: "png" };
  },
  deleteFromCloudinary: async (publicId) => {
    cloud.deleted.push(publicId);
  },
}));

const { default: app } = await import("../../app.js");

const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010806000000" +
    "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082",
  "hex",
);
const admin = bearer(superAdminToken());

describe("file uploads", () => {
  beforeAll(resetDb);
  beforeEach(() => {
    cloud.uploaded = [];
    cloud.deleted = [];
    cloud.failNextUpload = false;
  });
  afterAll(() => db.end());

  describe("gallery images", () => {
    it("uploads an image without a description", async () => {
      const res = await request(app)
        .post("/api/images")
        .set(admin)
        .field("imageType", "school")
        .attach("image", PNG, "photo.png");

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ ImagePath: "https://cdn.test/1.png", Description: null, branch_id: null });
    });

    it("points the record at the new file when the image file is replaced", async () => {
      const id = await insert("Images", { ImagePath: "https://cdn.test/old.png", PublicID: "pid-old", ImageType: "school" });

      const res = await request(app).put(`/api/images/${id}/image`).set(admin).attach("image", PNG, "new.png");

      expect(res.status).toBe(200);
      const [[row]] = await db.query("SELECT ImagePath, PublicID FROM Images WHERE ImageID = ?", [id]);
      expect(row).toEqual({ ImagePath: "https://cdn.test/1.png", PublicID: "pid-1" });
      expect(cloud.deleted).toEqual(["pid-old"]);
    });

    it("updates only the metadata that was sent", async () => {
      const id = await insert("Images", {
        ImagePath: "https://cdn.test/a.png", PublicID: "pid-a", ImageType: "event", Description: "Old",
      });

      const res = await request(app).put(`/api/images/${id}`).set(admin).send({ description: "Prize giving" });

      expect(res.status).toBe(200);
      const [[row]] = await db.query("SELECT Description, ImageType FROM Images WHERE ImageID = ?", [id]);
      expect(row).toEqual({ Description: "Prize giving", ImageType: "event" });
    });
  });

  describe("chairman photo", () => {
    it("keeps the current photo when uploading the new one fails", async () => {
      await db.query("UPDATE ChairmanProfile SET image_url = 'https://cdn.test/old.png', image_public_id = 'pid-old' WHERE id = 1");
      cloud.failNextUpload = true;

      const res = await request(app).put("/api/chairman").set(admin).attach("image", PNG, "new.png");

      expect(res.status).toBe(500);
      expect(cloud.deleted).toEqual([]);
      const [[row]] = await db.query("SELECT image_public_id FROM ChairmanProfile WHERE id = 1");
      expect(row.image_public_id).toBe("pid-old");
    });

    it("replaces the photo and then removes the old one", async () => {
      await db.query("UPDATE ChairmanProfile SET image_url = 'https://cdn.test/old.png', image_public_id = 'pid-old' WHERE id = 1");

      const res = await request(app).put("/api/chairman").set(admin).attach("image", PNG, "new.png");

      expect(res.status).toBe(200);
      expect(res.body.data.image_url).toBe("https://cdn.test/1.png");
      expect(cloud.deleted).toEqual(["pid-old"]);
    });

    it("can only be edited by a super admin", async () => {
      const { branchAdminToken } = await import("./helpers.js");

      const res = await request(app).put("/api/chairman").set(bearer(branchAdminToken(1))).send({ name_en: "Someone else" });

      expect(res.status).toBe(403);
    });
  });
});
