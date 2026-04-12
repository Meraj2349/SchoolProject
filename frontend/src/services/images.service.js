import httpClient from "@/lib/httpClient";

export const imagesService = {
  getAll: () => httpClient.get("/images/details").then((r) => r.data),

  getByType: (type) =>
    httpClient.get(`/images/type/${type}`).then((r) => r.data),

  getByStudent: (studentId) =>
    httpClient.get(`/images/student/${studentId}`).then((r) => r.data),

  getByTeacher: (teacherId) =>
    httpClient.get(`/images/teacher/${teacherId}`).then((r) => r.data),

  upload: (formData) =>
    httpClient
      .post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/images/${id}`, data).then((r) => r.data),

  remove: (id) => httpClient.delete(`/images/${id}`).then((r) => r.data),
};
