import httpClient from "@/lib/httpClient";

export const branchService = {
  getAll: () => httpClient.get("/branches").then((r) => r.data?.data ?? r.data),
  getStats: () =>
    httpClient.get("/branches/stats/overview").then((r) => r.data?.data ?? r.data),
  create: (data) =>
    httpClient.post("/branches", data).then((r) => r.data),
  update: (id, data) =>
    httpClient.put(`/branches/${id}`, data).then((r) => r.data),
  remove: (id) =>
    httpClient.delete(`/branches/${id}`).then((r) => r.data),
};
