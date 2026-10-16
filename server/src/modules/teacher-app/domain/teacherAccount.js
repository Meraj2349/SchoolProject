import { normalizeBdMobile } from "../../../shared/bdMobile.js";
import { ValidationError } from "../../../shared/errors/index.js";

// A teacher's sign-in for the attendance app: a mobile number and a password
// an admin sets, switched on per teacher.

export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72; // bcrypt ignores anything after 72 bytes

/** Wrong passwords in a row before the number is locked, and for how long. */
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

export function parseAppPhone(value) {
  const phone = normalizeBdMobile(value);
  if (!phone) throw new ValidationError("teacher_app_phone_invalid");
  return phone;
}

export function parsePassword(value) {
  const password = typeof value === "string" ? value : "";
  if ([...password].length < PASSWORD_MIN_LENGTH) throw new ValidationError("teacher_app_password_short");
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) throw new ValidationError("teacher_app_password_long");
  return password;
}

export const lockUntil = (now) => new Date(now.getTime() + LOCK_MINUTES * 60_000);

/** What an admin sees of a teacher's app access. */
export const accessView = (account) => ({
  teacherId: account.id,
  firstName: account.firstName,
  lastName: account.lastName,
  phone: account.phone ?? null,
  enabled: Boolean(account.enabled),
  hasPassword: Boolean(account.passwordHash),
  lastLoginAt: account.lastLoginAt ?? null,
  branchId: account.branchId,
});
