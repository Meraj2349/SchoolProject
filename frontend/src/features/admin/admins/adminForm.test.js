import { describe, expect, it } from "vitest";
import { EMPTY_ADMIN, branchesWithoutAdmin, filterAdmins, toAdminPayload, toFormValues, validateAdminForm } from "./adminForm";

const filled = { Username: "Karim", Email: "karim@school.test", Password: "secret123", role: "branch_admin", branch_id: "2" };

describe("validateAdminForm", () => {
  it("accepts a complete new branch admin", () => {
    expect(validateAdminForm(filled, { isNew: true })).toEqual({});
  });

  it("says what is missing on a new admin", () => {
    expect(validateAdminForm(EMPTY_ADMIN, { isNew: true })).toEqual({
      Username: "required",
      Email: "required",
      Password: "required",
      branch_id: "required",
    });
  });

  it("checks the email and password length", () => {
    expect(validateAdminForm({ ...filled, Email: "karim", Password: "short" }, { isNew: true })).toEqual({
      Email: "invalidEmail",
      Password: "passwordTooShort",
    });
  });

  it("does not need a branch for a super admin", () => {
    expect(validateAdminForm({ ...filled, role: "super_admin", branch_id: "" }, { isNew: true })).toEqual({});
  });

  it("lets an edit keep the current password", () => {
    expect(validateAdminForm({ ...filled, Password: "" }, { isNew: false })).toEqual({});
    expect(validateAdminForm({ ...filled, Password: "short" }, { isNew: false })).toEqual({ Password: "passwordTooShort" });
  });
});

describe("toAdminPayload", () => {
  it("sends the branch as a number for a branch admin", () => {
    expect(toAdminPayload({ ...filled, Username: " Karim " })).toEqual({
      Username: "Karim",
      Email: "karim@school.test",
      Password: "secret123",
      role: "branch_admin",
      branch_id: 2,
    });
  });

  it("sends no branch for a super admin and leaves out a blank password", () => {
    expect(toAdminPayload({ ...filled, role: "super_admin", Password: "" })).toEqual({
      Username: "Karim",
      Email: "karim@school.test",
      role: "super_admin",
      branch_id: null,
    });
  });
});

describe("toFormValues", () => {
  it("fills the form from an admin, never with a password", () => {
    expect(toFormValues({ id: 3, username: "Karim", email: "k@s.test", role: "branch_admin", branch_id: 2 })).toEqual({
      Username: "Karim",
      Email: "k@s.test",
      Password: "",
      role: "branch_admin",
      branch_id: "2",
    });
  });
});

const admins = [
  { id: 1, role: "super_admin", branch_id: null },
  { id: 2, role: "branch_admin", branch_id: 1 },
  { id: 3, role: "branch_admin", branch_id: 2 },
];

describe("filterAdmins", () => {
  it("shows everyone, only super admins, or one branch", () => {
    expect(filterAdmins(admins, "").map((a) => a.id)).toEqual([1, 2, 3]);
    expect(filterAdmins(admins, "super").map((a) => a.id)).toEqual([1]);
    expect(filterAdmins(admins, "2").map((a) => a.id)).toEqual([3]);
  });
});

describe("branchesWithoutAdmin", () => {
  it("lists the branches nobody runs", () => {
    const branches = [{ id: 1 }, { id: 2 }, { id: 3, name_en: "South" }];

    expect(branchesWithoutAdmin(admins, branches)).toEqual([{ id: 3, name_en: "South" }]);
  });
});
