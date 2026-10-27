import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, bearer, branchAdminToken, db, insert, resetDb, seedStudent, superAdminToken } from "./helpers.js";

// Every read endpoint, called with branch scoping active. A 500 here is
// almost always broken SQL (e.g. a branch clause referencing a missing alias).
let ids;

const endpoints = () => [
  "/api/students",
  "/api/students/count",
  "/api/students/search/filter?FirstName=Ra",
  "/api/students/classes",
  "/api/students/class/Class 5",
  `/api/students/${ids.studentId}`,
  "/api/students/class/Class 5/section/Good",
  "/api/students/check-roll?rollNumber=1&className=Class 5&section=Good",
  "/api/teachers",
  "/api/teachers/search?q=Na",
  "/api/teachers/search?q=Na&className=Class 5",
  "/api/teachers/checkDuplicate?email=a@b.c&contactNumber=1",
  "/api/classes",
  "/api/classes/names",
  "/api/classes/standard-sections",
  "/api/classes/distinct",
  "/api/classes/totalstudents/Class 5",
  "/api/subjects",
  `/api/subjects/class/${ids.classId}`,
  "/api/subjects/by-class-name/Class 5",
  "/api/exams",
  "/api/exams/public/names",
  "/api/results/search?className=Class 5&section=Good&rollNumber=1&firstName=Ra&examName=Mon",
  "/api/attendance",
  "/api/attendance/statistics",
  "/api/attendance/count",
  "/api/attendance/grid?className=Class 5&section=Good&startDate=2026-01-01&endDate=2026-01-31",
  `/api/attendance/exists?studentID=${ids.studentId}&classID=${ids.classId}&classDate=2026-01-05`,
  `/api/attendance/summary/class/${ids.classId}/date/2026-01-05`,
  "/api/attendance/search/daterange/2026-01-01/2026-01-31",
  "/api/attendance/search/class/Class 5/section/Good",
  "/api/attendance/search/name/Rahim/roll/1/class/Class 5/section/Good",
  `/api/attendance/student/${ids.studentId}`,
  `/api/attendance/summary/student/${ids.studentId}`,
  `/api/attendance/class/${ids.classId}`,
  "/api/attendance/date/2026-01-05",
  `/api/attendance/${ids.attendanceId}`,
  "/api/routines",
  `/api/routines/${ids.routineId}`,
  "/api/routines/filter/class-section?className=Class 5&section=Good",
  `/api/routines/class/${ids.classId}`,
  "/api/routines/search/query?q=Term",
  "/api/routines/options/classes",
  "/api/routines/options/filters",
  "/api/routines/options/sections/Class 5",
  "/api/events",
  "/api/events/date-range?startDate=2026-01-01&endDate=2026-12-31",
  "/api/events/type/Sports",
  "/api/branches",
  "/api/branches/stats/overview",
  "/api/notices",
  "/api/messages",
  "/api/news",
  "/api/news/all",
  "/api/notice-announcements",
  "/api/notice-announcements/all",
  "/api/applications",
  "/api/chairman",
  "/api/images",
  "/api/dashboard/summary",
  "/api/quiz/admin/questions?classKey=8",
  "/api/quiz/admin/questions/subjects?classKey=8",
  "/api/quiz/admin/sessions",
  "/api/quiz/admin/leaderboard",
  "/api/fees/settings",
  "/api/fees/structures?academic_year=2026",
  "/api/fees/heads",
  `/api/fees/discounts?student_id=${ids.studentId}`,
  "/api/fees/invoices?year=2026&month=3&status=unpaid&class_name=Class 5&section=Good",
  `/api/fees/invoices/${ids.invoiceId}`,
  `/api/fees/payments/${ids.paymentId}`,
  `/api/fees/students/${ids.studentId}/ledger`,
  "/api/fees/reports/summary?year=2026&month=3",
];

describe("every read endpoint works with branch scoping", () => {
  beforeAll(async () => {
    await resetDb();
    const { classId, studentId } = await seedStudent();
    const examId = await insert("Exams", {
      ExamType: "Monthly", ExamName: "Monthly 1", ClassID: classId, ExamDate: "2030-01-01", branch_id: BRANCH_A,
    });
    const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: classId, branch_id: BRANCH_A });
    const resultId = await insert("Results", {
      StudentID: studentId, ExamID: examId, SubjectID: subjectId, ClassID: classId, MarksObtained: 80, branch_id: BRANCH_A,
    });
    const attendanceId = await insert("Attendance", {
      StudentID: studentId, ClassID: classId, ClassDate: "2026-01-05", Status: "Present", branch_id: BRANCH_A,
    });
    const routineId = await insert("Routines", {
      RoutineTitle: "Term 1", ClassID: classId, RoutineDate: "2026-01-01", branch_id: BRANCH_A,
    });
    await insert("Teachers", { FirstName: "Nasima", LastName: "B", branch_id: BRANCH_A });
    await insert("Events", { EventName: "Sports Day", EventType: "Sports", StartDate: "2026-02-01", EndDate: "2026-02-01" });
    const invoiceId = await insert("FeeInvoices", {
      branch_id: BRANCH_A, student_id: studentId, class_name: "Class 5", section: "Good",
      year: 2026, month: 3, due_date: "2026-03-10", status: "partial",
    });
    await insert("FeeInvoiceItems", { invoice_id: invoiceId, kind: "tuition", label: "Tuition", amount: 1000 });
    const paymentId = await insert("FeePayments", {
      branch_id: BRANCH_A, invoice_id: invoiceId, amount: 100, method: "cash", paid_on: "2026-03-05", receipt_no: "RCT-2026-00001",
    });
    ids = { classId, studentId, examId, subjectId, resultId, attendanceId, routineId, invoiceId, paymentId };
  });
  afterAll(() => db.end());

  const callers = {
    "branch admin": (url) => request(app).get(url).set(bearer(branchAdminToken(BRANCH_A))),
    "super admin viewing a branch": (url) =>
      request(app).get(`${url}${url.includes("?") ? "&" : "?"}branch_id=${BRANCH_A}`).set(bearer(superAdminToken())),
    "public visitor of a branch": (url) =>
      request(app).get(`${url}${url.includes("?") ? "&" : "?"}branch_id=${BRANCH_A}`),
  };

  for (const [who, call] of Object.entries(callers)) {
    it(`never fails with a server error for a ${who}`, async () => {
      const failures = [];
      for (const url of endpoints()) {
        const res = await call(url);
        if (res.status >= 500) failures.push(`${res.status} GET ${url} → ${JSON.stringify(res.body).slice(0, 200)}`);
      }
      expect(failures).toEqual([]);
    });
  }
});
