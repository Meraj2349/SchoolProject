import { ConflictError, NotFoundError } from "../../../shared/errors/index.js";
import { toAdminChanges, toNewAdmin } from "../domain/admin.js";

// What the API shows of an admin. Never the password hash.
const toPublic = (admin, currentAdminId = null) => ({
  id: admin.id,
  username: admin.username,
  email: admin.email,
  role: admin.role,
  branch_id: admin.branchId,
  branch_name: admin.branchName,
  ...(currentAdminId != null && { is_you: admin.id === Number(currentAdminId) }),
});

/**
 * Managing admin accounts (super admins only — enforced by the route).
 *
 * @param {object} deps
 * @param {{findAll, findById, findByLogin, countSuperAdmins, create, update, remove}} deps.adminRepository
 * @param {{findById}} deps.branchRepository
 * @param {{hash(plain): Promise<string>}} deps.passwordHasher
 */
export function makeAdminUseCases({ adminRepository, branchRepository, passwordHasher }) {
  async function findOrFail(id) {
    const admin = await adminRepository.findById(id);
    if (!admin) throw new NotFoundError("admin_not_found");
    return admin;
  }

  async function requireBranch(branchId) {
    if (branchId != null && !(await branchRepository.findById(branchId))) {
      throw new NotFoundError("branch_not_found");
    }
  }

  // Login looks an admin up by email + role + branch, so that triple must be unique.
  async function requireFreeLogin({ email, role, branchId }, exceptId = null) {
    const clashes = await adminRepository.findByLogin({ email, role, branchId });
    if (clashes.some((admin) => admin.id !== Number(exceptId))) {
      throw new ConflictError("admin_email_taken");
    }
  }

  async function requireAnotherSuperAdmin(admin) {
    if (admin.role === "super_admin" && (await adminRepository.countSuperAdmins()) <= 1) {
      throw new ConflictError("admin_last_super_admin");
    }
  }

  return {
    async listAdmins({ currentAdminId }) {
      const admins = await adminRepository.findAll();
      return admins.map((admin) => toPublic(admin, currentAdminId));
    },

    async createAdmin(input) {
      const admin = toNewAdmin(input);
      await requireBranch(admin.branchId);
      await requireFreeLogin(admin);
      const created = await adminRepository.create({
        ...admin,
        password: await passwordHasher.hash(admin.password),
      });
      return toPublic(created);
    },

    async updateAdmin({ id, input, currentAdminId }) {
      const existing = await findOrFail(id);
      const changes = toAdminChanges(input, existing);

      if (changes.role !== existing.role) {
        if (existing.id === Number(currentAdminId)) throw new ConflictError("admin_cannot_change_own_role");
        await requireAnotherSuperAdmin(existing);
      }
      await requireBranch(changes.branchId);
      await requireFreeLogin(changes, existing.id);

      if (changes.password) changes.password = await passwordHasher.hash(changes.password);
      await adminRepository.update(existing.id, changes);
      return toPublic(await adminRepository.findById(existing.id));
    },

    async deleteAdmin({ id, currentAdminId }) {
      const existing = await findOrFail(id);
      if (existing.id === Number(currentAdminId)) throw new ConflictError("admin_cannot_delete_self");
      await requireAnotherSuperAdmin(existing);
      await adminRepository.remove(existing.id);
      return toPublic(existing);
    },
  };
}
