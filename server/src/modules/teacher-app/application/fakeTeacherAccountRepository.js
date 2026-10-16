// In-memory stand-in for the MySQL teacher account repository, for use-case tests.

export function makeFakeTeacherAccountRepository(teachers = []) {
  const state = {
    accounts: teachers.map((t) => ({
      phone: null,
      passwordHash: null,
      enabled: false,
      tokenVersion: 0,
      lastLoginAt: null,
      failedLogins: 0,
      lockedUntil: null,
      classes: [],
      ...t,
    })),
  };
  const byId = (id) => state.accounts.find((a) => a.id === Number(id));

  return {
    state,

    async findAccount(id) {
      const account = byId(id);
      return account ? { ...account } : null;
    },

    async findAccountByPhone(phone) {
      const account = state.accounts.find((a) => a.phone === phone);
      return account ? { ...account } : null;
    },

    async listAccess(branchId) {
      return state.accounts.filter((a) => branchId == null || a.branchId === branchId).map((a) => ({ ...a }));
    },

    async updateAccess(id, { phone, passwordHash, enabled, signOut }) {
      const account = byId(id);
      if (phone !== undefined) account.phone = phone;
      if (enabled !== undefined) account.enabled = enabled;
      if (passwordHash !== undefined) Object.assign(account, { passwordHash, failedLogins: 0, lockedUntil: null });
      if (signOut) account.tokenVersion += 1;
    },

    // Atomic, like the single UPDATE of the MySQL adapter.
    async reserveLoginAttempt(id, { max, lockedUntil, now }) {
      const account = byId(id);
      if (account.lockedUntil != null && account.lockedUntil > now) return { allowed: false };
      const expired = account.lockedUntil != null;
      account.failedLogins = expired ? 1 : account.failedLogins + 1;
      account.lockedUntil = account.failedLogins >= max ? lockedUntil : null;
      return { allowed: true };
    },

    async recordLogin(id, now) {
      Object.assign(byId(id), { failedLogins: 0, lockedUntil: null, lastLoginAt: now });
    },

    async classesOf(teacherId) {
      return byId(teacherId).classes;
    },
  };
}

/** "hash:<password>": enough to tell a hashed password from a plain one in tests. */
export const fakePasswordHasher = {
  hash: async (plain) => `hash:${plain}`,
  compare: async (plain, hash) => hash != null && hash === `hash:${plain}`,
};
