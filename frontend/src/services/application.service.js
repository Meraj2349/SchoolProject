import httpClient from "@/lib/httpClient";

export const applicationService = {
  submit: (data) =>
    httpClient.post("/applications", data).then((r) => r.data),

  getAll: () =>
    httpClient.get("/applications").then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/applications/${id}`).then((r) => r.data),

  updateStatus: (id, status) =>
    httpClient
      .put(`/applications/${id}/status`, { status })
      .then((r) => r.data),

  remove: (id) =>
    httpClient.delete(`/applications/${id}`).then((r) => r.data),
};
