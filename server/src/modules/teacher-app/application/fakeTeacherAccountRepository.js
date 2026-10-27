// In-memory stand-in for the PostgreSQL teacher account repository, for use-case tests.

// `branches` ({ id, nameBn, nameEn }) are joined onto the accounts as `branch`, as in the database.
export function makeFakeTeacherAccountRepository(teachers = [], { branches = [] } = {}) {
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
  const branchOf = (branchId) => branches.find((b) => b.id === branchId) ?? null;
  const withBranch = (account) => (account ? { ...account, branch: branchOf(account.branchId) } : null);

  return {
    state,

    async findAccount(id) {
      return withBranch(byId(id));
    },

    async findAccountByPhone(phone) {
      return withBranch(state.accounts.find((a) => a.phone === phone));
    },

    async listAccess(branchId) {
      return state.accounts.filter((a) => branchId == null || a.branchId === branchId).map(withBranch);
    },

    async updateAccess(id, { phone, passwordHash, enabled, signOut }) {
      const account = byId(id);
      if (phone !== undefined) account.phone = phone;
      if (enabled !== undefined) account.enabled = enabled;
      if (passwordHash !== undefined) Object.assign(account, { passwordHash, failedLogins: 0, lockedUntil: null });
      if (signOut) account.tokenVersion += 1;
    },

    // Atomic, like the locked read-and-update of the database adapter.
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
