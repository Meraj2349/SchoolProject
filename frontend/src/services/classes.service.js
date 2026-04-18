import httpClient from "@/lib/httpClient";

export const classesService = {
  getAll: () => httpClient.get("/classes").then((r) => r.data),

  // Global class names — not branch-scoped (class names are the same across all branches)
  getNames: () => httpClient.get("/classes/names").then((r) => r.data),

  // Fixed standard sections — same for every branch: ["Better", "Good", "General"]
  getStandardSections: () =>
    httpClient.get("/classes/standard-sections").then((r) => r.data),

  // Branch-scoped (ClassName, Section) pairs — used to derive available sections per branch
  getDistinct: () => httpClient.get("/classes/distinct").then((r) => r.data),

  create: (data) => httpClient.post("/classes/add", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/classes/edit/${id}`, data).then((r) => r.data),

  remove: (id) =>
    httpClient.delete(`/classes/delete/${id}`).then((r) => r.data),

  hardRemove: (id) =>
    httpClient.delete(`/classes/hard-delete/${id}`).then((r) => r.data),

  getStudentCount: (className) =>
    httpClient
      .get(`/classes/totalstudents/${encodeURIComponent(className)}`)
      .then((r) => r.data),
};
