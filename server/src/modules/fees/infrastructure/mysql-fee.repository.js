import db, { assignments, inList, insertList, valuesRows } from "../../../shared/db/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

// MySQL adapter for the fee repository port used by the fee use cases.
// Money columns are DECIMAL, which mysql2 returns as strings: convert them to
// numbers here so the rest of the module only sees numbers.

const MONEY_FIELDS = ["monthly_tuition", "default_amount", "value", "late_fine", "amount", "total", "paid"];

function toRow(row) {
  if (!row) return null;
  const mapped = { ...row };
  for (const field of MONEY_FIELDS) if (mapped[field] != null) mapped[field] = Number(mapped[field]);
  if (mapped.active != null) mapped.active = Boolean(mapped.active);
  return mapped;
}

const toRows = (rows) => rows.map(toRow);
const pick = (data, columns) => Object.fromEntries(columns.map((c) => [c, data[c]]));

const STUDENT_COLUMNS = `s."StudentID" AS id, s.branch_id, CONCAT(s."FirstName", ' ', s."LastName") AS name,
  s."RollNumber" AS roll_number, c."ClassName" AS class_name, c."Section" AS section`;

const INVOICE_COLUMNS = `i.id, i.branch_id, i.student_id, i.class_name, i.section, i."year", i."month",
  i.due_date, i.status, i.created_by, i.created_at,
  CONCAT(s."FirstName", ' ', s."LastName") AS student_name, s."RollNumber" AS roll_number,
  b.name_en AS branch_name_en, b.name_bn AS branch_name_bn`;

const INVOICE_JOINS = `JOIN "Students" s ON s."StudentID" = i.student_id
  JOIN "Branches" b ON b.id = i.branch_id`;

// Generic branch-scoped CRUD for the simple setup tables.
function makeCrud(table, columns) {
  const crud = {
    async list(branchId, where = "", params = []) {
      const scope = branchFilter(branchId);
      const { rows } = await db.query(
        `SELECT * FROM ${db.ident(table)} WHERE 1=1 ${scope.clause} ${where} ORDER BY id`,
        [...scope.params, ...params],
      );
      return toRows(rows);
    },
    async find(branchId, id) {
      const scope = branchFilter(branchId);
      const row = await db.one(`SELECT * FROM ${db.ident(table)} WHERE id = ? ${scope.clause}`, [id, ...scope.params]);
      return toRow(row);
    },
    async create(branchId, data) {
      const values = insertList({ branch_id: branchId, ...pick(data, columns) }, db.ident);
      const id = await db.insert(`INSERT INTO ${db.ident(table)} ${values.sql}`, values.params, "id");
      return crud.find(branchId, id);
    },
    async update(branchId, id, data) {
      const set = assignments(pick(data, columns), db.ident);
      await db.query(`UPDATE ${db.ident(table)} SET ${set.sql} WHERE id = ? AND branch_id = ?`, [...set.params, id, branchId]);
    },
    async remove(branchId, id) {
      await db.query(`DELETE FROM ${db.ident(table)} WHERE id = ? AND branch_id = ?`, [id, branchId]);
    },
  };
  return crud;
}

const structures = makeCrud("FeeStructures", ["class_name", "academic_year", "monthly_tuition"]);
const heads = makeCrud("FeeHeads", ["name_en", "name_bn", "default_amount", "active"]);
const discounts = makeCrud("StudentDiscounts", [
  "student_id", "kind", "value", "applies_to", "reason", "valid_from", "valid_to",
]);

// Queries that must also run inside a transaction take the connection to use.
function makeInvoiceQueries(conn) {
  async function linesOf(invoice) {
    if (!invoice) return null;
    const { rows: items } = await conn.query(`SELECT * FROM "FeeInvoiceItems" WHERE invoice_id = ? ORDER BY id`, [invoice.id]);
    const { rows: payments } = await conn.query(`SELECT * FROM "FeePayments" WHERE invoice_id = ? ORDER BY id`, [invoice.id]);
    return { ...invoice, items: toRows(items), payments: toRows(payments) };
  }

  async function selectInvoice(branchId, id, lock = "") {
    const scope = branchFilter(branchId, "i");
    const row = await conn.one(
      `SELECT ${INVOICE_COLUMNS} FROM "FeeInvoices" i ${INVOICE_JOINS} WHERE i.id = ? ${scope.clause} ${lock}`,
      [id, ...scope.params],
    );
    return linesOf(toRow(row));
  }

  return {
    findInvoice: (branchId, id) => selectInvoice(branchId, id),
    lockInvoice: (branchId, id) => selectInvoice(branchId, id, "FOR UPDATE OF i"),

    async lockPayment(branchId, id) {
      const scope = branchFilter(branchId);
      const row = await conn.one(`SELECT * FROM "FeePayments" WHERE id = ? ${scope.clause} FOR UPDATE`, [
        id,
        ...scope.params,
      ]);
      return toRow(row);
    },

    async addInvoiceItem(invoiceId, { kind, label, amount }) {
      await conn.query(`INSERT INTO "FeeInvoiceItems" (invoice_id, kind, label, amount) VALUES (?, ?, ?, ?)`, [
        invoiceId, kind, label, amount,
      ]);
    },

    async setInvoiceStatus(invoiceId, status) {
      await conn.query(`UPDATE "FeeInvoices" SET status = ? WHERE id = ?`, [status, invoiceId]);
    },

    // The upsert row-locks the counter until commit, so two cashiers can never
    // be given the same receipt number.
    async nextReceiptSeq(branchId, year) {
      const bump =
        db.dialect === "postgres"
          ? `ON CONFLICT (branch_id, "year") DO UPDATE SET last_seq = "FeeReceiptCounters".last_seq + 1`
          : "ON DUPLICATE KEY UPDATE last_seq = last_seq + 1";
      await conn.query(`INSERT INTO "FeeReceiptCounters" (branch_id, "year", last_seq) VALUES (?, ?, 1) ${bump}`, [branchId, year]);
      const row = await conn.one(`SELECT last_seq FROM "FeeReceiptCounters" WHERE branch_id = ? AND "year" = ?`, [
        branchId, year,
      ]);
      return row.last_seq;
    },

    async createPayment(p) {
      return conn.insert(
        `INSERT INTO "FeePayments" (branch_id, invoice_id, amount, method, paid_on, receipt_no, received_by, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.branch_id, p.invoice_id, p.amount, p.method, p.paid_on, p.receipt_no, p.received_by, p.note],
        "id",
      );
    },

    async voidPayment(id, { voided_by, void_reason }) {
      await conn.query(`UPDATE "FeePayments" SET voided_at = NOW(), voided_by = ?, void_reason = ? WHERE id = ?`, [
        voided_by, void_reason, id,
      ]);
    },
  };
}

const INVOICE_FILTERS = [
  ["year", `i."year" = ?`],
  ["month", `i."month" = ?`],
  ["status", "i.status = ?"],
  ["student_id", "i.student_id = ?"],
  ["class_name", "i.class_name = ?"],
  ["section", "i.section = ?"],
];

async function listInvoices(branchId, filters = {}) {
  const scope = branchFilter(branchId, "i");
  const active = INVOICE_FILTERS.filter(([key]) => filters[key] != null);
  const { rows } = await db.query(
    `SELECT ${INVOICE_COLUMNS}, COALESCE(it.total, 0) AS total, COALESCE(p.paid, 0) AS paid
       FROM "FeeInvoices" i ${INVOICE_JOINS}
       LEFT JOIN (SELECT invoice_id, SUM(amount) AS total FROM "FeeInvoiceItems" GROUP BY invoice_id) it
              ON it.invoice_id = i.id
       LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM "FeePayments" WHERE voided_at IS NULL GROUP BY invoice_id) p
              ON p.invoice_id = i.id
      WHERE 1=1 ${scope.clause} ${active.map(([, sql]) => `AND ${sql}`).join(" ")}
      ORDER BY i."year" DESC, i."month" DESC, i.class_name, i.section, ${db.sql.leadingNumber(`s."RollNumber"`)}, i.id`,
    [...scope.params, ...active.map(([key]) => filters[key])],
  );
  return toRows(rows).map((row) => ({ ...row, balance: Math.round((row.total - row.paid) * 100) / 100 }));
}

// Returns null when the student already has an invoice for that month
// (another request got there first): the UNIQUE key is the real guard.
async function createInvoice(branchId, { items, ...invoice }) {
  try {
    return await db.withTransaction(async (tx) => {
      const invoiceId = await tx.insert(
        `INSERT INTO "FeeInvoices"
           (branch_id, student_id, class_name, section, "year", "month", due_date, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [branchId, invoice.student_id, invoice.class_name, invoice.section, invoice.year, invoice.month,
          invoice.due_date, invoice.status, invoice.created_by],
        "id",
      );
      if (items.length > 0) {
        const lines = valuesRows(items.map((item) => [invoiceId, item.kind, item.label, item.amount]));
        await tx.query(`INSERT INTO "FeeInvoiceItems" (invoice_id, kind, label, amount) VALUES ${lines.sql}`, lines.params);
      }
      return invoiceId;
    });
  } catch (error) {
    if (db.isUniqueViolation(error)) return null;
    throw error;
  }
}

async function findStudent(branchId, id) {
  const scope = branchFilter(branchId, "s");
  const row = await db.one(
    `SELECT ${STUDENT_COLUMNS} FROM "Students" s JOIN "Classes" c ON c."ClassID" = s."ClassID"
      WHERE s."StudentID" = ? ${scope.clause}`,
    [id, ...scope.params],
  );
  return row ?? null;
}

async function listBillableStudents(branchId, { class_names = [] } = {}) {
  const classes = inList(class_names);
  const byClass = class_names.length > 0 ? `AND c."ClassName" IN ${classes.sql}` : "";
  const { rows } = await db.query(
    `SELECT ${STUDENT_COLUMNS} FROM "Students" s JOIN "Classes" c ON c."ClassID" = s."ClassID"
      WHERE s.branch_id = ? ${byClass} ORDER BY s."StudentID"`,
    [branchId, ...classes.params],
  );
  return rows;
}

async function invoicedStudentIds(branchId, { year, month }) {
  const { rows } = await db.query(
    `SELECT student_id FROM "FeeInvoices" WHERE branch_id = ? AND "year" = ? AND "month" = ?`,
    [branchId, year, month],
  );
  return rows.map((row) => row.student_id);
}

async function listPayments(branchId, { student_id } = {}) {
  const scope = branchFilter(branchId, "p");
  const byStudent = student_id ? "AND i.student_id = ?" : "";
  const { rows } = await db.query(
    `SELECT p.*, i."year", i."month" FROM "FeePayments" p JOIN "FeeInvoices" i ON i.id = p.invoice_id
      WHERE 1=1 ${scope.clause} ${byStudent} ORDER BY p.paid_on DESC, p.id DESC`,
    [...scope.params, ...(student_id ? [student_id] : [])],
  );
  return toRows(rows);
}

async function findPayment(branchId, id) {
  const scope = branchFilter(branchId);
  const row = await db.one(`SELECT * FROM "FeePayments" WHERE id = ? ${scope.clause}`, [id, ...scope.params]);
  return toRow(row);
}

async function getSettings(branchId) {
  const row = await db.one(
    `SELECT due_day, late_fine, receipt_prefix FROM "FeeSettings" WHERE branch_id = ?`,
    [branchId],
  );
  return toRow(row);
}

async function saveSettings(branchId, { due_day, late_fine, receipt_prefix }) {
  const replace =
    db.dialect === "postgres"
      ? `ON CONFLICT (branch_id) DO UPDATE SET due_day = EXCLUDED.due_day, late_fine = EXCLUDED.late_fine,
       receipt_prefix = EXCLUDED.receipt_prefix`
      : `ON DUPLICATE KEY UPDATE due_day = VALUES(due_day), late_fine = VALUES(late_fine),
       receipt_prefix = VALUES(receipt_prefix)`;
  await db.query(
    `INSERT INTO "FeeSettings" (branch_id, due_day, late_fine, receipt_prefix) VALUES (?, ?, ?, ?) ${replace}`,
    [branchId, due_day, late_fine, receipt_prefix],
  );
}

async function findStructureByClass(branchId, className, academicYear) {
  const row = await db.one(
    `SELECT * FROM "FeeStructures" WHERE branch_id = ? AND class_name = ? AND academic_year = ?`,
    [branchId, className, academicYear],
  );
  return toRow(row);
}

const invoiceQueries = makeInvoiceQueries(db);

export const mysqlFeeRepository = {
  getSettings,
  saveSettings,

  listStructures: (branchId, { academic_year } = {}) =>
    academic_year ? structures.list(branchId, "AND academic_year = ?", [academic_year]) : structures.list(branchId),
  findStructure: structures.find,
  findStructureByClass,
  createStructure: structures.create,
  updateStructure: structures.update,
  removeStructure: structures.remove,

  listHeads: (branchId) => heads.list(branchId),
  findHead: heads.find,
  createHead: heads.create,
  updateHead: heads.update,
  removeHead: heads.remove,

  listDiscounts: (branchId, { student_id } = {}) =>
    student_id ? discounts.list(branchId, "AND student_id = ?", [student_id]) : discounts.list(branchId),
  findDiscount: discounts.find,
  createDiscount: discounts.create,
  updateDiscount: discounts.update,
  removeDiscount: discounts.remove,

  findStudent,
  listBillableStudents,
  invoicedStudentIds,
  createInvoice,
  findInvoice: invoiceQueries.findInvoice,
  listInvoices,
  listPayments,
  findPayment,

  inTransaction: (work) => db.withTransaction((tx) => work(makeInvoiceQueries(tx))),
};
