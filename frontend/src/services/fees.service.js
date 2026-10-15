import httpClient from "@/lib/httpClient";

// Monthly fee management API (/api/fees). Returns the { success, data } body.
export const feesService = {
  getInvoices: (params) => httpClient.get("/fees/invoices", { params }).then((r) => r.data),
};
