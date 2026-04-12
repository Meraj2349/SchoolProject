import httpClient from "@/lib/httpClient";

export const branchService = {
  getAll: () => httpClient.get("/branches").then((r) => r.data?.data ?? r.data),
};
