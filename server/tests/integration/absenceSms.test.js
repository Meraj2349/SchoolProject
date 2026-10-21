import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { makeAbsenceSmsUseCases } from "../../src/modules/notifications/application/absenceSms.usecases.js";
import { makeFakeSmsSender } from "../../src/modules/notifications/application/fakeAbsenceSmsRepository.js";
import { mysqlAbsenceSmsRepository } from "../../src/modules/notifications/infrastructure/mysql-absenceSms.repository.js";
import { schoolToday } from "../../src/shared/schoolDate.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, db, resetDb, seedStudent } from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));
const adminB = bearer(branchAdminToken(BRANCH_B));
const TODAY = schoolToday();

describe("absence SMS to parents", () => {
  let rahim;
  let karim;
  let sender;
  let worker;
  let savedAt;

  beforeEach(async () => {
    await resetDb();
    rahim = await seedStudent({ roll: "1", firstName: "Rahim" });
    karim = await seedStudent({ roll: "2", firstName: "Karim" });
    await db.query("UPDATE Students SET ParentContact = '01711000001' WHERE StudentID = ?", [rahim.studentId]);
    await db.query("UPDATE Students SET ParentContact = '01711000002' WHERE StudentID = ?", [karim.studentId]);
    sender = makeFakeSmsSender();
    savedAt = Date.now();
    // The real queue and database; a fake gateway and a clock 16 minutes on.
    worker = makeAbsenceSmsUseCases({
      repository: mysqlAbsenceSmsRepository,
      sender,
      clock: { now: () => new Date(savedAt + 16 * 60_000) },
      enabled: true,
      delayMinutes: 15,
    });
  });
  afterAll(() => db.end());

  const saveDay = (rahimStatus, karimStatus) =>
    request(app)
      .put(`/api/attendance/class/${rahim.classId}/date/${TODAY}`)
      .set(adminA)
      .send({ entries: [{ studentId: rahim.studentId, status: rahimStatus }, { studentId: karim.studentId, status: karimStatus }] })
      .expect(200);

  // Runs only while "16 minutes later" is still today in Dhaka.
  const stillToday = () => schoolToday(new Date(savedAt + 16 * 60_000)) === TODAY;

  it("queues absent children 15 minutes after the save, and sends one Bangla SMS each once the time comes", async () => {
    await saveDay("Absent", "Present");

    const [[queued]] = await db.query("SELECT status, TIMESTAMPDIFF(MINUTE, NOW(), due_at) AS minutes FROM AttendanceSms");
    expect(queued.status).toBe("pending");
    expect(Number(queued.minutes)).toBeGreaterThanOrEqual(14);

    if (!stillToday()) return;
    await worker.sendDue();
    await saveDay("Absent", "Present"); // saved again: still one message that day
    await worker.sendDue();

    expect(sender.sent).toEqual([{ to: "01711000001", text: expect.stringMatching(/^প্রিয় অভিভাবক, আপনার সন্তান Rahim Uddin/) }]);
    const [rows] = await db.query("SELECT status, phone FROM AttendanceSms");
    expect(rows).toEqual([{ status: "sent", phone: "01711000001" }]);
  });

  it("sends nothing for a child marked present before the time is up", async () => {
    await saveDay("Absent", "Absent");
    await saveDay("Present", "Absent");

    if (!stillToday()) return;
    await worker.sendDue();

    expect(sender.sent.map((m) => m.to)).toEqual(["01711000002"]);
    const [rows] = await db.query("SELECT student_id AS id, status FROM AttendanceSms ORDER BY student_id");
    expect(rows).toEqual([
      { id: rahim.studentId, status: "cancelled" },
      { id: karim.studentId, status: "sent" },
    ]);
  });

  it("gives up on a message a crash left half-sent, so it is never sent twice", async () => {
    await saveDay("Absent", "Present");
    await db.query("UPDATE AttendanceSms SET status = 'sending', updated_at = NOW() - INTERVAL 20 MINUTE");

    await worker.sendDue();

    const [rows] = await db.query("SELECT status, error FROM AttendanceSms");
    expect(rows).toEqual([{ status: "failed", error: "interrupted" }]);
    expect(sender.sent).toEqual([]);
  });

  it("shows admins the day's messages of their own branch only", async () => {
    await saveDay("Absent", "Present");

    const own = await request(app).get(`/api/attendance/sms?date=${TODAY}`).set(adminA);
    const other = await request(app).get(`/api/attendance/sms?date=${TODAY}`).set(adminB);

    expect(own.status).toBe(200);
    expect(own.body.data).toEqual([expect.objectContaining({ studentName: "Rahim Uddin", status: "pending", classId: expect.any(Number) })]);
    expect(other.body.data).toEqual([]);
  });

  it("never queues a message for an earlier day corrected by an admin", async () => {
    await request(app)
      .put(`/api/attendance/class/${rahim.classId}/date/2026-02-02`)
      .set(adminA)
      .send({ entries: [{ studentId: rahim.studentId, status: "Absent" }, { studentId: karim.studentId, status: "Absent" }] })
      .expect(200);

    const [[{ n }]] = await db.query("SELECT COUNT(*) AS n FROM AttendanceSms");
    expect(Number(n)).toBe(0);
  });
});
