import httpClient from "@/lib/httpClient";

export const resultsService = {
  search: (filters) =>
    httpClient.get("/results/search", { params: filters }).then((r) => r.data),

  advancedSearch: (filters, page = 1, limit = 10) =>
    httpClient
      .get("/results/search/advanced", { params: { ...filters, page, limit } })
      .then((r) => r.data),

  getByStudent: (studentId) =>
    httpClient.get(`/results/student/${studentId}`).then((r) => r.data),

  getByExam: (examId) =>
    httpClient.get(`/results/exam/${examId}`).then((r) => r.data),

  create: (data) => httpClient.post("/results", data).then((r) => r.data),

  createByDetails: (data) =>
    httpClient.post("/results/add-by-details", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/results/${id}`, data).then((r) => r.data),

  remove: (id) => httpClient.delete(`/results/${id}`).then((r) => r.data),
};
