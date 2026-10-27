import httpClient from "@/lib/httpClient";

export const resultsService = {
  search: (filters) =>
    httpClient.get("/results/search", { params: filters }).then((r) => r.data),

  // StudentID, ExamID, SubjectID, ClassID, MarksObtained
  createById: (data) => httpClient.post("/results", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/results/${id}`, data).then((r) => r.data),

  remove: (id) => httpClient.delete(`/results/${id}`).then((r) => r.data),
};
