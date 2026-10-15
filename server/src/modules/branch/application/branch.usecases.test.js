import { beforeEach, describe, expect, it } from "@jest/globals";
import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeBranchUseCases } from "./branch.usecases.js";

// In-memory fakes: use cases only depend on these ports, never on MySQL or Cloudinary.
const repoUsage = {};

function makeFakeRepository(initial = []) {
  const rows = new Map(initial.map((b) => [b.id, { ...b }]));
  let nextId = initial.length + 1;
  return {
    rows,
    findAll: async () => [...rows.values()],
    findById: async (id) => rows.get(Number(id)) ?? null,
    create: async (data) => {
      const branch = { id: nextId++, ...data };
      rows.set(branch.id, branch);
      return branch;
    },
    update: async (id, data) => {
      rows.set(Number(id), { ...rows.get(Number(id)), ...data });
    },
    remove: async (id) => {
      rows.delete(Number(id));
    },
    stats: async () => [{ id: 1, studentCount: 3 }],
    usage: async (id) => ({ students: 0, teachers: 0, classes: 0, admins: 0, invoices: 0, payments: 0, ...repoUsage[id] }),
  };
}

function makeFakeImageStorage() {
  const uploaded = [];
  const deleted = [];
  return {
    uploaded,
    deleted,
    upload: async (filePath, folder) => {
      uploaded.push({ filePath, folder });
      return { url: `https://img/${filePath}`, publicId: `pid-${filePath}` };
    },
    remove: async (publicId) => {
      deleted.push(publicId);
    },
  };
}

describe("branch use cases", () => {
  let repo;
  let images;
  let useCases;

  beforeEach(() => {
    repo = makeFakeRepository([
      { id: 1, name_en: "Main", image_url: "old", image_public_id: "old-pid" },
    ]);
    images = makeFakeImageStorage();
    useCases = makeBranchUseCases({ branchRepository: repo, imageStorage: images });
  });

  describe("listBranches", () => {
    it("returns every branch", async () => {
      expect(await useCases.listBranches()).toHaveLength(1);
    });
  });

  describe("getBranch", () => {
    it("returns the branch", async () => {
      expect(await useCases.getBranch(1)).toMatchObject({ name_en: "Main" });
    });

    it("throws NotFoundError for an unknown id", async () => {
      await expect(useCases.getBranch(99)).rejects.toThrow(NotFoundError);
    });
  });

  describe("createBranch", () => {
    it("rejects a branch without a name and uploads nothing", async () => {
      await expect(
        useCases.createBranch({ input: {}, image: { path: "a.png" } }),
      ).rejects.toThrow(ValidationError);
      expect(images.uploaded).toEqual([]);
    });

    it("stores the branch without an image", async () => {
      const branch = await useCases.createBranch({ input: { name_en: "North" } });

      expect(branch).toMatchObject({ id: 2, name_en: "North", image_url: null });
      expect(repo.rows.get(2).image_public_id).toBeNull();
    });

    it("uploads the image to the branches folder and stores its url", async () => {
      const branch = await useCases.createBranch({
        input: { name_en: "North" },
        image: { path: "a.png" },
      });

      expect(images.uploaded).toEqual([{ filePath: "a.png", folder: "school/branches" }]);
      expect(branch.image_url).toBe("https://img/a.png");
      expect(repo.rows.get(2).image_public_id).toBe("pid-a.png");
    });

    it("does not return the image public id to callers", async () => {
      const branch = await useCases.createBranch({
        input: { name_en: "North" },
        image: { path: "a.png" },
      });

      expect(branch).not.toHaveProperty("image_public_id");
    });
  });

  describe("updateBranch", () => {
    it("throws NotFoundError for an unknown id and uploads nothing", async () => {
      await expect(
        useCases.updateBranch({ id: 99, input: { name_en: "X" }, image: { path: "a.png" } }),
      ).rejects.toThrow(NotFoundError);
      expect(images.uploaded).toEqual([]);
    });

    it("throws ValidationError when there is nothing to update", async () => {
      await expect(useCases.updateBranch({ id: 1, input: {} })).rejects.toThrow(
        expect.objectContaining({ code: "branch_no_fields" }),
      );
    });

    it("updates only the fields that were sent", async () => {
      await useCases.updateBranch({ id: 1, input: { address_en: "Dhaka" } });

      expect(repo.rows.get(1)).toMatchObject({ name_en: "Main", address_en: "Dhaka" });
    });

    it("replaces the image and deletes the old one", async () => {
      await useCases.updateBranch({ id: 1, input: {}, image: { path: "b.png" } });

      expect(images.deleted).toEqual(["old-pid"]);
      expect(repo.rows.get(1)).toMatchObject({
        image_url: "https://img/b.png",
        image_public_id: "pid-b.png",
      });
    });
  });

  describe("deleteBranch", () => {
    beforeEach(() => {
      for (const key of Object.keys(repoUsage)) delete repoUsage[key];
    });

    it("throws NotFoundError for an unknown id", async () => {
      await expect(useCases.deleteBranch(99)).rejects.toThrow(NotFoundError);
    });

    it("removes an empty branch and then its image, and returns what was deleted", async () => {
      const deleted = await useCases.deleteBranch(1);

      expect(deleted).toMatchObject({ id: 1, name_en: "Main" });
      expect(repo.rows.has(1)).toBe(false);
      expect(images.deleted).toEqual(["old-pid"]);
    });

    it("refuses a branch that still has data, says what, and keeps its image", async () => {
      repoUsage[1] = { students: 120, invoices: 340, admins: 2 };

      const refused = useCases.deleteBranch(1);

      await expect(refused).rejects.toBeInstanceOf(ConflictError);
      await expect(refused).rejects.toMatchObject({
        code: "branch_in_use",
        details: { students: 120, teachers: 0, classes: 0, admins: 2, invoices: 340, payments: 0 },
      });
      expect(repo.rows.has(1)).toBe(true);
      expect(images.deleted).toEqual([]);
    });

    it("keeps the image when the database refuses the delete", async () => {
      repo.remove = async () => {
        throw new ConflictError("branch_in_use");
      };

      await expect(useCases.deleteBranch(1)).rejects.toBeInstanceOf(ConflictError);
      expect(images.deleted).toEqual([]);
    });

    it("skips image deletion when the branch has no image", async () => {
      repo.rows.set(1, { id: 1, name_en: "Main", image_public_id: null });

      await useCases.deleteBranch(1);

      expect(images.deleted).toEqual([]);
    });
  });

  describe("getBranchOverview", () => {
    it("adds this month's fees billed and collected to each branch's counts", async () => {
      repo.stats = async () => [
        { id: 1, name_en: "Main", studentCount: 120, adminCount: 2 },
        { id: 2, name_en: "North", studentCount: 0, adminCount: 0 },
      ];
      const asked = [];
      const overview = makeBranchUseCases({
        branchRepository: repo,
        imageStorage: images,
        feeSummary: async ({ branchId, input }) => {
          asked.push({ branchId, input });
          return branchId === 1 ? { billed: 120000, collected: 90000 } : { billed: 0, collected: 0 };
        },
        today: () => "2026-10-15",
      });

      expect(await overview.getBranchOverview()).toEqual([
        { id: 1, name_en: "Main", studentCount: 120, adminCount: 2, feesBilled: 120000, feesCollected: 90000 },
        { id: 2, name_en: "North", studentCount: 0, adminCount: 0, feesBilled: 0, feesCollected: 0 },
      ]);
      expect(asked).toEqual([
        { branchId: 1, input: { year: 2026, month: 10 } },
        { branchId: 2, input: { year: 2026, month: 10 } },
      ]);
    });
  });

  describe("getBranchStats", () => {
    it("returns the repository stats", async () => {
      expect(await useCases.getBranchStats()).toEqual([{ id: 1, studentCount: 3 }]);
    });
  });
});
