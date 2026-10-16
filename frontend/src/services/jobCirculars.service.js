import httpClient from "@/lib/httpClient";

const dataOf = (r) => r.data?.data ?? r.data;
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const jobCircularsService = {
  // Public — published circulars, open ones first
  getPublished: () => httpClient.get("/job-circulars").then(dataOf),

  // Public — one published circular
  getById: (id) => httpClient.get(`/job-circulars/${id}`).then(dataOf),

  // Admin — every circular in the admin's scope
  getAll: () => httpClient.get("/job-circulars/all").then(dataOf),

  create: (formData) => httpClient.post("/job-circulars", formData, multipart).then((r) => r.data),

  update: (id, formData) => httpClient.put(`/job-circulars/${id}`, formData, multipart).then((r) => r.data),

  setPublished: (id, isPublished) => httpClient.patch(`/job-circulars/${id}/publish`, { is_published: isPublished }).then((r) => r.data),

  remove: (id) => httpClient.delete(`/job-circulars/${id}`).then((r) => r.data),
};
