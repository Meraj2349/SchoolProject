// In-memory implementation of the fee repository port, shared by the use-case
// tests. It mirrors the branch scoping of the PostgreSQL adapter: a null branchId
// (super admin) sees every branch.
const inBranch = (branchId) => (row) => branchId == null || row.branch_id === Number(branchId);

function makeTable() {
  const rows = new Map();
  let nextId = 1;
  return {
    rows,
    all: () => [...rows.values()],
    find: (branchId, id) => [rows.get(Number(id))].filter(Boolean).find(inBranch(branchId)) ?? null,
    insert: (data) => {
      const row = { id: nextId++, ...data };
      rows.set(row.id, row);
      return row;
    },
    patch: (id, data) => rows.set(Number(id), { ...rows.get(Number(id)), ...data }),
  };
}

export function makeFakeFeeRepository({ students = [] } = {}) {
  const settings = new Map();
  const structures = makeTable();
  const heads = makeTable();
  const discounts = makeTable();
  const invoices = makeTable();
  const items = makeTable();
  const payments = makeTable();
  const receiptSeqs = new Map();

  const crud = (table) => ({
    list: (branchId) => table.all().filter(inBranch(branchId)),
    find: async (branchId, id) => table.find(branchId, id),
    create: async (branchId, data) => table.insert({ ...data, branch_id: Number(branchId) }),
    update: async (branchId, id, data) => table.patch(id, data),
    remove: async (branchId, id) => table.rows.delete(Number(id)),
  });
  const structureCrud = crud(structures);
  const headCrud = crud(heads);
  const discountCrud = crud(discounts);

  const withLines = (invoice) =>
    invoice && {
      ...invoice,
      items: items.all().filter((i) => i.invoice_id === invoice.id),
      payments: payments.all().filter((p) => p.invoice_id === invoice.id),
    };

  const findStudent = async (branchId, id) => students.find((s) => s.id === Number(id) && inBranch(branchId)(s)) ?? null;

  const repo = {
    students,
    tables: { structures, heads, discounts, invoices, items, payments },

    getSettings: async (branchId) => settings.get(Number(branchId)) ?? null,
    saveSettings: async (branchId, data) => settings.set(Number(branchId), { ...data }),

    listStructures: async (branchId, { academic_year } = {}) =>
      structureCrud.list(branchId).filter((s) => !academic_year || s.academic_year === academic_year),
    findStructure: structureCrud.find,
    findStructureByClass: async (branchId, className, year) =>
      structureCrud.list(branchId).find((s) => s.class_name === className && s.academic_year === year) ?? null,
    createStructure: structureCrud.create,
    updateStructure: structureCrud.update,
    removeStructure: structureCrud.remove,

    listHeads: async (branchId) => headCrud.list(branchId),
    findHead: headCrud.find,
    createHead: headCrud.create,
    updateHead: headCrud.update,
    removeHead: headCrud.remove,

    listDiscounts: async (branchId, { student_id } = {}) =>
      discountCrud.list(branchId).filter((d) => !student_id || d.student_id === Number(student_id)),
    findDiscount: discountCrud.find,
    createDiscount: discountCrud.create,
    updateDiscount: discountCrud.update,
    removeDiscount: discountCrud.remove,

    findStudent,
    listBillableStudents: async (branchId, { class_names = [] } = {}) =>
      students.filter(inBranch(branchId)).filter((s) => !class_names.length || class_names.includes(s.class_name)),

    invoicedStudentIds: async (branchId, { year, month }) =>
      invoices.all().filter((i) => i.branch_id === Number(branchId) && i.year === year && i.month === month).map((i) => i.student_id),

    createInvoice: async (branchId, { items: lines, ...invoice }) => {
      const created = invoices.insert({ ...invoice, branch_id: Number(branchId) });
      for (const line of lines) items.insert({ ...line, invoice_id: created.id });
      return created.id;
    },

    findInvoice: async (branchId, id) => withLines(invoices.find(branchId, id)),

    listInvoices: async (branchId, filters = {}) =>
      invoices
        .all()
        .filter(inBranch(branchId))
        .filter((i) => !filters.year || i.year === filters.year)
        .filter((i) => !filters.month || i.month === filters.month)
        .filter((i) => !filters.student_id || i.student_id === Number(filters.student_id))
        .filter((i) => !filters.status || i.status === filters.status)
        .map((i) => {
          const full = withLines(i);
          const total = full.items.reduce((sum, it) => sum + Math.round(it.amount * 100), 0);
          const paid = full.payments.filter((p) => !p.voided_at).reduce((sum, p) => sum + Math.round(p.amount * 100), 0);
          return { ...i, total: total / 100, paid: paid / 100, balance: (total - paid) / 100 };
        }),

    listPayments: async (branchId, { student_id } = {}) =>
      payments.all().filter(inBranch(branchId)).filter((p) => {
        const invoice = invoices.rows.get(p.invoice_id);
        return !student_id || invoice.student_id === Number(student_id);
      }),

    findPayment: async (branchId, id) => payments.find(branchId, id),

    // Transaction-scoped operations. The fake has no concurrency, so a
    // "transaction" just runs the callback against the repository itself.
    inTransaction: async (work) => work(repo),
    lockInvoice: async (branchId, id) => withLines(invoices.find(branchId, id)),
    lockPayment: async (branchId, id) => payments.find(branchId, id),
    addInvoiceItem: async (invoiceId, item) => items.insert({ ...item, invoice_id: Number(invoiceId) }),
    setInvoiceStatus: async (invoiceId, status) => invoices.patch(invoiceId, { status }),
    nextReceiptSeq: async (branchId, year) => {
      const key = `${branchId}-${year}`;
      receiptSeqs.set(key, (receiptSeqs.get(key) ?? 0) + 1);
      return receiptSeqs.get(key);
    },
    createPayment: async (data) => payments.insert(data).id,
    voidPayment: async (id, data) => payments.patch(id, { ...data, voided_at: "2026-01-01 00:00:00" }),
  };
  return repo;
}
