import { beforeEach, describe, expect, it } from "@jest/globals";
import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeAdminUseCases } from "./admin.usecases.js";
import { makeFakeAdminRepository } from "./fakeAdminRepository.js";

const BRANCHES = [
  { id: 1, name_en: "Main" },
  { id: 2, name_en: "North" },
];

const fakeBranches = {
  findById: async (id) => BRANCHES.find((b) => b.id === Number(id)) ?? null,
};
const fakeHasher = { hash: async (plain) => `hashed:${plain}` };

const newBranchAdmin = { Username: "karim", Email: "karim@school.test", Password: "secret123", branch_id: 1 };

describe("admin use cases", () => {
  let repo;
  let useCases;
  let boss;
  let rahim;

  beforeEach(async () => {
    repo = makeFakeAdminRepository({ branches: BRANCHES });
    useCases = makeAdminUseCases({ adminRepository: repo, branchRepository: fakeBranches, passwordHasher: fakeHasher });
    boss = await repo.create({ username: "boss", email: "boss@school.test", password: "x", role: "super_admin", branchId: null });
    rahim = await repo.create({ username: "rahim", email: "rahim@school.test", password: "x", role: "branch_admin", branchId: 2 });
  });

  describe("currentAdmin", () => {
    it("returns the admin as stored now, or null once removed", async () => {
      expect(await useCases.currentAdmin(rahim.id)).toMatchObject({ id: rahim.id, role: "branch_admin" });
      expect(await useCases.currentAdmin(999)).toBeNull();
    });
  });

  describe("listAdmins", () => {
    it("lists admins with their branch, marks you, and never includes passwords", async () => {
      const admins = await useCases.listAdmins({ currentAdminId: boss.id });

      expect(admins).toEqual([
        { id: boss.id, username: "boss", email: "boss@school.test", role: "super_admin", branch_id: null, branch_name: null, is_you: true },
        { id: rahim.id, username: "rahim", email: "rahim@school.test", role: "branch_admin", branch_id: 2, branch_name: "North", is_you: false },
      ]);
    });
  });

  describe("createAdmin", () => {
    it("creates a branch admin with a hashed password", async () => {
      const created = await useCases.createAdmin(newBranchAdmin);

      expect(created).toMatchObject({ username: "karim", role: "branch_admin", branch_id: 1, branch_name: "Main" });
      expect(created).not.toHaveProperty("password");
      expect(repo.rows.get(created.id).password).toBe("hashed:secret123");
    });

    it("refuses a branch that does not exist", async () => {
      await expect(useCases.createAdmin({ ...newBranchAdmin, branch_id: 9 })).rejects.toThrow(
        expect.objectContaining({ code: "branch_not_found" }),
      );
      await expect(useCases.createAdmin({ ...newBranchAdmin, branch_id: 9 })).rejects.toBeInstanceOf(NotFoundError);
    });

    it("refuses an email that already logs in to the same branch", async () => {
      const taken = useCases.createAdmin({ ...newBranchAdmin, Email: "RAHIM@school.test", branch_id: 2 });

      await expect(taken).rejects.toBeInstanceOf(ConflictError);
      await expect(taken).rejects.toMatchObject({ code: "admin_email_taken" });
    });

    it("allows the same email for a different branch (login asks for the branch)", async () => {
      await expect(useCases.createAdmin({ ...newBranchAdmin, Email: "rahim@school.test", branch_id: 1 })).resolves.toBeTruthy();
    });

    it("refuses a second super admin with the same email", async () => {
      const taken = useCases.createAdmin({ ...newBranchAdmin, Email: "boss@school.test", role: "super_admin" });

      await expect(taken).rejects.toMatchObject({ code: "admin_email_taken" });
    });

    it("passes on validation errors", async () => {
      await expect(useCases.createAdmin({ ...newBranchAdmin, Password: "short" })).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe("updateAdmin", () => {
    const update = (id, input, currentAdminId) => useCases.updateAdmin({ id, input, currentAdminId: currentAdminId ?? boss.id });

    it("moves a branch admin to another branch", async () => {
      const updated = await update(rahim.id, { branch_id: 1 });

      expect(updated).toMatchObject({ branch_id: 1, branch_name: "Main" });
      expect(repo.rows.get(rahim.id).branchId).toBe(1);
    });

    it("changes the password only when one is given, hashed", async () => {
      await update(rahim.id, { Email: "r@school.test", Password: "" });
      expect(repo.rows.get(rahim.id)).toMatchObject({ email: "r@school.test", password: "x" });

      await update(rahim.id, { Password: "newsecret1" });
      expect(repo.rows.get(rahim.id).password).toBe("hashed:newsecret1");
    });

    it("promotes a branch admin to super admin", async () => {
      expect(await update(rahim.id, { role: "super_admin" })).toMatchObject({ role: "super_admin", branch_id: null });
    });

    it("says when the admin does not exist", async () => {
      await expect(update(999, { Username: "x" })).rejects.toMatchObject({ code: "admin_not_found" });
    });

    it("refuses a branch that does not exist", async () => {
      await expect(update(rahim.id, { branch_id: 9 })).rejects.toMatchObject({ code: "branch_not_found" });
    });

    it("refuses an email another admin in that branch already uses", async () => {
      await repo.create({ username: "nadia", email: "nadia@school.test", password: "x", role: "branch_admin", branchId: 1 });

      await expect(update(rahim.id, { branch_id: 1, Email: "nadia@school.test" })).rejects.toMatchObject({
        code: "admin_email_taken",
      });
    });

    it("lets an admin keep their own email", async () => {
      await expect(update(rahim.id, { Email: "rahim@school.test", Username: "Rahim U" })).resolves.toMatchObject({
        username: "Rahim U",
      });
    });

    it("does not let you change your own role", async () => {
      const other = await repo.create({ username: "b2", email: "b2@school.test", password: "x", role: "super_admin", branchId: null });

      const demoteSelf = update(boss.id, { role: "branch_admin", branch_id: 1 }, boss.id);

      await expect(demoteSelf).rejects.toBeInstanceOf(ConflictError);
      await expect(demoteSelf).rejects.toMatchObject({ code: "admin_cannot_change_own_role" });
      expect(other).toBeTruthy();
    });

    it("lets you change your own name and email", async () => {
      await expect(update(boss.id, { Username: "Head" }, boss.id)).resolves.toMatchObject({ username: "Head" });
    });

    it("never demotes the last super admin", async () => {
      // A second super admin (not the boss) demotes the boss once the boss is the only other one left.
      const helper = await repo.create({ username: "h", email: "h@school.test", password: "x", role: "super_admin", branchId: null });
      await update(helper.id, { role: "branch_admin", branch_id: 1 }, boss.id);

      // Now only `boss` is super admin; a stale session of `helper` tries to demote them.
      await expect(update(boss.id, { role: "branch_admin", branch_id: 1 }, helper.id)).rejects.toMatchObject({
        code: "admin_last_super_admin",
      });
    });
  });

  describe("deleteAdmin", () => {
    it("checks for another super admin and removes inside one locked transaction", async () => {
      const steps = [];
      const transaction = repo.transaction;
      repo.transaction = async (work) => {
        steps.push("begin");
        const result = await transaction(work);
        steps.push("commit");
        return result;
      };
      const countSuperAdmins = repo.countSuperAdmins;
      repo.countSuperAdmins = async () => (steps.push("count"), countSuperAdmins());
      const remove = repo.remove;
      repo.remove = async (id) => (steps.push("remove"), remove(id));
      await repo.create({ username: "b2", email: "b2@school.test", password: "x", role: "super_admin", branchId: null });

      await useCases.deleteAdmin({ id: boss.id, currentAdminId: rahim.id });

      expect(steps).toEqual(["begin", "count", "remove", "commit"]);
    });

    it("removes an admin", async () => {
      await useCases.deleteAdmin({ id: rahim.id, currentAdminId: boss.id });

      expect(repo.rows.has(rahim.id)).toBe(false);
    });

    it("says when the admin does not exist", async () => {
      await expect(useCases.deleteAdmin({ id: 999, currentAdminId: boss.id })).rejects.toBeInstanceOf(NotFoundError);
    });

    it("does not let you delete yourself", async () => {
      await repo.create({ username: "b2", email: "b2@school.test", password: "x", role: "super_admin", branchId: null });

      await expect(useCases.deleteAdmin({ id: boss.id, currentAdminId: boss.id })).rejects.toMatchObject({
        code: "admin_cannot_delete_self",
      });
      expect(repo.rows.has(boss.id)).toBe(true);
    });

    it("never deletes the last super admin", async () => {
      await expect(useCases.deleteAdmin({ id: boss.id, currentAdminId: rahim.id })).rejects.toMatchObject({
        code: "admin_last_super_admin",
      });
    });
  });
});
