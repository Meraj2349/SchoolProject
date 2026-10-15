import { describe, expect, it } from "@jest/globals";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeGalleryUseCases } from "./gallery.usecases.js";

function fakeRepository(rows = []) {
  const store = new Map(rows.map((row) => [row.ImageID, { ...row }]));
  let nextId = Math.max(0, ...store.keys()) + 1;
  return {
    store,
    async list({ branchId, type }) {
      return [...store.values()].filter(
        (r) => (branchId == null || r.branch_id == null || r.branch_id === branchId) && (!type || r.ImageType === type),
      );
    },
    async find(id) {
      return store.get(id) ?? null;
    },
    async insert(row) {
      const id = nextId++;
      store.set(id, { ImageID: id, ...row });
      return id;
    },
    async update(id, changes) {
      store.set(id, { ...store.get(id), ...changes });
    },
    async remove(id) {
      store.delete(id);
    },
  };
}

function fakeStorage({ failUpload = false } = {}) {
  const calls = { uploaded: [], removed: [] };
  return {
    calls,
    async upload(path, folder) {
      if (failUpload) throw new Error("cloud down");
      calls.uploaded.push(folder);
      return { url: `https://cdn/${calls.uploaded.length}.png`, publicId: `pid-${calls.uploaded.length}` };
    },
    async remove(publicId) {
      calls.removed.push(publicId);
    },
  };
}

// Student 1 and teacher 1 are in branch 1; student 2 is in branch 2.
const people = { branchOf: async (kind, id) => ({ student: { 1: 1, 2: 2 }, teacher: { 1: 1 } })[kind][id] ?? null };

const superOnAll = { role: "super_admin", branchId: null };
const adminA = { role: "branch_admin", branchId: 1 };
const file = { path: "/tmp/upload" };

function setup(rows, storageOptions) {
  const repository = fakeRepository(rows);
  const imageStorage = fakeStorage(storageOptions);
  return { repository, imageStorage, gallery: makeGalleryUseCases({ repository, imageStorage, people }) };
}

describe("gallery use cases", () => {
  it("uploads into the acting branch, or the whole school", async () => {
    const { gallery, repository, imageStorage } = setup();

    const mine = await gallery.upload({ admin: adminA, input: { imageType: "event" }, file });
    const school = await gallery.upload({ admin: superOnAll, input: { imageType: "school" }, file });

    expect([mine.branch_id, school.branch_id]).toEqual([1, null]);
    expect(mine).toMatchObject({ ImagePath: "https://cdn/1.png", PublicID: "pid-1" });
    expect(imageStorage.calls.uploaded).toEqual(["school/events", "school/schools"]);
    expect(repository.store.size).toBe(2);
  });

  it("files a portrait under the person's branch", async () => {
    const { gallery } = setup();

    const image = await gallery.upload({ admin: superOnAll, input: { imageType: "student", studentId: "2" }, file });

    expect(image.branch_id).toBe(2);
  });

  it("refuses a branch admin a portrait of another branch's person, before uploading", async () => {
    const { gallery, imageStorage } = setup();

    await expect(
      gallery.upload({ admin: adminA, input: { imageType: "student", studentId: "2" }, file }),
    ).rejects.toEqual(new ValidationError("branch_mismatch"));
    expect(imageStorage.calls.uploaded).toEqual([]);
  });

  it("refuses a portrait of someone who does not exist", async () => {
    const { gallery } = setup();

    await expect(
      gallery.upload({ admin: superOnAll, input: { imageType: "teacher", teacherId: "9" }, file }),
    ).rejects.toEqual(new ValidationError("teacher_not_found"));
  });

  it("moves an image to the branch of the person it now shows", async () => {
    const { gallery, repository } = setup([{ ImageID: 1, ImageType: "school", branch_id: null, PublicID: "p" }]);

    await gallery.update({ admin: superOnAll, id: "1", input: { imageType: "student", studentId: "2" } });

    expect(repository.store.get(1)).toMatchObject({ ImageType: "student", StudentID: 2, branch_id: 2 });
  });

  it("lets only admins who may manage an image change it", async () => {
    const { gallery } = setup([
      { ImageID: 1, ImageType: "school", branch_id: null, PublicID: "p1" },
      { ImageID: 2, ImageType: "school", branch_id: 2, PublicID: "p2" },
    ]);

    await expect(gallery.update({ admin: adminA, id: "1", input: { description: "x" } })).rejects.toBeInstanceOf(ForbiddenError);
    await expect(gallery.remove({ admin: adminA, id: "2" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(gallery.replaceFile({ admin: adminA, id: "2", file })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("replaces the file, then removes the old one from storage", async () => {
    const { gallery, repository, imageStorage } = setup([{ ImageID: 1, ImageType: "event", branch_id: 1, PublicID: "old" }]);

    await gallery.replaceFile({ admin: adminA, id: "1", file });

    expect(repository.store.get(1)).toMatchObject({ ImagePath: "https://cdn/1.png", PublicID: "pid-1" });
    expect(imageStorage.calls).toEqual({ uploaded: ["school/events"], removed: ["old"] });
  });

  it("deletes the record before removing the file from storage", async () => {
    const { gallery, repository, imageStorage } = setup([{ ImageID: 1, ImageType: "event", branch_id: 1, PublicID: "p1" }]);
    repository.remove = async () => {
      throw new Error("db down");
    };

    await expect(gallery.remove({ admin: adminA, id: "1" })).rejects.toThrow("db down");
    expect(imageStorage.calls.removed).toEqual([]);
  });

  it("shows a viewer their branch's images plus whole-school ones", async () => {
    const { gallery } = setup([
      { ImageID: 1, ImageType: "event", branch_id: 1 },
      { ImageID: 2, ImageType: "event", branch_id: null },
      { ImageID: 3, ImageType: "event", branch_id: 2 },
    ]);
    const viewer = { role: "public", branchId: 1 };

    expect((await gallery.list({ viewer })).map((i) => i.ImageID)).toEqual([1, 2]);
    await expect(gallery.get({ viewer, id: "3" })).rejects.toBeInstanceOf(NotFoundError);
    expect((await gallery.get({ viewer, id: "2" })).ImageID).toBe(2);
  });
});
