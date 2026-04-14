import httpClient from "@/lib/httpClient";

export const classesService = {
  getAll: () => httpClient.get("/classes").then((r) => r.data),

  getDistinct: () => httpClient.get("/classes/distinct").then((r) => r.data),

  create: (data) => httpClient.post("/classes/add", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/classes/edit/${id}`, data).then((r) => r.data),

  remove: (id) =>
    httpClient.delete(`/classes/delete/${id}`).then((r) => r.data),

  getStudentCount: (className) =>
    httpClient
      .get(`/classes/totalstudents/${encodeURIComponent(className)}`)
      .then((r) => r.data),
};
