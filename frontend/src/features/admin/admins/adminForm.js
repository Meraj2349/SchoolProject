// Pure rules for the Admins page: form values, validation, filters.
// The server checks the same rules; these give instant feedback.

export const ROLES = ["branch_admin", "super_admin"];
export const PASSWORD_MIN = 8;
export const SUPER_ADMINS = "super"; // branch filter value for "super admins only"

export const EMPTY_ADMIN = { Username: "", Email: "", Password: "", role: "branch_admin", branch_id: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value) => String(value ?? "").trim();

/** Field errors as { field: "required" | "invalidEmail" | "passwordTooShort" }; empty when valid. */
export function validateAdminForm(form, { isNew }) {
  const errors = {};
  if (!text(form.Username)) errors.Username = "required";

  const email = text(form.Email);
  if (!email) errors.Email = "required";
  else if (!EMAIL_PATTERN.test(email)) errors.Email = "invalidEmail";

  // A blank password on an edit keeps the current one.
  if (!form.Password) {
    if (isNew) errors.Password = "required";
  } else if (form.Password.length < PASSWORD_MIN) {
    errors.Password = "passwordTooShort";
  }

  if (form.role === "branch_admin" && !form.branch_id) errors.branch_id = "required";
  return errors;
}

/** The request body for creating or updating an admin. */
export function toAdminPayload(form) {
  const isSuper = form.role === "super_admin";
  return {
    Username: text(form.Username),
    Email: text(form.Email),
    ...(form.Password && { Password: form.Password }),
    role: form.role,
    branch_id: isSuper ? null : Number(form.branch_id),
  };
}

/** Form values for editing an admin. The password always starts blank. */
export const toFormValues = (admin) => ({
  Username: admin.username ?? "",
  Email: admin.email ?? "",
  Password: "",
  role: admin.role,
  branch_id: admin.branch_id == null ? "" : String(admin.branch_id),
});

/** Admins for the branch filter: "" = everyone, "super" = super admins, else a branch id. */
export function filterAdmins(admins, branchFilter) {
  if (!branchFilter) return admins;
  if (branchFilter === SUPER_ADMINS) return admins.filter((a) => a.role === "super_admin");
  return admins.filter((a) => a.branch_id === Number(branchFilter));
}

/** Branches that no branch admin runs yet. */
export function branchesWithoutAdmin(admins, branches) {
  const run = new Set(admins.filter((a) => a.role === "branch_admin").map((a) => a.branch_id));
  return branches.filter((b) => !run.has(b.id));
}
