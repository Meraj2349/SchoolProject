import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { feeController as fees } from "../src/modules/fees/index.js";

// Fee management for admins. A branch admin works on their own branch; a
// super admin reads across branches and passes ?branch_id= to change one.
const router = express.Router();
router.use(authMiddleware);

router.get("/settings", fees.getSettings);
router.put("/settings", fees.updateSettings);

router.get("/structures", fees.listStructures);
router.post("/structures", fees.createStructure);
router.put("/structures/:id", fees.updateStructure);
router.delete("/structures/:id", fees.deleteStructure);

router.get("/heads", fees.listHeads);
router.post("/heads", fees.createHead);
router.put("/heads/:id", fees.updateHead);
router.delete("/heads/:id", fees.deleteHead);

router.get("/discounts", fees.listDiscounts);
router.post("/discounts", fees.createDiscount);
router.put("/discounts/:id", fees.updateDiscount);
router.delete("/discounts/:id", fees.deleteDiscount);

router.post("/invoices/generate", fees.generateInvoices);
router.post("/invoices/apply-late-fines", fees.applyLateFines);
router.get("/invoices", fees.listInvoices);
router.get("/invoices/:id", fees.getInvoice);
router.post("/invoices/:id/payments", fees.recordPayment);

router.get("/payments/:id", fees.getReceipt);
router.post("/payments/:id/void", fees.voidPayment);

router.get("/students/:id/ledger", fees.studentLedger);
router.get("/reports/summary", fees.monthlySummary);

export default router;
