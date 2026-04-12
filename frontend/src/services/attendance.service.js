import httpClient from "@/lib/httpClient";

export const attendanceService = {
  getAll: () => httpClient.get("/attendance").then((r) => r.data),

  getByStudentId: (studentId) =>
    httpClient.get(`/attendance/student/${studentId}`).then((r) => r.data),

  getByClassSection: (className, section) =>
    httpClient
      .get(
        `/attendance/search/class/${encodeURIComponent(className)}/section/${encodeURIComponent(section)}`,
      )
      .then((r) => r.data),

  getByDateRange: (startDate, endDate) =>
    httpClient
      .get(`/attendance/search/daterange/${startDate}/${endDate}`)
      .then((r) => r.data),

  getStatistics: () =>
    httpClient.get("/attendance/statistics").then((r) => r.data),

  mark: (data) => httpClient.post("/attendance/mark", data).then((r) => r.data),

  bulkCreate: (records) =>
    httpClient
      .post("/attendance/bulk", { attendanceRecords: records })
      .then((r) => r.data),
};
