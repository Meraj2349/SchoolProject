import httpClient from "@/lib/httpClient";

const dataOf = (r) => r.data?.data ?? r.data;
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const jobApplicationsService = {
  // Public — apply to an open circular (FormData, with an optional "cv" file)
  submit: (formData) => httpClient.post("/job-applications", formData, multipart).then((r) => r.data),

  // Admin
  getAll: (filters = {}) =>
    httpClient.get("/job-applications", { params: { circular_id: filters.circularId || undefined, status: filters.status || undefined } }).then(dataOf),

  getCounts: () => httpClient.get("/job-applications/counts").then(dataOf),

  setStatus: (id, status) => httpClient.put(`/job-applications/${id}/status`, { status }).then((r) => r.data),

  remove: (id) => httpClient.delete(`/job-applications/${id}`).then((r) => r.data),

  /** The CV as a Blob; fetched with the admin's token, so it cannot be a plain link. */
  downloadCv: (id) => httpClient.get(`/job-applications/${id}/cv`, { responseType: "blob" }).then((r) => r.data),
};
