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

  // Grid: fetch students vs dates matrix for a class+section within a date range
  getGrid: (className, section, startDate, endDate) =>
    httpClient
      .get("/attendance/grid", {
        params: { className, section, startDate, endDate },
      })
      .then((r) => r.data),

  // Upsert a single attendance cell in the grid
  upsertCell: (studentId, classDate, status) =>
    httpClient
      .post("/attendance/cell", { studentId, classDate, status })
      .then((r) => r.data),
};
