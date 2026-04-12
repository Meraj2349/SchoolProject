import httpClient from "@/lib/httpClient";

export const routinesService = {
  getAll: () => httpClient.get("/routines").then((r) => r.data),

  getById: (id) => httpClient.get(`/routines/${id}`).then((r) => r.data),

  getFilterOptions: () =>
    httpClient.get("/routines/options/filters").then((r) => r.data),

  getClasses: () =>
    httpClient.get("/routines/options/classes").then((r) => r.data),

  getByClassSection: (className, section) =>
    httpClient
      .get("/routines/filter/class-section", {
        params: { className, section },
      })
      .then((r) => r.data),

  search: (q) =>
    httpClient
      .get("/routines/search/query", { params: { q } })
      .then((r) => r.data),

  create: (formData) =>
    httpClient
      .post("/routines", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (id, formData) =>
    httpClient
      .put(`/routines/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  remove: (id) => httpClient.delete(`/routines/${id}`).then((r) => r.data),
};
