import httpClient from "@/lib/httpClient";

export const examsService = {
  getAll: () => httpClient.get("/exams").then((r) => r.data),

  getById: (id) => httpClient.get(`/exams/${id}`).then((r) => r.data),

  getByClass: (classId) =>
    httpClient.get(`/exams/class/${classId}`).then((r) => r.data),

  create: (data) =>
    httpClient.post("/exams/by-class", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/exams/${id}`, data).then((r) => r.data),

  remove: (id) => httpClient.delete(`/exams/${id}`).then((r) => r.data),
};
