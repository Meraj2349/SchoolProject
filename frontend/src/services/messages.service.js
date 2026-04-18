import httpClient from "@/lib/httpClient";

// Normalise form data (frontend uses PascalCase field names matching DB columns)
// to the lowercase keys the backend controller expects.
const normalise = (data) => ({
  messages: data.Messages ?? data.messages ?? "",
  show: Boolean(data.Show ?? data.show ?? false),
});

export const messagesService = {
  getAll: () => httpClient.get("/messages").then((r) => r.data),

  create: (data) =>
    httpClient.post("/messages/add", normalise(data)).then((r) => r.data),

  update: (id, data) => {
    // Visibility-only toggle
    if (Object.keys(data).length === 1 && ("Show" in data || "show" in data)) {
      return httpClient
        .put(`/messages/toggle-visibility/${id}`, {
          show: Boolean(data.Show ?? data.show),
        })
        .then((r) => r.data);
    }
    // Full edit
    return httpClient
      .put(`/messages/edit/${id}`, normalise(data))
      .then((r) => r.data);
  },

  remove: (id) =>
    httpClient.delete(`/messages/delete/${id}`).then((r) => r.data),
};
