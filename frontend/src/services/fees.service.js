import httpClient from "@/lib/httpClient";

// Monthly fee management API (/api/fees). Each call returns the response body,
// { success, message?, data? }. Writes need a branch: a super admin's selected
// branch is sent as ?branch_id by httpClient.
const body = (request) => request.then((r) => r.data);

export const feesService = {
  getSettings: () => body(httpClient.get("/fees/settings")),
  updateSettings: (data) => body(httpClient.put("/fees/settings", data)),

  getStructures: (params) => body(httpClient.get("/fees/structures", { params })),
  createStructure: (data) => body(httpClient.post("/fees/structures", data)),
  updateStructure: (id, data) => body(httpClient.put(`/fees/structures/${id}`, data)),
  deleteStructure: (id) => body(httpClient.delete(`/fees/structures/${id}`)),

  getHeads: () => body(httpClient.get("/fees/heads")),
  createHead: (data) => body(httpClient.post("/fees/heads", data)),
  updateHead: (id, data) => body(httpClient.put(`/fees/heads/${id}`, data)),
  deleteHead: (id) => body(httpClient.delete(`/fees/heads/${id}`)),

  createDiscount: (data) => body(httpClient.post("/fees/discounts", data)),
  deleteDiscount: (id) => body(httpClient.delete(`/fees/discounts/${id}`)),

  getSummary: (period) => body(httpClient.get("/fees/reports/summary", { params: period })),
  getInvoices: (params) => body(httpClient.get("/fees/invoices", { params })),
  getInvoice: (id) => body(httpClient.get(`/fees/invoices/${id}`)),
  generateInvoices: (data) => body(httpClient.post("/fees/invoices/generate", data)),
  applyLateFines: (period) => body(httpClient.post("/fees/invoices/apply-late-fines", period)),

  recordPayment: (invoiceId, data) => body(httpClient.post(`/fees/invoices/${invoiceId}/payments`, data)),
  voidPayment: (paymentId, reason) => body(httpClient.post(`/fees/payments/${paymentId}/void`, { reason })),
  getReceipt: (paymentId) => body(httpClient.get(`/fees/payments/${paymentId}`)),

  getLedger: (studentId) => body(httpClient.get(`/fees/students/${studentId}/ledger`)),
};
