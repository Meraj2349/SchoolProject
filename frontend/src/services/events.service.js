import httpClient from "@/lib/httpClient";

export const eventsService = {
  getAll: () => httpClient.get("/events").then((r) => r.data?.data ?? r.data),

  getById: (id) =>
    httpClient.get(`/events/${id}`).then((r) => r.data?.data ?? r.data),

  create: (data) => httpClient.post("/events", data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/events/${id}`, data).then((r) => r.data),

  remove: (id) => httpClient.delete(`/events/${id}`).then((r) => r.data),
};
