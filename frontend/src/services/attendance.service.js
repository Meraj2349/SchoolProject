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

  // A class's students with their status on `date`, and who took the day
  getRoster: (classId, date) =>
    httpClient.get("/attendance/roster", { params: { classId, date } }).then((r) => r.data),

  // The whole class's day in one request: entries = [{ studentId, status }]
  saveDay: (classId, date, entries) =>
    httpClient.put(`/attendance/class/${classId}/date/${date}`, { entries }).then((r) => r.data),

  // The day's SMS to parents of absent children
  getSms: (date) => httpClient.get("/attendance/sms", { params: { date } }).then((r) => r.data),

  // Every branch's classes on `date`: who took each one, and the day's counts
  getOverview: (date) => httpClient.get("/attendance/overview", { params: { date } }).then((r) => r.data),
};
