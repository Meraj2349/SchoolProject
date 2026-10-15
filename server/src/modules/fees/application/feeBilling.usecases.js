import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { DEFAULT_FEE_SETTINGS, parseId, parseMonth, parseYear, toBillingPeriod } from "../domain/feeSetup.js";
import {
  INVOICE_STATUSES,
  buildInvoiceItems,
  discountAppliesIn,
  dueDateOf,
  invoiceStatus,
  invoiceTotals,
} from "../domain/invoice.js";
import { parseAmount, sumTaka, toPoisha } from "../domain/money.js";
import { formatReceiptNo, lateFineDue, toPayment, toVoid, validatePaymentAmount } from "../domain/payment.js";
import { requireBranch } from "./requireBranch.js";

const LATE_FINE_LABEL = "Late fine";

const withTotals = (invoice) => ({ ...invoice, ...invoiceTotals(invoice.items, invoice.payments) });

const isOwed = (row) => toPoisha(row.balance) > 0;

// A list from the request body; anything else (e.g. a single object) is rejected.
function listOf(value, isValidItem) {
  if (value == null) return [];
  if (!Array.isArray(value) || !value.every(isValidItem)) throw new ValidationError("fee_generate_invalid");
  return value;
}

const isText = (value) => typeof value === "string";
const isExtra = (value) => value != null && typeof value === "object" && !Array.isArray(value);

function toInvoiceFilters(input = {}) {
  if (input.status && !INVOICE_STATUSES.includes(input.status)) {
    throw new ValidationError("fee_status_invalid");
  }
  // ?class_name=a&class_name=b arrives as an array; only single values are supported.
  if ([input.class_name, input.section].some((value) => value != null && !isText(value))) {
    throw new ValidationError("fee_filter_invalid");
  }
  return {
    year: input.year ? parseYear(input.year, "fee_period_invalid") : undefined,
    month: input.month ? parseMonth(input.month) : undefined,
    status: input.status || undefined,
    student_id: input.student_id ? parseId(input.student_id, "fee_student_not_found") : undefined,
    class_name: input.class_name || undefined,
    section: input.section || undefined,
  };
}

function summarise(rows) {
  return {
    invoices: rows.length,
    billed: sumTaka(rows.map((r) => r.total)),
    collected: sumTaka(rows.map((r) => r.paid)),
    outstanding: sumTaka(rows.map((r) => r.balance)),
  };
}

/**
 * Monthly invoices, payments, late fines and the reports built on them.
 *
 * @param {object} deps
 * @param {object} deps.feeRepository  see infrastructure/mysql-fee.repository.js
 * @param {() => string} deps.today    today's date as "YYYY-MM-DD" in the school's time zone
 */
export function makeFeeBillingUseCases({ feeRepository: repo, today }) {
  const settingsOf = async (branchId) => (await repo.getSettings(branchId)) ?? DEFAULT_FEE_SETTINGS;

  async function resolveExtras(branchId, extras) {
    const resolved = [];
    for (const extra of listOf(extras, isExtra)) {
      const head = await repo.findHead(branchId, extra.head_id);
      if (!head) throw new NotFoundError("fee_head_not_found");
      const amount = extra.amount == null || extra.amount === "" ? head.default_amount : extra.amount;
      resolved.push({ label: head.name_en || head.name_bn, amount: parseAmount(amount, "fee_amount_invalid") });
    }
    return resolved;
  }

  async function tuitionByClass(branchId, year) {
    const structures = await repo.listStructures(branchId, { academic_year: year });
    return new Map(structures.map((s) => [s.class_name, Number(s.monthly_tuition)]));
  }

  async function discountsByStudent(branchId, period) {
    const discounts = (await repo.listDiscounts(branchId)).filter((d) => discountAppliesIn(d, period));
    return (studentId) => discounts.filter((d) => d.student_id === studentId);
  }

  async function lockInvoiceOrFail(tx, branchId, invoiceId) {
    const invoice = await tx.lockInvoice(branchId, invoiceId);
    if (!invoice) throw new NotFoundError("fee_invoice_not_found");
    return invoice;
  }

  // Adds the late fine to a locked invoice when it is due on `onDate`.
  async function addLateFineIfDue(tx, invoice, { onDate, lateFine }) {
    const fine = lateFineDue({
      dueDate: invoice.due_date,
      onDate,
      balance: invoiceTotals(invoice.items, invoice.payments).balance,
      hasLateFine: invoice.items.some((item) => item.kind === "late_fine"),
      lateFine,
    });
    if (fine === 0) return invoice;
    const item = { kind: "late_fine", label: LATE_FINE_LABEL, amount: fine };
    await tx.addInvoiceItem(invoice.id, item);
    return { ...invoice, items: [...invoice.items, item] };
  }

  async function refreshStatus(tx, branchId, invoiceId) {
    const invoice = withTotals(await tx.lockInvoice(branchId, invoiceId));
    const status = invoiceStatus(invoice);
    await tx.setInvoiceStatus(invoice.id, status);
    return { ...invoice, status };
  }

  async function findInvoiceOrFail(branchId, id) {
    const invoice = await repo.findInvoice(branchId, id);
    if (!invoice) throw new NotFoundError("fee_invoice_not_found");
    return withTotals(invoice);
  }

  return {
    async generateMonthlyInvoices({ branchId, adminId, input }) {
      const branch = requireBranch(branchId);
      const period = toBillingPeriod(input);
      const classNames = listOf(input.class_names, isText);
      const extras = await resolveExtras(branch, input.extras);
      const settings = await settingsOf(branch);
      const tuitions = await tuitionByClass(branch, period.year);
      const discountsOf = await discountsByStudent(branch, period);
      const invoiced = new Set(await repo.invoicedStudentIds(branch, period));
      const students = await repo.listBillableStudents(branch, { class_names: classNames });

      const result = { created: 0, already_invoiced: 0, without_fees: 0 };
      for (const student of students) {
        if (invoiced.has(student.id)) {
          result.already_invoiced += 1;
          continue;
        }
        const tuition = tuitions.get(student.class_name) ?? 0;
        if (tuition === 0 && extras.length === 0) {
          result.without_fees += 1;
          continue;
        }
        const items = buildInvoiceItems({ tuition, extras, discounts: discountsOf(student.id) });
        const created = await repo.createInvoice(branch, {
          student_id: student.id,
          class_name: student.class_name,
          section: student.section ?? null,
          ...period,
          due_date: dueDateOf(period, settings.due_day),
          status: invoiceStatus(invoiceTotals(items, [])),
          created_by: adminId,
          items,
        });
        // null: a concurrent run invoiced this student first.
        result[created ? "created" : "already_invoiced"] += 1;
      }
      return result;
    },

    async recordPayment({ branchId, adminId, invoiceId, input }) {
      const branch = requireBranch(branchId);
      const payment = toPayment(input, today());
      const settings = await settingsOf(branch);

      return repo.inTransaction(async (tx) => {
        const locked = await lockInvoiceOrFail(tx, branch, invoiceId);
        const invoice = await addLateFineIfDue(tx, locked, { onDate: payment.paid_on, lateFine: settings.late_fine });
        validatePaymentAmount({ amount: payment.amount, balance: invoiceTotals(invoice.items, invoice.payments).balance });

        const year = Number(payment.paid_on.slice(0, 4));
        const seq = await tx.nextReceiptSeq(branch, year);
        const recorded = {
          ...payment,
          branch_id: branch,
          invoice_id: invoice.id,
          receipt_no: formatReceiptNo({ prefix: settings.receipt_prefix, year, seq }),
          received_by: adminId,
        };
        const id = await tx.createPayment(recorded);
        return { payment: { id, ...recorded }, invoice: await refreshStatus(tx, branch, invoice.id) };
      });
    },

    async voidPayment({ branchId, adminId, paymentId, input }) {
      const branch = requireBranch(branchId);
      const { reason } = toVoid(input);

      return repo.inTransaction(async (tx) => {
        const payment = await tx.lockPayment(branch, paymentId);
        if (!payment) throw new NotFoundError("fee_payment_not_found");
        if (payment.voided_at) throw new ValidationError("fee_payment_already_voided");
        await tx.voidPayment(payment.id, { voided_by: adminId, void_reason: reason });
        return refreshStatus(tx, branch, payment.invoice_id);
      });
    },

    async applyLateFines({ branchId, input }) {
      const branch = requireBranch(branchId);
      const period = toBillingPeriod(input);
      const onDate = today();
      const { late_fine: lateFine } = await settingsOf(branch);
      const candidates = (await repo.listInvoices(branch, period)).filter((row) => isOwed(row) && row.due_date < onDate);

      let fined = 0;
      for (const candidate of candidates) {
        await repo.inTransaction(async (tx) => {
          const locked = await lockInvoiceOrFail(tx, branch, candidate.id);
          const invoice = await addLateFineIfDue(tx, locked, { onDate, lateFine });
          if (invoice === locked) return;
          fined += 1;
          await refreshStatus(tx, branch, invoice.id);
        });
      }
      return { fined };
    },

    listInvoices: async ({ branchId, filters }) => repo.listInvoices(branchId, toInvoiceFilters(filters)),

    getInvoice: ({ branchId, id }) => findInvoiceOrFail(branchId, id),

    async studentLedger({ branchId, studentId }) {
      const student = await repo.findStudent(branchId, studentId);
      if (!student) throw new NotFoundError("fee_student_not_found");
      const invoices = await repo.listInvoices(branchId, { student_id: student.id });
      const { billed, collected, outstanding } = summarise(invoices);
      return {
        student,
        invoices,
        payments: await repo.listPayments(branchId, { student_id: student.id }),
        discounts: await repo.listDiscounts(branchId, { student_id: student.id }),
        totals: { total: billed, paid: collected, balance: outstanding },
      };
    },

    async monthlySummary({ branchId, input }) {
      const period = toBillingPeriod(input);
      const rows = await repo.listInvoices(branchId, period);
      const onDate = today();
      const classNames = [...new Set(rows.map((r) => r.class_name))].sort();
      return {
        ...period,
        ...summarise(rows),
        overdue: rows.filter((r) => isOwed(r) && r.due_date < onDate).length,
        by_class: classNames.map((class_name) => ({
          class_name,
          ...summarise(rows.filter((r) => r.class_name === class_name)),
        })),
      };
    },

    async getReceipt({ branchId, paymentId }) {
      const payment = await repo.findPayment(branchId, paymentId);
      if (!payment) throw new NotFoundError("fee_payment_not_found");
      return { payment, invoice: await findInvoiceOrFail(payment.branch_id, payment.invoice_id) };
    },
  };
}
