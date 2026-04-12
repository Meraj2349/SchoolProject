import httpClient from "@/lib/httpClient";

export const newsService = {
  // Public — returns only active news (used on the home page)
  getAll: () => httpClient.get("/news").then((r) => r.data?.data ?? r.data),

  // Admin — returns all news including inactive
  getAllAdmin: () =>
    httpClient.get("/news/all").then((r) => r.data?.data ?? r.data),

  create: (data) => httpClient.post("/news", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/news/${id}`, data).then((r) => r.data),

  remove: (id) => httpClient.delete(`/news/${id}`).then((r) => r.data),
};
