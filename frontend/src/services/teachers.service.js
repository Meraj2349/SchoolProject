import httpClient from "@/lib/httpClient";

export const teachersService = {
  getAll: () => httpClient.get("/teachers").then((r) => r.data),

  search: (q, className = "") =>
    httpClient
      .get("/teachers/search", { params: { q, className } })
      .then((r) => r.data),

  create: (data) =>
    httpClient.post("/teachers/addTeacher", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/teachers/updateTeacher/${id}`, data).then((r) => r.data),

  // Sign-in to the attendance app: [{ teacherId, phone, enabled, hasPassword, lastLoginAt }]
  getAppAccess: () => httpClient.get("/teachers/app-access").then((r) => r.data),

  // { phone, password?, enabled }: a missing password keeps the current one
  setAppAccess: (id, data) =>
    httpClient.put(`/teachers/${id}/app-access`, data).then((r) => r.data),

  remove: (id) =>
    httpClient.delete(`/teachers/deleteTeacher/${id}`).then((r) => r.data),
};
