import httpClient from "@/lib/httpClient";

export const messagesService = {
  getAll: () => httpClient.get("/messages").then((r) => r.data),

  create: (data) => httpClient.post("/messages/add", data).then((r) => r.data),

  update: (id, data) => {
    // Handle visibility toggle vs regular edit
    if (Object.keys(data).length === 1 && "Show" in data) {
      return httpClient
        .put(`/messages/toggle-visibility/${id}`, { show: data.Show })
        .then((r) => r.data);
    }
    return httpClient.put(`/messages/edit/${id}`, data).then((r) => r.data);
  },

  remove: (id) =>
    httpClient.delete(`/messages/delete/${id}`).then((r) => r.data),
};
