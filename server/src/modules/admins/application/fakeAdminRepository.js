// In-memory implementation of the admin repository port for use-case tests.
export function makeFakeAdminRepository({ branches = [] } = {}) {
  const rows = new Map();
  let nextId = 1;

  const withBranch = (admin) => ({
    ...admin,
    branchName: branches.find((b) => b.id === admin.branchId)?.name_en ?? null,
  });

  const repository = {
    rows,
    // No real locking in memory; runs the work against this same repository.
    transaction: (work) => work(repository),
    findAll: async () => [...rows.values()].map(withBranch),
    findById: async (id) => (rows.has(Number(id)) ? withBranch(rows.get(Number(id))) : null),
    findByLogin: async ({ email, role, branchId }) =>
      [...rows.values()].filter((a) => a.email === email && a.role === role && a.branchId === branchId).map(withBranch),
    countSuperAdmins: async () => [...rows.values()].filter((a) => a.role === "super_admin").length,
    create: async (data) => {
      const admin = { id: nextId++, ...data };
      rows.set(admin.id, admin);
      return withBranch(admin);
    },
    update: async (id, data) => rows.set(Number(id), { ...rows.get(Number(id)), ...data }),
    remove: async (id) => rows.delete(Number(id)),
  };
  return repository;
}
