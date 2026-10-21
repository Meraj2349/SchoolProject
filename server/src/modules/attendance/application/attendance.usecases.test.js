import { beforeEach, describe, expect, it } from "@jest/globals";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeAttendanceUseCases } from "./attendance.usecases.js";
import { makeFakeAbsenceAlerts, makeFakeAttendanceRepository } from "./fakeAttendanceRepository.js";

// 10:00 in Dhaka on 2026-03-10.
const NOW = new Date("2026-03-10T04:00:00Z");
const TODAY = "2026-03-10";
const later = (minutes) => new Date(NOW.getTime() + minutes * 60_000);

const superAdmin = { kind: "admin", id: 1, role: "super_admin", branchId: null };
const adminA = { kind: "admin", id: 2, role: "branch_admin", branchId: 1 };
const adminB = { kind: "admin", id: 3, role: "branch_admin", branchId: 2 };
const teacher = { kind: "teacher", id: 7, branchId: 1 };
const otherTeacher = { kind: "teacher", id: 8, branchId: 1 };

let repository;
let alerts;
let clock;
let useCases;

beforeEach(() => {
  repository = makeFakeAttendanceRepository({
    branches: [
      { id: 1, nameBn: "বাথুলী শাখা", nameEn: "Bathuli Branch" },
      { id: 2, nameBn: "দুল্যা শাখা", nameEn: "Dulla Branch" },
      { id: 3, nameBn: "দেলদুয়ার শাখা", nameEn: "Delduar Branch" },
    ],
    teachers: [
      { id: 7, firstName: "Nasima", lastName: "Akter", appEnabled: true, appPhone: "01711000001", appPasswordHash: "hash" },
      { id: 9, firstName: "Kamal", lastName: "Hossain", appEnabled: true, appPhone: "01711000002", appPasswordHash: null },
    ],
    classes: [
      { id: 10, name: "Class 5", section: "Good", branchId: 1, teacherId: 7 },
      { id: 20, name: "Class 5", section: "Good", branchId: 2, teacherId: 9 },
      { id: 30, name: "Class 6", section: "Good", branchId: 1, teacherId: null },
    ],
    students: [
      { id: 101, firstName: "Rahim", classId: 10, branchId: 1, roll: "1" },
      { id: 102, firstName: "Karim", classId: 10, branchId: 1, roll: "2" },
      { id: 201, firstName: "Nadia", classId: 20, branchId: 2, roll: "1" },
    ],
  });
  alerts = makeFakeAbsenceAlerts();
  clock = { now: () => NOW };
  useCases = makeAttendanceUseCases({ repository, absenceAlerts: alerts, clock: { now: () => clock.now() } });
});

const wholeDay = (rahim, karim) => [
  { studentId: 101, status: rahim },
  { studentId: 102, status: karim },
];

const expectRejects = async (promise, Type, code) => {
  const error = await promise.then(() => null, (caught) => caught);
  expect(error).toBeInstanceOf(Type);
  expect(error.code).toBe(code);
};

describe("getRoster", () => {
  it("lists the class's students with no status before the day is taken", async () => {
    const roster = await useCases.getRoster({ actor: teacher, classId: 10 });

    expect(roster.date).toBe(TODAY);
    expect(roster.class).toEqual({ id: 10, name: "Class 5", section: "Good", branchId: 1 });
    expect(roster.students.map((s) => [s.studentId, s.status])).toEqual([[101, null], [102, null]]);
    expect(roster.takenBy).toBeNull();
    expect(roster.editable).toBe(true);
  });

  it("shows who took the day and when, after a save", async () => {
    await useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: wholeDay("Present", "Absent") });

    const roster = await useCases.getRoster({ actor: adminA, classId: 10, date: TODAY });

    expect(roster.students.map((s) => s.status)).toEqual(["Present", "Absent"]);
    expect(roster.takenBy).toEqual({ type: "teacher", id: 7, name: "teacher#7", at: NOW });
  });

  it("lets a teacher read an earlier day but not change it", async () => {
    const roster = await useCases.getRoster({ actor: teacher, classId: 10, date: "2026-03-09" });

    expect(roster.editable).toBe(false);
  });

  it("refuses a teacher another teacher's class", async () => {
    clock.now = () => NOW;
    await expectRejects(useCases.getRoster({ actor: otherTeacher, classId: 10 }), ForbiddenError, "attendance_not_your_class");
  });

  it("hides another branch's class", async () => {
    await expectRejects(useCases.getRoster({ actor: adminA, classId: 20 }), NotFoundError, "attendance_class_not_found");
    await expectRejects(useCases.getRoster({ actor: teacher, classId: 20 }), NotFoundError, "attendance_class_not_found");
  });

  it("shows the class's branch and its class teacher, with whether the teacher can use the app", async () => {
    const roster = await useCases.getRoster({ actor: adminA, classId: 10 });

    expect(roster.branch).toEqual({ id: 1, nameBn: "বাথুলী শাখা", nameEn: "Bathuli Branch" });
    expect(roster.classTeacher).toEqual({ id: 7, name: "Nasima Akter", appAccess: true });
  });

  it("says a class teacher without a password cannot use the app", async () => {
    const roster = await useCases.getRoster({ actor: superAdmin, classId: 20 });

    expect(roster.classTeacher).toEqual({ id: 9, name: "Kamal Hossain", appAccess: false });
  });

  it("has no class teacher for a class without one", async () => {
    const roster = await useCases.getRoster({ actor: adminA, classId: 30 });

    expect(roster.classTeacher).toBeNull();
  });

  it("gives a super admin any branch's class", async () => {
    expect((await useCases.getRoster({ actor: superAdmin, classId: 20 })).students).toHaveLength(1);
  });
});

describe("saveDay", () => {
  it("saves the whole class in one go and records who marked it", async () => {
    const day = await useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: wholeDay("Present", "Leave") });

    expect(repository.state.saves).toHaveLength(1);
    expect(repository.state.saves[0]).toMatchObject({ classId: 10, branchId: 1, date: TODAY, marker: { type: "teacher", id: 7 }, takenAt: NOW });
    expect(day.students.map((s) => s.status)).toEqual(["Present", "Leave"]);
    expect(day.kept).toEqual([]);
    expect(day.branch).toEqual({ id: 1, nameBn: "বাথুলী শাখা", nameEn: "Bathuli Branch" });
    expect(day.classTeacher).toEqual({ id: 7, name: "Nasima Akter", appAccess: true });
  });

  it("is harmless to repeat", async () => {
    const save = () => useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: wholeDay("Present", "Absent") });
    await save();
    await save();

    expect(repository.state.records).toHaveLength(2);
  });

  it("keeps an admin's later correction when the phone syncs an older save", async () => {
    const phoneTookAt = "2026-03-10T03:00:00Z"; // 09:00, before the admin's 10:00 correction
    await useCases.saveDay({ actor: adminA, classId: 10, date: TODAY, entries: wholeDay("Present", "Leave") });

    const day = await useCases.saveDay({
      actor: teacher, classId: 10, date: TODAY, takenAt: phoneTookAt, entries: wholeDay("Absent", "Absent"),
    });

    expect(day.students.map((s) => s.status)).toEqual(["Present", "Leave"]);
    expect(day.kept).toEqual([101, 102]);
  });

  it("lets a later save replace an earlier one", async () => {
    await useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: wholeDay("Absent", "Absent") });
    clock.now = () => later(5);

    const day = await useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: wholeDay("Late", "Absent") });

    expect(day.students.map((s) => s.status)).toEqual(["Late", "Absent"]);
  });

  it("tells the absence alerts about today's statuses", async () => {
    await useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: wholeDay("Absent", "Present") });

    expect(alerts.calls).toEqual([
      { branchId: 1, date: TODAY, now: NOW, students: [{ studentId: 101, status: "Absent" }, { studentId: 102, status: "Present" }] },
    ]);
  });

  it("does not alert parents about a corrected earlier day", async () => {
    await useCases.saveDay({ actor: adminA, classId: 10, date: "2026-03-02", entries: wholeDay("Absent", "Present") });

    expect(alerts.calls).toEqual([]);
  });

  it("refuses a whole-day save that leaves a student out", async () => {
    await expectRejects(
      useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: [{ studentId: 101, status: "Present" }] }),
      ValidationError,
      "attendance_entries_incomplete",
    );
    expect(repository.state.saves).toEqual([]);
  });

  it("refuses another branch's student, even in the admin's own class", async () => {
    await expectRejects(
      useCases.saveDay({ actor: adminA, classId: 10, date: TODAY, complete: false, entries: [{ studentId: 201, status: "Present" }] }),
      ValidationError,
      "attendance_student_not_in_class",
    );
  });

  it("refuses a teacher another teacher's class", async () => {
    await expectRejects(
      useCases.saveDay({ actor: otherTeacher, classId: 10, date: TODAY, entries: wholeDay("Present", "Present") }),
      ForbiddenError,
      "attendance_not_your_class",
    );
  });

  it("locks an earlier day for a teacher", async () => {
    await expectRejects(
      useCases.saveDay({ actor: teacher, classId: 10, date: "2026-03-09", entries: wholeDay("Present", "Present") }),
      ForbiddenError,
      "attendance_day_locked",
    );
    expect(repository.state.saves).toEqual([]);
  });

  it("accepts yesterday from a phone that took it yesterday offline", async () => {
    const takenAt = "2026-03-09T04:30:00Z";

    await useCases.saveDay({ actor: teacher, classId: 10, date: "2026-03-09", takenAt, entries: wholeDay("Present", "Absent") });

    expect(repository.state.saves[0].takenAt).toEqual(new Date(takenAt));
  });

  it("accepts an earlier day from a phone only as its first sync, or the same save sent again", async () => {
    const takenAt = "2026-03-09T04:30:00Z";
    const sync = (entries, at = takenAt) => useCases.saveDay({ actor: teacher, classId: 10, date: "2026-03-09", takenAt: at, entries });
    await sync(wholeDay("Present", "Absent"));

    await sync(wholeDay("Present", "Absent")); // the reply was lost: the phone sends it again
    await expectRejects(sync(wholeDay("Absent", "Absent"), "2026-03-09T17:59:00Z"), ForbiddenError, "attendance_day_locked");

    expect(repository.state.records.map((r) => r.status)).toEqual(["Present", "Absent"]);
  });

  it("still accepts an offline day after the class list changed: a new student is left out, one who left is dropped", async () => {
    repository.state.students.push({ id: 103, firstName: "Nadia", classId: 10, branchId: 1, roll: "3" }); // joined after
    const takenAt = "2026-03-09T04:30:00Z";

    await useCases.saveDay({
      actor: teacher, classId: 10, date: "2026-03-09", takenAt,
      entries: [...wholeDay("Present", "Absent"), { studentId: 150, status: "Absent" }], // 150 has left the class
    });

    expect(repository.state.records.map((r) => [r.studentId, r.status])).toEqual([[101, "Present"], [102, "Absent"]]);
  });

  it("refuses an earlier day from a phone once the office has marked it", async () => {
    await useCases.saveDay({ actor: adminA, classId: 10, date: "2026-03-09", entries: wholeDay("Present", "Leave") });

    await expectRejects(
      useCases.saveDay({ actor: teacher, classId: 10, date: "2026-03-09", takenAt: "2026-03-09T04:30:00Z", entries: wholeDay("Absent", "Absent") }),
      ForbiddenError,
      "attendance_day_locked",
    );
  });

  it("lets an admin correct an earlier day but not a day to come", async () => {
    await useCases.saveDay({ actor: adminA, classId: 10, date: "2026-01-05", entries: wholeDay("Present", "Absent") });
    await expectRejects(
      useCases.saveDay({ actor: adminA, classId: 10, date: "2026-03-11", entries: wholeDay("Present", "Absent") }),
      ValidationError,
      "attendance_date_future",
    );
  });
});

describe("markStudent (one cell of the grid)", () => {
  it("files the mark under the student's own class and branch, for a super admin on All branches", async () => {
    const mark = await useCases.markStudent({ actor: superAdmin, studentId: 201, date: "2026-03-09", status: "Absent" });

    expect(repository.state.saves[0]).toMatchObject({ classId: 20, branchId: 2, entries: [{ studentId: 201, status: "Absent" }] });
    expect(mark).toMatchObject({ studentId: 201, date: "2026-03-09", status: "Absent" });
    expect(mark.attendanceId).toEqual(expect.any(Number));
  });

  it("hides another branch's student", async () => {
    await expectRejects(
      useCases.markStudent({ actor: adminA, studentId: 201, date: TODAY, status: "Absent" }),
      NotFoundError,
      "student_not_found",
    );
  });
});

describe("recordMany (the old bulk save)", () => {
  it("saves records of several days, and updates days that already exist", async () => {
    await useCases.markStudent({ actor: adminA, studentId: 101, date: "2026-03-01", status: "Absent" });
    clock.now = () => later(1);

    const saved = await useCases.recordMany({
      actor: adminA,
      records: [
        { studentID: 101, classID: 10, classDate: "2026-03-01", status: "Present" },
        { studentID: 102, classID: 10, classDate: "2026-03-01", status: "Late" },
        { studentID: 101, classID: 10, classDate: "2026-03-02", status: "Leave" },
      ],
    });

    expect(saved).toBe(3);
    expect(repository.state.records.map((r) => [r.studentId, r.date, r.status])).toEqual([
      [101, "2026-03-01", "Present"],
      [102, "2026-03-01", "Late"],
      [101, "2026-03-02", "Leave"],
    ]);
  });

  it("saves nothing when any record is refused", async () => {
    await expectRejects(
      useCases.recordMany({
        actor: adminA,
        records: [
          { studentID: 101, classID: 10, classDate: "2026-03-01", status: "Present" },
          { studentID: 201, classID: 20, classDate: "2026-03-01", status: "Present" },
        ],
      }),
      NotFoundError,
      "attendance_class_not_found",
    );
    expect(repository.state.saves).toEqual([]);
  });

  it("treats the same class written as a number or a string as one day", async () => {
    const saved = await useCases.recordMany({
      actor: adminA,
      records: [
        { studentID: 101, classID: 10, classDate: "2026-03-01", status: "Present" },
        { studentID: "102", classID: "10", classDate: "2026-03-01", status: "Late" },
      ],
    });

    expect(saved).toBe(2);
    expect(repository.state.saves).toHaveLength(1);
  });

  it("refuses an empty list", async () => {
    await expectRejects(useCases.recordMany({ actor: adminA, records: [] }), ValidationError, "attendance_entries_required");
  });
});

describe("updateRecord and removeRecord", () => {
  beforeEach(async () => {
    await useCases.markStudent({ actor: adminA, studentId: 101, date: "2026-03-01", status: "Absent" });
    clock.now = () => later(1);
  });

  const recordId = () => repository.state.records[0].id;

  it("changes the status of a record", async () => {
    await useCases.updateRecord({ actor: adminA, id: recordId(), status: "leave" });

    expect(repository.state.records[0]).toMatchObject({ status: "Leave", markedBy: 2 });
  });

  it("tells the absence alerts when today's record changes or goes", async () => {
    clock.now = () => NOW;
    await useCases.markStudent({ actor: adminA, studentId: 102, date: TODAY, status: "Absent" });
    const today = repository.state.records.find((r) => r.date === TODAY);
    alerts.calls.length = 0;

    await useCases.updateRecord({ actor: adminA, id: today.id, status: "Present" });
    await useCases.removeRecord({ actor: adminA, id: today.id });

    expect(alerts.calls.map((c) => c.students)).toEqual([[{ studentId: 102, status: "Present" }], [{ studentId: 102, status: null }]]);
  });

  it("hides another branch's record", async () => {
    await expectRejects(useCases.updateRecord({ actor: adminB, id: recordId(), status: "Present" }), NotFoundError, "attendance_not_found");
    await expectRejects(useCases.removeRecord({ actor: adminB, id: recordId() }), NotFoundError, "attendance_not_found");
    expect(repository.state.records).toHaveLength(1);
  });

  it("deletes a record", async () => {
    await useCases.removeRecord({ actor: adminA, id: recordId() });

    expect(repository.state.records).toEqual([]);
  });
});

describe("overview", () => {
  const ZERO = { present: 0, absent: 0, late: 0, leave: 0 };
  const branchIds = (overview) => overview.branches.map((b) => b.id);

  it("gives a super admin with no branch picked every branch, by id, even one without classes", async () => {
    const overview = await useCases.overview({ actor: superAdmin, date: TODAY });

    expect(branchIds(overview)).toEqual([1, 2, 3]);
    expect(overview.branches[2]).toEqual({
      id: 3,
      nameBn: "দেলদুয়ার শাখা",
      nameEn: "Delduar Branch",
      totals: { classes: 0, taken: 0, notTaken: 0, students: 0, ...ZERO },
      classes: [],
    });
  });

  it("gives a super admin only the branch they picked", async () => {
    const overview = await useCases.overview({ actor: { ...superAdmin, branchId: 2 }, date: TODAY });

    expect(branchIds(overview)).toEqual([2]);
  });

  it("gives a branch admin only their own branch", async () => {
    const overview = await useCases.overview({ actor: adminB, date: TODAY });

    expect(branchIds(overview)).toEqual([2]);
    expect(overview.branches[0].classes.map((c) => c.id)).toEqual([20]);
  });

  it("counts each class's day and names whoever took it last", async () => {
    await useCases.saveDay({ actor: teacher, classId: 10, date: TODAY, entries: wholeDay("Present", "Absent") });
    clock.now = () => later(5);
    await useCases.markStudent({ actor: adminA, studentId: 102, date: TODAY, status: "Late" });

    const [bathuli] = (await useCases.overview({ actor: adminA, date: TODAY })).branches;

    expect(bathuli.classes).toEqual([
      {
        id: 10,
        name: "Class 5",
        section: "Good",
        students: 2,
        classTeacher: { id: 7, name: "Nasima Akter", appAccess: true },
        taken: true,
        takenBy: { type: "admin", name: "admin#2", at: later(5) },
        counts: { ...ZERO, present: 1, late: 1 },
      },
      { id: 30, name: "Class 6", section: "Good", students: 0, classTeacher: null, taken: false, takenBy: null, counts: ZERO },
    ]);
    expect(bathuli.totals).toEqual({ classes: 2, taken: 1, notTaken: 1, students: 2, ...ZERO, present: 1, late: 1 });
  });

  it("only counts the asked day", async () => {
    await useCases.saveDay({ actor: adminA, classId: 10, date: "2026-03-09", entries: wholeDay("Absent", "Absent") });

    const [bathuli] = (await useCases.overview({ actor: adminA, date: TODAY })).branches;

    expect(bathuli.totals).toMatchObject({ taken: 0, absent: 0 });
  });

  it("reads today when no day is given, and refuses a date that is not a day", async () => {
    expect((await useCases.overview({ actor: adminA })).date).toBe(TODAY);
    await expectRejects(useCases.overview({ actor: adminA, date: "2026-02-30" }), ValidationError, "attendance_date_invalid");
  });
});
