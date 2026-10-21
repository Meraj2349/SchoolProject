import { normalizeBdMobile } from "../../../shared/bdMobile.js";
import { TooManyRequestsError, UnauthorizedError, ValidationError } from "../../../shared/errors/index.js";
import { schoolToday } from "../../../shared/schoolDate.js";
import { MAX_FAILED_LOGINS, lockUntil, parsePassword } from "../domain/teacherAccount.js";

/**
 * What a class teacher does in the phone app: sign in with their mobile number
 * and password, see their classes, and take their class's attendance.
 *
 * @param {object} deps
 * @param {object} deps.repository       see fakeTeacherAccountRepository.js for the port
 * @param {object} deps.attendance       the attendance use cases (getRoster, saveDay)
 * @param {{ hash, compare }} deps.passwordHasher  compare(plain, null) must still take as
 *                                       long as a real check, so unknown numbers are not told apart
 * @param {(claims: { teacherId, branchId, tokenVersion }) => string} deps.issueToken
 * @param {{ now: () => Date }} deps.clock
 */
export function makeTeacherAppUseCases({ repository, attendance, passwordHasher, issueToken, clock }) {
  const loginFailed = () => new UnauthorizedError("teacher_app_login_failed");
  const canSignIn = (account) => account != null && Boolean(account.enabled) && account.passwordHash != null;

  const tokenFor = (account) =>
    issueToken({ teacherId: account.id, branchId: account.branchId, tokenVersion: account.tokenVersion });

  const teacherOf = (account) => ({
    id: account.id,
    branchId: account.branchId,
    firstName: account.firstName,
    lastName: account.lastName,
    phone: account.phone,
    branch: account.branch,
  });

  async function profile(teacher) {
    const today = schoolToday(clock.now());
    const { branchId: _branchId, ...shown } = teacher;
    return { teacher: shown, today, classes: await repository.classesOf(teacher.id, teacher.branchId, today) };
  }

  const actorOf = (teacher) => ({ kind: "teacher", id: teacher.id, branchId: teacher.branchId });

  /**
   * Counts a password check before it is made, in one atomic step: guesses
   * sent at the same moment cannot all slip in before the lock. False when
   * the number is locked. A successful sign-in or a new password resets it.
   */
  async function reserveAttempt(account) {
    const now = clock.now();
    const { allowed } = await repository.reserveLoginAttempt(account.id, {
      max: MAX_FAILED_LOGINS,
      lockedUntil: lockUntil(now),
      now,
    });
    return allowed;
  }

  return {
    /**
     * { token, teacher, today, classes }. At most MAX_FAILED_LOGINS passwords
     * are checked per number until a sign-in succeeds or the lock runs out.
     * A locked number gets the same answer as a wrong password, so the
     * answer never tells which numbers have an account.
     */
    async login({ phone, password }) {
      const number = normalizeBdMobile(phone);
      const account = number ? await repository.findAccountByPhone(number) : null;
      if (account && !(await reserveAttempt(account))) throw loginFailed();

      const matches = await passwordHasher.compare(String(password ?? ""), account?.passwordHash ?? null);
      if (!matches || !canSignIn(account)) throw loginFailed();

      const now = clock.now();

      await repository.recordLogin(account.id, now);
      return { token: tokenFor(account), ...(await profile(teacherOf(account))) };
    },

    /** The teacher behind a token, or null when access is off or the token was signed out. */
    async authenticate({ teacherId, tokenVersion }) {
      const account = await repository.findAccount(Number(teacherId));
      if (!canSignIn(account) || account.tokenVersion !== tokenVersion) return null;
      return teacherOf(account);
    },

    me: ({ teacher }) => profile(teacher),

    /** A new password signs out every other phone; this one gets a fresh token. */
    async changePassword({ teacher, current, next }) {
      const account = await repository.findAccount(teacher.id);
      if (!(await reserveAttempt(account))) throw new TooManyRequestsError("teacher_app_locked");
      if (!(await passwordHasher.compare(String(current ?? ""), account.passwordHash))) {
        throw new ValidationError("teacher_app_password_wrong");
      }
      const password = parsePassword(next);
      await repository.updateAccess(account.id, { passwordHash: await passwordHasher.hash(password), signOut: true });
      return { token: tokenFor(await repository.findAccount(account.id)) };
    },

    roster: ({ teacher, classId, date }) => attendance.getRoster({ actor: actorOf(teacher), classId, date }),

    saveDay: ({ teacher, classId, date, entries, takenAt }) =>
      attendance.saveDay({ actor: actorOf(teacher), classId, date, entries, takenAt }),
  };
}
