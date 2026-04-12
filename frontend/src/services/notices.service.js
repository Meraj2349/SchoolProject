import httpClient from "@/lib/httpClient";

export const noticesService = {
  getAll: () => httpClient.get("/notices").then((r) => r.data),

  create: (data) =>
    httpClient
      .post("/notices/add", {
        title: data.Title,
        description: data.Description,
      })
      .then((r) => r.data),

  update: (id, data) => {
    // Handle visibility toggle vs regular edit separately
    if (Object.keys(data).length === 1 && "Show" in data) {
      return httpClient
        .put(`/notices/toggle-visibility/${id}`, { show: data.Show })
        .then((r) => r.data);
    }
    return httpClient
      .put(`/notices/edit/${id}`, {
        title: data.Title,
        description: data.Description,
      })
      .then((r) => r.data);
  },

  remove: (id) =>
    httpClient.delete(`/notices/delete/${id}`).then((r) => r.data),
};
