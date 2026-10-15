import httpClient from "@/lib/httpClient";

const listOf = (r) => r.data?.data ?? r.data;
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const achievementsService = {
  // Public — published achievements for the honours board
  getPublished: () => httpClient.get("/achievements").then(listOf),

  // Admin — every achievement in the admin's scope
  getAll: () => httpClient.get("/achievements/all").then(listOf),

  create: (formData) => httpClient.post("/achievements", formData, multipart).then((r) => r.data),

  update: (id, formData) => httpClient.put(`/achievements/${id}`, formData, multipart).then((r) => r.data),

  setPublished: (id, isPublished) =>
    httpClient.patch(`/achievements/${id}/publish`, { is_published: isPublished }).then((r) => r.data),

  remove: (id) => httpClient.delete(`/achievements/${id}`).then((r) => r.data),
};
