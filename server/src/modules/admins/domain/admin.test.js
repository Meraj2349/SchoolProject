import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { toAdminChanges, toNewAdmin } from "./admin.js";

const valid = {
  Username: "  rahim  ",
  Email: " Rahim@School.TEST ",
  Password: "secret123",
  role: "branch_admin",
  branch_id: "2",
};

const codeOf = (fn) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return error.code;
  }
  throw new Error("expected a ValidationError");
};

describe("toNewAdmin", () => {
  it("cleans up a valid branch admin", () => {
    expect(toNewAdmin(valid)).toEqual({
      username: "rahim",
      email: "rahim@school.test",
      password: "secret123",
      role: "branch_admin",
      branchId: 2,
    });
  });

  it("gives a super admin no branch", () => {
    expect(toNewAdmin({ ...valid, role: "super_admin" })).toMatchObject({ role: "super_admin", branchId: null });
  });

  it("treats a missing role as a branch admin", () => {
    expect(toNewAdmin({ ...valid, role: undefined }).role).toBe("branch_admin");
  });

  it.each([
    [{ Username: " " }, "admin_username_required"],
    [{ Username: "x".repeat(51) }, "admin_username_too_long"],
    [{ Email: "" }, "admin_email_invalid"],
    [{ Email: "not-an-email" }, "admin_email_invalid"],
    [{ Email: `${"x".repeat(96)}@a.bd` }, "admin_email_invalid"],
    [{ Password: "" }, "admin_password_too_short"],
    [{ Password: "short12" }, "admin_password_too_short"],
    [{ role: "owner" }, "admin_role_invalid"],
    [{ branch_id: "" }, "admin_branch_required"],
    [{ branch_id: "abc" }, "admin_branch_required"],
    [{ branch_id: 0 }, "admin_branch_required"],
  ])("rejects %j with %s", (change, code) => {
    expect(codeOf(() => toNewAdmin({ ...valid, ...change }))).toBe(code);
  });
});

describe("toAdminChanges", () => {
  const existing = { username: "rahim", email: "rahim@school.test", role: "branch_admin", branchId: 2 };

  it("keeps what was not sent and leaves the password alone when blank", () => {
    expect(toAdminChanges({ Email: "new@school.test", Password: "" }, existing)).toEqual({
      username: "rahim",
      email: "new@school.test",
      role: "branch_admin",
      branchId: 2,
    });
  });

  it("includes a new password", () => {
    expect(toAdminChanges({ Password: "newsecret1" }, existing).password).toBe("newsecret1");
  });

  it("moves an admin to another branch", () => {
    expect(toAdminChanges({ branch_id: 3 }, existing).branchId).toBe(3);
  });

  it("drops the branch when promoting to super admin", () => {
    expect(toAdminChanges({ role: "super_admin" }, existing)).toMatchObject({ role: "super_admin", branchId: null });
  });

  it("needs a branch when demoting a super admin", () => {
    const boss = { ...existing, role: "super_admin", branchId: null };

    expect(codeOf(() => toAdminChanges({ role: "branch_admin" }, boss))).toBe("admin_branch_required");
    expect(toAdminChanges({ role: "branch_admin", branch_id: 1 }, boss)).toMatchObject({ branchId: 1 });
  });

  it("validates the fields it changes", () => {
    expect(codeOf(() => toAdminChanges({ Password: "short" }, existing))).toBe("admin_password_too_short");
    expect(codeOf(() => toAdminChanges({ Email: "bad" }, existing))).toBe("admin_email_invalid");
    expect(codeOf(() => toAdminChanges({ Username: "" }, existing))).toBe("admin_username_required");
  });
});
