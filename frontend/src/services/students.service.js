import httpClient from "@/lib/httpClient";

export const studentsService = {
  getAll: () => httpClient.get("/students").then((r) => r.data),

  getById: (id) => httpClient.get(`/students/${id}`).then((r) => r.data),

  search: (filters) =>
    httpClient
      .get("/students/search/filter", { params: filters })
      .then((r) => r.data),

  create: (data) => httpClient.post("/students", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/students/${id}`, data).then((r) => r.data),

  remove: (id) => httpClient.delete(`/students/${id}`).then((r) => r.data),

  getCount: () => httpClient.get("/students/count").then((r) => r.data),

  getByClassSection: (className, section) =>
    httpClient
      .get(
        `/students/class/${encodeURIComponent(className)}/section/${encodeURIComponent(section)}`,
      )
      .then((r) => r.data),
};
