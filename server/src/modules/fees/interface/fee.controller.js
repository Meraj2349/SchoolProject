import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for the fee module. req.branchId and req.adminId come from the
// auth middleware: a branch admin's own branch, or a super admin's ?branch_id.
export function makeFeeController({ setup, billing }) {
  const handle = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language);
    }
  };

  // Responds with the use case's result, plus a translated message if given.
  const respond = (call, { status = 200, messageKey } = {}) =>
    handle(async (req, res) => {
      const data = await call(req);
      const message = messageKey ? { message: t(messageKey, req.language) } : {};
      res.status(status).json({ success: true, ...message, ...(data === undefined ? {} : { data }) });
    });

  const scoped = (req) => ({ branchId: req.branchId });
  const withInput = (req) => ({ ...scoped(req), input: req.body });
  const withId = (req) => ({ ...scoped(req), id: req.params.id });
  const withIdAndInput = (req) => ({ ...withId(req), input: req.body });
  const byAdmin = (req) => ({ ...withInput(req), adminId: req.adminId });

  return {
    getSettings: respond((req) => setup.getSettings(req.branchId)),
    updateSettings: respond((req) => setup.updateSettings(withInput(req)), { messageKey: "fee_settings_saved" }),

    listStructures: respond((req) => setup.listStructures({ ...scoped(req), academicYear: req.query.academic_year })),
    createStructure: respond((req) => setup.createStructure(withInput(req)), { status: 201, messageKey: "fee_structure_saved" }),
    updateStructure: respond((req) => setup.updateStructure(withIdAndInput(req)), { messageKey: "fee_structure_saved" }),
    deleteStructure: respond((req) => setup.deleteStructure(withId(req)), { messageKey: "fee_structure_deleted" }),

    listHeads: respond((req) => setup.listHeads(scoped(req))),
    createHead: respond((req) => setup.createHead(withInput(req)), { status: 201, messageKey: "fee_head_saved" }),
    updateHead: respond((req) => setup.updateHead(withIdAndInput(req)), { messageKey: "fee_head_saved" }),
    deleteHead: respond((req) => setup.deleteHead(withId(req)), { messageKey: "fee_head_deleted" }),

    listDiscounts: respond((req) => setup.listDiscounts({ ...scoped(req), studentId: req.query.student_id })),
    createDiscount: respond((req) => setup.createDiscount(withInput(req)), { status: 201, messageKey: "fee_discount_saved" }),
    updateDiscount: respond((req) => setup.updateDiscount(withIdAndInput(req)), { messageKey: "fee_discount_saved" }),
    deleteDiscount: respond((req) => setup.deleteDiscount(withId(req)), { messageKey: "fee_discount_deleted" }),

    generateInvoices: respond((req) => billing.generateMonthlyInvoices(byAdmin(req)), { messageKey: "fee_invoices_generated" }),
    applyLateFines: respond((req) => billing.applyLateFines(withInput(req)), { messageKey: "fee_late_fines_applied" }),
    listInvoices: respond((req) => billing.listInvoices({ ...scoped(req), filters: req.query })),
    getInvoice: respond((req) => billing.getInvoice(withId(req))),

    recordPayment: respond(
      (req) => billing.recordPayment({ ...byAdmin(req), invoiceId: req.params.id }),
      { status: 201, messageKey: "fee_payment_recorded" },
    ),
    voidPayment: respond(
      (req) => billing.voidPayment({ ...byAdmin(req), paymentId: req.params.id }),
      { messageKey: "fee_payment_voided" },
    ),
    getReceipt: respond((req) => billing.getReceipt({ ...scoped(req), paymentId: req.params.id })),

    studentLedger: respond((req) => billing.studentLedger({ ...scoped(req), studentId: req.params.id })),
    monthlySummary: respond((req) => billing.monthlySummary({ ...scoped(req), input: req.query })),
  };
}
