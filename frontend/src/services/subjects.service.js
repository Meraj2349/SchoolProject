import httpClient from "@/lib/httpClient";

export const subjectsService = {
  getAll: () => httpClient.get("/subjects").then((r) => r.data),

  getByClass: (classId) =>
    httpClient.get(`/subjects/class/${classId}`).then((r) => r.data),

  getByClassName: (className) =>
    httpClient
      .get(`/subjects/by-class-name/${encodeURIComponent(className)}`)
      .then((r) => r.data),

  create: (data) => httpClient.post("/subjects/add", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/subjects/edit/${id}`, data).then((r) => r.data),

  remove: (id) =>
    httpClient.delete(`/subjects/delete/${id}`).then((r) => r.data),
};
