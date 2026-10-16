import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from "../../../shared/errors/index.js";
import { fakePasswordHasher, makeFakeTeacherAccountRepository } from "./fakeTeacherAccountRepository.js";
import { makeTeacherAccessUseCases } from "./teacherAccess.usecases.js";
import { makeTeacherAppUseCases } from "./teacherApp.usecases.js";

const NOW = new Date("2026-03-10T04:00:00Z"); // 10:00 in Dhaka
const PHONE = "01711000001";
const adminA = { role: "branch_admin", branchId: 1 };
const adminB = { role: "branch_admin", branchId: 2 };
const superAdmin = { role: "super_admin", branchId: null };

let repository;
let access;
let teacherApp;
let attendance;
let clock;

beforeEach(() => {
  repository = makeFakeTeacherAccountRepository([
    { id: 7, firstName: "Nasima", lastName: "Akter", branchId: 1, classes: [{ id: 10, name: "Class 5", section: "Good" }] },
    { id: 8, firstName: "Kamal", lastName: "Hossain", branchId: 1 },
  ]);
  clock = { now: () => NOW };
  attendance = { getRoster: jest.fn(async () => ({ students: [] })), saveDay: jest.fn(async () => ({ kept: [] })) };
  access = makeTeacherAccessUseCases({ repository, passwordHasher: fakePasswordHasher });
  teacherApp = makeTeacherAppUseCases({
    repository,
    attendance,
    passwordHasher: fakePasswordHasher,
    issueToken: (claims) => `token:${claims.teacherId}:${claims.branchId}:${claims.tokenVersion}`,
    clock: { now: () => clock.now() },
  });
});

const expectRejects = async (promise, Type, code) => {
  const error = await promise.then(() => null, (caught) => caught);
  expect(error).toBeInstanceOf(Type);
  expect(error.code).toBe(code);
};

const enable = (teacherId = 7, input = { phone: PHONE, password: "secret-123", enabled: true }, admin = adminA) =>
  access.setAccess({ admin, teacherId, input });

describe("app access, set by an admin", () => {
  it("turns access on with a mobile number and a hashed password", async () => {
    const view = await enable();

    expect(view).toMatchObject({ teacherId: 7, phone: PHONE, enabled: true, hasPassword: true });
    expect(repository.state.accounts[0].passwordHash).toBe("hash:secret-123");
  });

  it("needs a password the first time access is turned on", async () => {
    await expectRejects(enable(7, { phone: PHONE, enabled: true }), ValidationError, "teacher_app_password_required");
  });

  it("keeps the password when only the switch changes, and signs the teacher out when access goes off", async () => {
    await enable();
    const before = repository.state.accounts[0].tokenVersion;

    const view = await enable(7, { enabled: false });

    expect(view).toMatchObject({ phone: PHONE, enabled: false, hasPassword: true });
    expect(repository.state.accounts[0].tokenVersion).toBe(before + 1);
  });

  it("signs the teacher out everywhere when the password is reset, and unlocks the number", async () => {
    await enable();
    Object.assign(repository.state.accounts[0], { failedLogins: 3, lockedUntil: new Date("2026-03-10T05:00:00Z") });
    const before = repository.state.accounts[0].tokenVersion;

    await enable(7, { phone: PHONE, password: "another-pass", enabled: true });

    expect(repository.state.accounts[0]).toMatchObject({ tokenVersion: before + 1, failedLogins: 0, lockedUntil: null });
  });

  it("refuses a number another teacher signs in with", async () => {
    await enable();
    await expectRejects(enable(8), ConflictError, "teacher_app_phone_taken");
  });

  it("hides another branch's teacher from a branch admin, not from a super admin", async () => {
    await expectRejects(enable(7, undefined, adminB), NotFoundError, "teacher_not_found");
    await expect(enable(7, undefined, superAdmin)).resolves.toMatchObject({ enabled: true });
  });

  it("lists the access of the admin's branch", async () => {
    await enable();

    expect((await access.list({ admin: adminB })).length).toBe(0);
    expect((await access.list({ admin: adminA })).map((a) => [a.teacherId, a.enabled])).toEqual([[7, true], [8, false]]);
  });
});

describe("signing in to the app", () => {
  beforeEach(() => enable());

  it("gives a token carrying the token version, the teacher and their classes", async () => {
    const session = await teacherApp.login({ phone: "০১৭১১০০০০০১", password: "secret-123" });

    expect(session).toEqual({
      token: "token:7:1:1",
      teacher: { id: 7, firstName: "Nasima", lastName: "Akter", phone: PHONE },
      today: "2026-03-10",
      classes: [{ id: 10, name: "Class 5", section: "Good" }],
    });
    expect(repository.state.accounts[0].lastLoginAt).toBe(NOW);
  });

  it("answers a wrong password, an unknown number and access that is off the same way", async () => {
    await enable(8, { phone: "01711000002", password: "secret-123", enabled: false });

    await expectRejects(teacherApp.login({ phone: PHONE, password: "wrong-pass" }), UnauthorizedError, "teacher_app_login_failed");
    await expectRejects(teacherApp.login({ phone: "01999999999", password: "x" }), UnauthorizedError, "teacher_app_login_failed");
    await expectRejects(teacherApp.login({ phone: "nonsense", password: "x" }), UnauthorizedError, "teacher_app_login_failed");
    await expectRejects(
      teacherApp.login({ phone: "01711000002", password: "secret-123" }),
      UnauthorizedError,
      "teacher_app_login_failed",
    );
  });

  it("locks the number for 15 minutes on the fifth wrong password in a row", async () => {
    for (let i = 0; i < 4; i += 1) {
      await expectRejects(teacherApp.login({ phone: PHONE, password: "wrong-pass" }), UnauthorizedError, "teacher_app_login_failed");
    }
    await expectRejects(teacherApp.login({ phone: PHONE, password: "wrong-pass" }), TooManyRequestsError, "teacher_app_locked");
    await expectRejects(teacherApp.login({ phone: PHONE, password: "secret-123" }), TooManyRequestsError, "teacher_app_locked");

    clock.now = () => new Date(NOW.getTime() + 15 * 60_000);
    await expect(teacherApp.login({ phone: PHONE, password: "secret-123" })).resolves.toMatchObject({ teacher: { id: 7 } });
  });

  it("forgets earlier wrong passwords after a good sign-in", async () => {
    for (let i = 0; i < 4; i += 1) await teacherApp.login({ phone: PHONE, password: "wrong-pass" }).catch(() => {});
    await teacherApp.login({ phone: PHONE, password: "secret-123" });

    await expectRejects(teacherApp.login({ phone: PHONE, password: "wrong-pass" }), UnauthorizedError, "teacher_app_login_failed");
  });
});

describe("a signed-in teacher", () => {
  beforeEach(() => enable());

  it("is accepted while access is on and the token version matches", async () => {
    expect(await teacherApp.authenticate({ teacherId: 7, tokenVersion: 1 })).toEqual({
      id: 7, branchId: 1, firstName: "Nasima", lastName: "Akter", phone: PHONE,
    });
    expect(await teacherApp.authenticate({ teacherId: 7, tokenVersion: 0 })).toBeNull();
    expect(await teacherApp.authenticate({ teacherId: 99, tokenVersion: 0 })).toBeNull();

    await enable(7, { enabled: false });
    expect(await teacherApp.authenticate({ teacherId: 7, tokenVersion: 2 })).toBeNull();
  });

  it("changes the password and gets a new token, signing out the old ones", async () => {
    const teacher = await teacherApp.authenticate({ teacherId: 7, tokenVersion: 1 });

    const { token } = await teacherApp.changePassword({ teacher, current: "secret-123", next: "brand-new-pass" });

    expect(token).toBe("token:7:1:2");
    expect(repository.state.accounts[0].passwordHash).toBe("hash:brand-new-pass");
  });

  it("refuses a password change with the wrong current password", async () => {
    const teacher = await teacherApp.authenticate({ teacherId: 7, tokenVersion: 1 });

    await expectRejects(
      teacherApp.changePassword({ teacher, current: "nope-nope", next: "brand-new-pass" }),
      ValidationError,
      "teacher_app_password_wrong",
    );
  });

  it("takes attendance as the class teacher", async () => {
    const teacher = await teacherApp.authenticate({ teacherId: 7, tokenVersion: 1 });

    await teacherApp.roster({ teacher, classId: "10", date: "2026-03-10" });
    await teacherApp.saveDay({ teacher, classId: "10", date: "2026-03-10", entries: [], takenAt: "2026-03-10T03:00:00Z" });

    const actor = { kind: "teacher", id: 7, branchId: 1 };
    expect(attendance.getRoster).toHaveBeenCalledWith({ actor, classId: "10", date: "2026-03-10" });
    expect(attendance.saveDay).toHaveBeenCalledWith({ actor, classId: "10", date: "2026-03-10", entries: [], takenAt: "2026-03-10T03:00:00Z" });
  });
});
