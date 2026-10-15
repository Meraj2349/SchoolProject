import { ValidationError } from "../../../shared/errors/index.js";

// Admin accounts. A super admin runs every branch; a branch admin runs one.

export const ROLES = ["super_admin", "branch_admin"];

const USERNAME_MAX = 50; // Admin.Username VARCHAR(50)
const EMAIL_MAX = 100; // Admin.Email VARCHAR(100)
const PASSWORD_MIN = 8; // same rule as changing your own password
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function username(value) {
  const name = String(value ?? "").trim();
  if (!name) throw new ValidationError("admin_username_required");
  if (name.length > USERNAME_MAX) throw new ValidationError("admin_username_too_long");
  return name;
}

function email(value) {
  const address = String(value ?? "").trim().toLowerCase();
  if (address.length > EMAIL_MAX || !EMAIL_PATTERN.test(address)) {
    throw new ValidationError("admin_email_invalid");
  }
  return address;
}

function password(value) {
  const secret = String(value ?? "");
  if (secret.length < PASSWORD_MIN) throw new ValidationError("admin_password_too_short");
  return secret;
}

function role(value) {
  if (value == null || value === "") return "branch_admin";
  if (!ROLES.includes(value)) throw new ValidationError("admin_role_invalid");
  return value;
}

// A branch admin must belong to a branch; a super admin never does.
function branchFor(adminRole, value) {
  if (adminRole === "super_admin") return null;
  const id = Number(value);
  if (value === "" || value == null || !Number.isInteger(id) || id <= 0) {
    throw new ValidationError("admin_branch_required");
  }
  return id;
}

const sent = (value) => value !== undefined;

/** A new admin from request input. Throws ValidationError with an i18n code. */
export function toNewAdmin(input) {
  const adminRole = role(input.role);
  return {
    username: username(input.Username),
    email: email(input.Email),
    password: password(input.Password),
    role: adminRole,
    branchId: branchFor(adminRole, input.branch_id),
  };
}

/**
 * The admin after applying the fields that were sent. A blank password keeps
 * the current one. `existing` is { username, email, role, branchId }.
 */
export function toAdminChanges(input, existing) {
  const adminRole = sent(input.role) ? role(input.role) : existing.role;
  const branchInput = sent(input.branch_id) ? input.branch_id : existing.branchId;
  const changes = {
    username: sent(input.Username) ? username(input.Username) : existing.username,
    email: sent(input.Email) ? email(input.Email) : existing.email,
    role: adminRole,
    branchId: branchFor(adminRole, branchInput),
  };
  if (input.Password) changes.password = password(input.Password);
  return changes;
}
