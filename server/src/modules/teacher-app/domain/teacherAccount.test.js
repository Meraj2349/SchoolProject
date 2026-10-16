import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { LOCK_MINUTES, accessView, isLocked, lockUntil, parseAppPhone, parsePassword } from "./teacherAccount.js";

const codeOf = (fn) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return error.code;
  }
  return null;
};

describe("teacher app account", () => {
  it("signs in with a Bangladeshi mobile number", () => {
    expect(parseAppPhone("০১৭১১-০০০০০১")).toBe("01711000001");
    expect(codeOf(() => parseAppPhone("12345"))).toBe("teacher_app_phone_invalid");
  });

  it("needs a password of 8 characters or more that bcrypt can hold", () => {
    expect(parsePassword("12345678")).toBe("12345678");
    expect(codeOf(() => parsePassword("1234567"))).toBe("teacher_app_password_short");
    expect(codeOf(() => parsePassword(undefined))).toBe("teacher_app_password_short");
    expect(codeOf(() => parsePassword("অ".repeat(25)))).toBe("teacher_app_password_long"); // 75 bytes
  });

  it("is locked until the lock time has passed", () => {
    const now = new Date("2026-03-10T04:00:00Z");
    expect(lockUntil(now)).toEqual(new Date(now.getTime() + LOCK_MINUTES * 60_000));
    expect(isLocked({ lockedUntil: new Date("2026-03-10T04:00:01Z") }, now)).toBe(true);
    expect(isLocked({ lockedUntil: now }, now)).toBe(false);
    expect(isLocked({ lockedUntil: null }, now)).toBe(false);
  });

  it("shows an admin the access without the password", () => {
    const view = accessView({
      id: 7, firstName: "Nasima", lastName: "Akter", phone: "01711000001", enabled: 1, passwordHash: "$2a$x", lastLoginAt: null, branchId: 1,
    });

    expect(view).toEqual({
      teacherId: 7, firstName: "Nasima", lastName: "Akter", phone: "01711000001", enabled: true, hasPassword: true, lastLoginAt: null, branchId: 1,
    });
  });
});
