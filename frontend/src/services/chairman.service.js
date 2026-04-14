import httpClient from "@/lib/httpClient";

export const chairmanService = {
  getProfile: () => httpClient.get("/chairman").then((r) => r.data),

  updateProfile: (formData) =>
    httpClient
      .put("/chairman", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
};
