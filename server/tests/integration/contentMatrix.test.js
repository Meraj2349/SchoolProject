import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import {
  BRANCH_A,
  BRANCH_B,
  bearer,
  branchAdminToken,
  count,
  db,
  insert,
  resetDb,
  seedStudent,
  superAdminToken,
} from "./helpers.js";

// Fake Cloudinary for the gallery: each upload gets a new id.
const cloud = { uploaded: 0, deleted: [] };
jest.unstable_mockModule("../../config/cloudinary.config.js", () => ({
  uploadToCloudinary: async () => {
    cloud.uploaded += 1;
    return { secure_url: `https://cdn.test/${cloud.uploaded}.png`, public_id: `pid-${cloud.uploaded}`, format: "png" };
  },
  deleteFromCloudinary: async (publicId) => {
    cloud.deleted.push(publicId);
  },
}));

const { default: app } = await import("../../app.js");

// Website content belongs to one branch, or to the whole school (branch_id
// NULL). Visitors and admins of a branch see that branch plus whole-school
// content. A branch admin manages only their own branch's content; the super
// admin manages everything and, on "All branches", creates whole-school content.

afterAll(() => db.end());

const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010806000000" +
    "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082",
  "hex",
);
const adminA = bearer(branchAdminToken(BRANCH_A));
const superAll = bearer(superAdminToken());

const KINDS = [
  {
    name: "notices",
    table: "Notices",
    id: "NoticeID",
    seed: (branchId, extra = {}) =>
      insert("Notices", { Title: "T", Description: "D", Show: true, branch_id: branchId, ...extra }),
    hidden: { Show: false },
    create: (r) => r.post("/api/notices/add").send({ title: "Sports day", description: "On Friday", show: true }),
    publicList: "/api/notices",
    adminList: "/api/notices",
    update: (r, id) => r.put(`/api/notices/edit/${id}`).send({ title: "Changed", description: "Changed" }),
    toggle: (r, id) => r.put(`/api/notices/toggle-visibility/${id}`).send({ show: false }),
    remove: (r, id) => r.delete(`/api/notices/delete/${id}`),
    changed: { column: "Title", value: "Changed" },
  },
  {
    name: "chairman messages",
    table: "Messages",
    id: "MessageID",
    seed: (branchId, extra = {}) => insert("Messages", { Messages: "Hello", Show: true, branch_id: branchId, ...extra }),
    hidden: { Show: false },
    create: (r) => r.post("/api/messages/add").send({ messages: "Welcome", show: true }),
    publicList: "/api/messages",
    adminList: "/api/messages",
    update: (r, id) => r.put(`/api/messages/edit/${id}`).send({ messages: "Changed", show: true }),
    toggle: (r, id) => r.put(`/api/messages/toggle-visibility/${id}`).send({ show: false }),
    remove: (r, id) => r.delete(`/api/messages/delete/${id}`),
    changed: { column: "Messages", value: "Changed" },
  },
  {
    name: "news",
    table: "News",
    id: "id",
    seed: (branchId, extra = {}) =>
      insert("News", { title_bn: "খবর", title_en: "News", date: "2030-01-01", branch_id: branchId, ...extra }),
    hidden: { is_active: false },
    create: (r) =>
      r.post("/api/news").send({ title_bn: "খবর", title_en: "Prize day", date: "2030-02-02", link: "/events", is_active: true }),
    publicList: "/api/news",
    adminList: "/api/news/all",
    update: (r, id) =>
      r.put(`/api/news/${id}`).send({ title_bn: "খবর", title_en: "Changed", date: "2030-02-02", link: "/events", is_active: true }),
    toggle: null,
    remove: (r, id) => r.delete(`/api/news/${id}`),
    changed: { column: "title_en", value: "Changed" },
  },
  {
    name: "notice announcements",
    table: "NoticeAnnouncements",
    id: "id",
    seed: (branchId, extra = {}) =>
      insert("NoticeAnnouncements", {
        title_bn: "নোটিশ", title_en: "Notice", category: "Notice", date: "2030-01-01", image_url: "/x.png",
        branch_id: branchId, ...extra,
      }),
    hidden: { is_published: false },
    create: (r) =>
      r
        .post("/api/notice-announcements")
        .field({ title_bn: "ভর্তি", title_en: "Admission", category: "Admission", date: "2030-03-03" })
        .attach("image", PNG, "a.png"),
    publicList: "/api/notice-announcements",
    adminList: "/api/notice-announcements/all",
    update: (r, id) =>
      r
        .put(`/api/notice-announcements/${id}`)
        .send({ title_bn: "ভর্তি", title_en: "Changed", category: "Exam", date: "2030-03-03", is_published: true }),
    toggle: (r, id) => r.patch(`/api/notice-announcements/${id}/publish`).send({ is_published: false }),
    remove: (r, id) => r.delete(`/api/notice-announcements/${id}`),
    changed: { column: "title_en", value: "Changed" },
  },
  {
    name: "achievements",
    table: "Achievements",
    id: "id",
    seed: (branchId, extra = {}) =>
      insert("Achievements", { title_en: "Win", title_bn: "জয়", category: "sports", year: 2025, branch_id: branchId, ...extra }),
    hidden: { is_published: false },
    create: (r) =>
      r.post("/api/achievements").send({ title_en: "Debate champions", title_bn: "বিতর্ক চ্যাম্পিয়ন", category: "competition", year: 2025 }),
    publicList: "/api/achievements",
    adminList: "/api/achievements/all",
    update: (r, id) => r.put(`/api/achievements/${id}`).send({ title_en: "Changed", title_bn: "জয়", category: "sports", year: 2025 }),
    toggle: (r, id) => r.patch(`/api/achievements/${id}/publish`).send({ is_published: false }),
    remove: (r, id) => r.delete(`/api/achievements/${id}`),
    changed: { column: "title_en", value: "Changed" },
  },
  {
    name: "gallery images",
    table: "Images",
    id: "ImageID",
    seed: (branchId, extra = {}) =>
      insert("Images", { ImagePath: "https://cdn.test/x.png", PublicID: "pid-x", ImageType: "school", branch_id: branchId, ...extra }),
    hidden: null,
    create: (r) => r.post("/api/images").field("imageType", "school").attach("image", PNG, "photo.png"),
    publicList: "/api/images/details",
    adminList: "/api/images/details",
    update: (r, id) => r.put(`/api/images/${id}`).send({ description: "Changed" }),
    toggle: null,
    remove: (r, id) => r.delete(`/api/images/${id}`),
    changed: { column: "Description", value: "Changed" },
  },
];

const listIds = (res, kind) => (res.body.data ?? res.body).map((row) => row[kind.id]).sort((a, b) => a - b);
const branchOf = async (kind, id) => {
  const [[row]] = await db.query(`SELECT branch_id FROM \`${kind.table}\` WHERE \`${kind.id}\` = ?`, [id]);
  return row?.branch_id;
};
const newestId = async (kind) => {
  const [[row]] = await db.query(`SELECT MAX(\`${kind.id}\`) AS id FROM \`${kind.table}\``);
  return row.id;
};
const valueOf = async (kind, id) => {
  const [[row]] = await db.query(`SELECT \`${kind.changed.column}\` AS v FROM \`${kind.table}\` WHERE \`${kind.id}\` = ?`, [id]);
  return row?.v;
};

describe.each(KINDS)("$name per branch", (kind) => {
  const api = () => request(app);

  beforeEach(async () => {
    await resetDb();
    cloud.uploaded = 0;
    cloud.deleted = [];
  });

  describe("creating", () => {
    it("puts a branch admin's new item in their branch", async () => {
      const res = await kind.create(api()).set(adminA);

      expect(res.status).toBe(201);
      expect(await branchOf(kind, await newestId(kind))).toBe(BRANCH_A);
    });

    it("puts the super admin's item in the chosen branch", async () => {
      const res = await kind.create(api()).set(superAll).query({ branch_id: BRANCH_B });

      expect(res.status).toBe(201);
      expect(await branchOf(kind, await newestId(kind))).toBe(BRANCH_B);
    });

    it("makes the super admin's item whole-school on All branches", async () => {
      const res = await kind.create(api()).set(superAll);

      expect(res.status).toBe(201);
      expect(await branchOf(kind, await newestId(kind))).toBeNull();
    });

    it("needs a login", async () => {
      expect((await kind.create(api())).status).toBe(401);
    });
  });

  describe("reading", () => {
    it("shows a branch's visitors that branch plus whole-school items", async () => {
      const own = await kind.seed(BRANCH_A);
      const school = await kind.seed(null);
      await kind.seed(BRANCH_B);

      const res = await api().get(kind.publicList).query({ branch_id: BRANCH_A });

      expect(res.status).toBe(200);
      expect(listIds(res, kind)).toEqual([own, school]);
    });

    it("shows everything when no branch is chosen", async () => {
      await kind.seed(BRANCH_A);
      await kind.seed(null);
      await kind.seed(BRANCH_B);

      expect(listIds(await api().get(kind.publicList), kind)).toHaveLength(3);
    });

    it("shows a branch admin their branch plus whole-school items, whatever branch they ask for", async () => {
      const own = await kind.seed(BRANCH_A);
      const school = await kind.seed(null);
      await kind.seed(BRANCH_B);

      const res = await api().get(kind.adminList).set(adminA).query({ branch_id: BRANCH_B });

      expect(listIds(res, kind)).toEqual([own, school]);
    });

    if (kind.hidden) {
      it("hides hidden items from visitors but not from admins", async () => {
        const shown = await kind.seed(BRANCH_A);
        const hidden = await kind.seed(BRANCH_A, kind.hidden);

        expect(listIds(await api().get(kind.publicList), kind)).toEqual([shown]);
        expect(listIds(await api().get(kind.adminList).set(adminA), kind)).toEqual([shown, hidden]);
      });
    }
  });

  describe("changing", () => {
    const writes = [["edit", kind.update], ["delete", kind.remove], ...(kind.toggle ? [["show/hide", kind.toggle]] : [])];

    it.each(writes)("lets a branch admin %s their own branch's item", async (_label, send) => {
      const id = await kind.seed(BRANCH_A);

      expect((await send(api(), id).set(adminA)).status).toBe(200);
    });

    it.each(writes)("hides another branch's item from a branch admin (%s)", async (_label, send) => {
      const id = await kind.seed(BRANCH_B);

      const res = await send(api(), id).set(adminA);

      expect(res.status).toBe(404);
      expect(await count(kind.table)).toBe(1);
      expect(await valueOf(kind, id)).not.toBe(kind.changed.value);
    });

    it.each(writes)("refuses a whole-school item to a branch admin (%s)", async (_label, send) => {
      const id = await kind.seed(null);

      const res = await send(api(), id).set(adminA);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(await count(kind.table)).toBe(1);
      expect(await valueOf(kind, id)).not.toBe(kind.changed.value);
    });

    it.each(writes)("lets the super admin %s any branch's item", async (_label, send) => {
      const id = await kind.seed(BRANCH_B);

      expect((await send(api(), id).set(superAll).query({ branch_id: BRANCH_A })).status).toBe(200);
    });

    it("keeps the item's branch when it is edited", async () => {
      const id = await kind.seed(BRANCH_B);

      await kind.update(api(), id).set(superAll);

      expect(await valueOf(kind, id)).toBe(kind.changed.value);
      expect(await branchOf(kind, id)).toBe(BRANCH_B);
    });
  });
});

describe("notice announcement images", () => {
  beforeEach(resetDb);

  it("ignores an image path sent in the request, so it can never delete another file", async () => {
    const victim = await insert("NoticeAnnouncements", {
      title_bn: "খ", title_en: "B's", category: "Notice", date: "2030-01-01", image_url: "/uploads/routines/b.png", branch_id: BRANCH_B,
    });
    const own = await insert("NoticeAnnouncements", {
      title_bn: "ক", title_en: "A's", category: "Notice", date: "2030-01-01", image_url: "/uploads/notice-announcements/a.png", branch_id: BRANCH_A,
    });

    await request(app)
      .put(`/api/notice-announcements/${own}`)
      .set(adminA)
      .send({ title_bn: "ক", title_en: "A's", category: "Notice", date: "2030-01-01", image_url: "/uploads/routines/b.png" })
      .expect(200);

    const [[row]] = await db.query("SELECT image_url FROM NoticeAnnouncements WHERE id = ?", [own]);
    expect(row.image_url).toBe("/uploads/notice-announcements/a.png");
    expect(await count("NoticeAnnouncements", "id = ?", [victim])).toBe(1);
  });

  it("needs an uploaded image to create one, whatever path is sent", async () => {
    const res = await request(app)
      .post("/api/notice-announcements")
      .set(adminA)
      .send({ title_bn: "ক", title_en: "A", category: "Notice", date: "2030-01-01", image_url: "https://elsewhere.test/x.png" });

    expect(res.status).toBe(400);
    expect(await count("NoticeAnnouncements")).toBe(0);
  });
});

describe("gallery photos of people", () => {
  beforeEach(resetDb);

  it("files a student's photo under the student's branch", async () => {
    const { studentId } = await seedStudent({ branchId: BRANCH_B });

    const res = await request(app)
      .post("/api/images")
      .set(superAll)
      .field({ imageType: "student", studentId })
      .attach("image", PNG, "s.png");

    expect(res.status).toBe(201);
    const [[row]] = await db.query("SELECT branch_id FROM Images");
    expect(row.branch_id).toBe(BRANCH_B);
  });

  it("refuses a branch admin a photo of another branch's student", async () => {
    const { studentId } = await seedStudent({ branchId: BRANCH_B });

    const res = await request(app)
      .post("/api/images")
      .set(adminA)
      .field({ imageType: "student", studentId })
      .attach("image", PNG, "s.png");

    expect(res.status).toBe(400);
    expect(await count("Images")).toBe(0);
  });

  it("refuses a branch admin moving a photo onto another branch's teacher", async () => {
    const teacherId = await insert("Teachers", { FirstName: "T", LastName: "B", Subject: "Math", branch_id: BRANCH_B });
    const id = await insert("Images", { ImagePath: "https://cdn.test/x.png", PublicID: "pid-x", ImageType: "school", branch_id: BRANCH_A });

    const res = await request(app).put(`/api/images/${id}`).set(adminA).send({ imageType: "teacher", teacherId });

    expect(res.status).toBe(400);
    const [[row]] = await db.query("SELECT TeacherID FROM Images");
    expect(row.TeacherID).toBeNull();
  });
});
