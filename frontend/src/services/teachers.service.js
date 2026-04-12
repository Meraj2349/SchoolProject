import httpClient from "@/lib/httpClient";

export const teachersService = {
  getAll: () => httpClient.get("/teachers").then((r) => r.data),

  create: (data) =>
    httpClient.post("/teachers/addTeacher", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/teachers/updateTeacher/${id}`, data).then((r) => r.data),

  remove: (id) =>
    httpClient.delete(`/teachers/deleteTeacher/${id}`).then((r) => r.data),
};
