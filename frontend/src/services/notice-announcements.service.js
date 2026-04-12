import httpClient from "@/lib/httpClient";

export const noticeAnnouncementsService = {
  // Public — fetch only published items
  getPublished: () =>
    httpClient.get("/notice-announcements").then((r) => r.data),

  // Admin — fetch all items (including unpublished)
  getAll: () =>
    httpClient.get("/notice-announcements/all").then((r) => r.data),

  // Admin — create (multipart/form-data with image)
  create: (formData) =>
    httpClient
      .post("/notice-announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  // Admin — update (multipart/form-data, image is optional)
  update: (id, formData) =>
    httpClient
      .put(`/notice-announcements/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  // Admin — toggle is_published
  togglePublish: (id, is_published) =>
    httpClient
      .patch(`/notice-announcements/${id}/publish`, { is_published })
      .then((r) => r.data),

  // Admin — delete
  remove: (id) =>
    httpClient.delete(`/notice-announcements/${id}`).then((r) => r.data),
};
