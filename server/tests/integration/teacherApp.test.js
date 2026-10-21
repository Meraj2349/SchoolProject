import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { addDays, schoolToday } from "../../src/shared/schoolDate.js";
import {
  BRANCH_A,
  BRANCH_B,
  bearer,
  branchAdminToken,
  count,
  db,
  insert,
  quizStudentToken,
  resetDb,
  seedStudent,
} from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));
const API = "/api/teacher-app/v1";
const PHONE = "01711000001";
const PASSWORD = "class5-secret";
const TODAY = schoolToday();

let visitor = 0;
// Each test signs in from its own address, so the per-address login limit
// never carries over from one test to the next.
const fromNewAddress = () => `10.0.0.${++visitor}`;

describe("teacher app", () => {
  let teacherId;
  let otherTeacherId;
  let rahim;
  let karim;
  let ip;

  beforeEach(async () => {
    await resetDb();
    ip = fromNewAddress();
    teacherId = await insert("Teachers", { FirstName: "Nasima", LastName: "Akter", Subject: "Bangla", branch_id: BRANCH_A });
    otherTeacherId = await insert("Teachers", { FirstName: "Kamal", LastName: "Hossain", Subject: "Math", branch_id: BRANCH_A });
    rahim = await seedStudent({ branchId: BRANCH_A, roll: "1", firstName: "Rahim" });
    karim = await seedStudent({ branchId: BRANCH_A, roll: "2", firstName: "Karim" });
    await db.query("UPDATE Classes SET TeacherID = ? WHERE ClassID = ?", [teacherId, rahim.classId]);
  });
  afterAll(() => db.end());

  const giveAccess = (id = teacherId, body = { phone: PHONE, password: PASSWORD, enabled: true }, auth = adminA) =>
    request(app).put(`/api/teachers/${id}/app-access`).set(auth).send(body);

  const login = (phone = PHONE, password = PASSWORD) =>
    request(app).post(`${API}/login`).set("X-Forwarded-For", ip).send({ phone, password });

  async function signIn() {
    await giveAccess().expect(200);
    const res = await login().expect(200);
    return bearer(res.body.data.token);
  }

  const day = (rahimStatus, karimStatus) => [
    { studentId: rahim.studentId, status: rahimStatus },
    { studentId: karim.studentId, status: karimStatus },
  ];

  const save = (auth, { date = TODAY, entries = day("Present", "Absent"), takenAt, classId = rahim.classId } = {}) =>
    request(app).put(`${API}/classes/${classId}/attendance/${date}`).set(auth).send({ entries, takenAt });

  describe("access set by an admin", () => {
    it("never shows the sign-in details on the public teacher list", async () => {
      await giveAccess().expect(200);

      const res = await request(app).get(`/api/teachers?branch_id=${BRANCH_A}`);

      expect(res.status).toBe(200);
      const keys = Object.keys(res.body.data?.[0] ?? res.body[0]);
      expect(keys).toEqual(expect.arrayContaining(["TeacherID", "FirstName"]));
      for (const secret of ["AppPhone", "AppPasswordHash", "AppEnabled", "TokenVersion", "LastLoginAt", "FailedLogins", "LockedUntil"]) {
        expect(keys).not.toContain(secret);
      }
    });

    it("turns a teacher's access on with a mobile number (Bangla digits too) and a hashed password", async () => {
      const res = await giveAccess(teacherId, { phone: "০১৭১১-০০০০০১", password: PASSWORD, enabled: true });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ teacherId, phone: PHONE, enabled: true, hasPassword: true, lastLoginAt: null });
      const [[row]] = await db.query("SELECT AppPasswordHash AS hash FROM Teachers WHERE TeacherID = ?", [teacherId]);
      expect(row.hash).toMatch(/^\$2[aby]\$/);
      expect(row.hash).not.toContain(PASSWORD);

      const list = await request(app).get("/api/teachers/app-access").set(adminA);
      expect(list.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ teacherId, phone: PHONE, enabled: true })]));
    });

    it("refuses another branch's teacher, a number already in use and a short password", async () => {
      const teacherB = await insert("Teachers", { FirstName: "B", LastName: "B", branch_id: BRANCH_B });
      await giveAccess().expect(200);

      expect((await giveAccess(teacherB)).status).toBe(404);
      expect((await giveAccess(otherTeacherId)).status).toBe(409);
      expect((await giveAccess(otherTeacherId, { phone: "01711000002", password: "short", enabled: true })).status).toBe(400);
      expect(await count("Teachers", "AppPhone IS NOT NULL")).toBe(1);
    });
  });

  describe("signing in", () => {
    it("gives a token, the teacher, their classes and today's date", async () => {
      await giveAccess().expect(200);

      const res = await login();

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        teacher: { id: teacherId, firstName: "Nasima", lastName: "Akter" },
        today: TODAY,
        classes: [{ id: rahim.classId, name: "Class 5", section: "Good", students: 2, taken: false, takenAt: null }],
      });
      expect(res.body.data.token).toEqual(expect.any(String));
    });

    it("shows the teacher's branch on sign-in and on their profile, without the bare branch id", async () => {
      const MAIN = { id: BRANCH_A, nameBn: "প্রধান", nameEn: "Main" };
      await giveAccess().expect(200);

      const res = await login();
      const me = await request(app).get(`${API}/me`).set(bearer(res.body.data.token));

      expect(res.body.data.teacher).toEqual({ id: teacherId, firstName: "Nasima", lastName: "Akter", phone: PHONE, branch: MAIN });
      expect(me.status).toBe(200);
      expect(me.body.data.teacher).toEqual({ id: teacherId, firstName: "Nasima", lastName: "Akter", phone: PHONE, branch: MAIN });
    });

    it("refuses a wrong password, an unknown number and a teacher whose access is off, all alike", async () => {
      await giveAccess().expect(200);
      await giveAccess(otherTeacherId, { phone: "01711000002", password: PASSWORD, enabled: false }).expect(200);

      const wrong = await login(PHONE, "not-the-password");
      const unknown = await login("01999999999");
      const off = await login("01711000002");

      expect([wrong.status, unknown.status, off.status]).toEqual([401, 401, 401]);
      expect(new Set([wrong.body.message, unknown.body.message, off.body.message]).size).toBe(1);
    });

    it("checks no more passwords for a while after five wrong ones, and answers just like a wrong password", async () => {
      await giveAccess().expect(200);
      const wrong = [];
      for (let i = 0; i < 5; i += 1) wrong.push(await login(PHONE, "wrong-password"));

      const thenRight = await login();

      expect(wrong.map((r) => r.status)).toEqual([401, 401, 401, 401, 401]);
      expect(thenRight.status).toBe(401);
      expect(thenRight.body.message).toBe(wrong[0].body.message);
    });

    it("checks at most five passwords when guesses arrive at the same moment", async () => {
      await giveAccess().expect(200);
      const guesses = Array.from({ length: 12 }, (_, i) => (i === 9 ? PASSWORD : `guess-${i}-x`));

      const results = await Promise.all(guesses.map((password) => login(PHONE, password)));

      expect(results.filter((r) => r.status === 200)).toHaveLength(0);
      const [[row]] = await db.query("SELECT FailedLogins AS n, LockedUntil AS until FROM Teachers WHERE TeacherID = ?", [teacherId]);
      expect(row.n).toBe(5);
      expect(row.until).not.toBeNull();
    });

    it("unlocks the number when an admin sets a new password", async () => {
      await giveAccess().expect(200);
      for (let i = 0; i < 5; i += 1) await login(PHONE, "wrong-password");

      await giveAccess(teacherId, { phone: PHONE, password: "brand-new-pass", enabled: true }).expect(200);

      expect((await login(PHONE, "brand-new-pass")).status).toBe(200);
    });
  });

  describe("tokens", () => {
    it("keeps teacher, admin and quiz tokens apart", async () => {
      const teacher = await signIn();

      expect((await request(app).get(`${API}/me`).set(teacher)).status).toBe(200);
      expect((await request(app).get("/api/attendance").set(teacher)).status).toBe(401);
      expect((await request(app).get(`${API}/me`).set(adminA)).status).toBe(401);
      expect((await request(app).get(`${API}/me`).set(bearer(quizStudentToken(rahim.studentId, BRANCH_A)))).status).toBe(401);
    });

    it("signs the teacher out everywhere when access is turned off", async () => {
      const teacher = await signIn();

      await giveAccess(teacherId, { phone: PHONE, enabled: false }).expect(200);

      expect((await request(app).get(`${API}/me`).set(teacher)).status).toBe(401);
      expect((await login()).status).toBe(401);
    });

    it("changes the password: the new token works, the old one is signed out", async () => {
      const oldToken = await signIn();

      const res = await request(app).post(`${API}/password`).set(oldToken).send({ current: PASSWORD, next: "a-new-password" });

      expect(res.status).toBe(200);
      expect((await request(app).get(`${API}/me`).set(bearer(res.body.data.token))).status).toBe(200);
      expect((await request(app).get(`${API}/me`).set(oldToken)).status).toBe(401);
      expect((await login(PHONE, "a-new-password")).status).toBe(200);
    });

    it("refuses a password change with the wrong current password", async () => {
      const teacher = await signIn();

      const res = await request(app).post(`${API}/password`).set(teacher).send({ current: "nope-nope", next: "a-new-password" });

      expect(res.status).toBe(400);
      expect((await login()).status).toBe(200);
    });
  });

  describe("taking attendance", () => {
    it("takes today's attendance for the teacher's own class, marked as theirs", async () => {
      const teacher = await signIn();

      const roster = await request(app).get(`${API}/classes/${rahim.classId}/roster`).set(teacher);
      const res = await save(teacher);

      expect(roster.status).toBe(200);
      expect(roster.body.data.students.map((s) => s.firstName)).toEqual(["Rahim", "Karim"]);
      expect(res.status).toBe(200);
      const [rows] = await db.query("SELECT Status, MarkedByType, MarkedBy FROM Attendance ORDER BY StudentID");
      expect(rows).toEqual([
        { Status: "Present", MarkedByType: "teacher", MarkedBy: teacherId },
        { Status: "Absent", MarkedByType: "teacher", MarkedBy: teacherId },
      ]);
      const me = await request(app).get(`${API}/me`).set(teacher);
      expect(me.body.data.classes[0]).toMatchObject({ taken: true, takenAt: expect.any(String) });
    });

    it("refuses another teacher's class", async () => {
      const teacher = await signIn();
      const otherClass = await insert("Classes", { ClassName: "Class 6", Section: "Good", branch_id: BRANCH_A, TeacherID: otherTeacherId });

      const roster = await request(app).get(`${API}/classes/${otherClass}/roster`).set(teacher);
      const write = await save(teacher, { classId: otherClass, entries: [] });

      expect(roster.status).toBe(403);
      expect(write.status).toBe(403);
    });

    it("locks yesterday, except for a day the phone took yesterday and syncs within 48 hours", async () => {
      const teacher = await signIn();
      const yesterday = addDays(TODAY, -1);

      const locked = await save(teacher, { date: yesterday });
      // 14:00 in Dhaka yesterday.
      const caughtUp = await save(teacher, { date: yesterday, takenAt: `${yesterday}T08:00:00.000Z` });

      // The same save again (a lost reply) is fine; a different one is not.
      const resent = await save(teacher, { date: yesterday, takenAt: `${yesterday}T08:00:00.000Z` });
      const rewritten = await save(teacher, { date: yesterday, takenAt: `${yesterday}T17:59:00.000Z`, entries: day("Absent", "Absent") });

      expect(locked.status).toBe(403);
      expect(caughtUp.status).toBe(200);
      expect(resent.status).toBe(200);
      expect(rewritten.status).toBe(403);
      expect(await count("Attendance", "ClassDate = ? AND Status = 'Absent'", [yesterday])).toBe(1);
    });

    it("keeps an admin's correction when the phone syncs an older save, and a repeated sync changes nothing", async () => {
      const teacher = await signIn();
      const phoneTookAt = new Date(Date.now() - 5000).toISOString();
      await request(app)
        .put(`/api/attendance/class/${rahim.classId}/date/${TODAY}`)
        .set(adminA)
        .send({ entries: day("Present", "Leave") })
        .expect(200);

      const first = await save(teacher, { takenAt: phoneTookAt, entries: day("Absent", "Absent") });
      const again = await save(teacher, { takenAt: phoneTookAt, entries: day("Absent", "Absent") });

      expect(first.status).toBe(200);
      expect(first.body.data.kept).toEqual([rahim.studentId, karim.studentId]);
      expect(again.status).toBe(200);
      const [rows] = await db.query("SELECT Status, MarkedByType FROM Attendance ORDER BY StudentID");
      expect(rows).toEqual([
        { Status: "Present", MarkedByType: "admin" },
        { Status: "Leave", MarkedByType: "admin" },
      ]);
    });
  });
});
