import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { accessView, parseAppPhone, parsePassword } from "../domain/teacherAccount.js";

const given = (value) => value !== undefined && value !== null && value !== "";
const isTrue = (value) => value === true || value === "true";

/**
 * Admins switch teachers' app access on and off. `admin` is { role, branchId }
 * as set by authMiddleware: a super admin manages every branch's teachers, a
 * branch admin their own branch's.
 *
 * @param {object} deps
 * @param {object} deps.repository      see fakeTeacherAccountRepository.js for the port
 * @param {{ hash: (plain: string) => Promise<string> }} deps.passwordHasher
 */
export function makeTeacherAccessUseCases({ repository, passwordHasher }) {
  const scopeOf = (admin) => (admin.role === "super_admin" ? null : admin.branchId);

  async function accountFor(admin, teacherId) {
    const account = await repository.findAccount(Number(teacherId));
    const scope = scopeOf(admin);
    if (!account || (scope != null && account.branchId !== scope)) throw new NotFoundError("teacher_not_found");
    return account;
  }

  return {
    async list({ admin }) {
      return (await repository.listAccess(scopeOf(admin))).map(accessView);
    },

    /**
     * `input`: { phone?, password?, enabled }. A missing phone or password
     * keeps the current one. A new password, a new number or switching access
     * off signs the teacher out on every phone.
     */
    async setAccess({ admin, teacherId, input = {} }) {
      const account = await accountFor(admin, teacherId);
      const enabled = isTrue(input.enabled);
      // An empty number clears it (with access off); a missing one keeps it.
      const phone = given(input.phone) ? parseAppPhone(input.phone) : input.phone === undefined ? account.phone : null;
      const password = given(input.password) ? parsePassword(input.password) : null;
      if (enabled && !phone) throw new ValidationError("teacher_app_phone_invalid");
      if (enabled && !password && !account.passwordHash) throw new ValidationError("teacher_app_password_required");

      const owner = phone ? await repository.findAccountByPhone(phone) : null;
      if (owner && owner.id !== account.id) throw new ConflictError("teacher_app_phone_taken");

      await repository.updateAccess(account.id, {
        phone,
        passwordHash: password ? await passwordHasher.hash(password) : undefined,
        enabled,
        signOut: Boolean(password) || !enabled || phone !== account.phone,
      });
      return accessView(await repository.findAccount(account.id));
    },
  };
}
