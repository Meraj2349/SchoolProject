import httpClient from "@/lib/httpClient";

export const dashboardService = {
  getSummary: () => httpClient.get("/dashboard/summary").then((r) => r.data?.data),
};
