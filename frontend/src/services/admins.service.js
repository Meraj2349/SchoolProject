import httpClient from "@/lib/httpClient";

// Admin accounts — super admins only.
export const adminsService = {
  getAll: () => httpClient.get("/admins").then((r) => r.data),
  create: (data) => httpClient.post("/admins", data).then((r) => r.data),
  update: (id, data) => httpClient.put(`/admins/${id}`, data).then((r) => r.data),
  remove: (id) => httpClient.delete(`/admins/${id}`).then((r) => r.data),
};
