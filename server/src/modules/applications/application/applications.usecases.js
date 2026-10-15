import { canManage } from "../../../shared/branchScope.js";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { studentOf, toNewApplication, toStatus } from "../domain/application.js";

/**
 * Admission applications. A branch admin sees and handles only their branch's
 * applications; the super admin handles all of them.
 * `admin` is { role, branchId } from authMiddleware.
 *
 * Ports:
 * - repository: branchExists(id), list({ branchId }), find(id), insert(row) → id,
 *   setStatus(id, status), linkStudent(id, studentId, branchId), remove(id)
 * - enrolment: enrol(student, branchId) → the new student's id (student: see studentOf)
 */
export function makeApplicationUseCases({ repository, enrolment }) {
  // Old applications have no branch (null): only the super admin handles them.
  async function handled(admin, rawId) {
    const id = Number(rawId);
    const row = Number.isInteger(id) && id > 0 ? await repository.find(id) : null;
    if (!row || !canManage(admin, row.branch_id)) throw new NotFoundError("application_not_found");
    return { id, row };
  }

  return {
    async submit({ input }) {
      const application = toNewApplication(input);
      if (!(await repository.branchExists(application.branch_id))) {
        throw new ValidationError("application_branch_required");
      }
      return { id: await repository.insert(application) };
    },

    list: ({ admin }) => repository.list({ branchId: admin.branchId ?? null }),

    get: async ({ admin, id }) => (await handled(admin, id)).row,

    /** Accepting enrols the child once, in the application's branch. */
    async setStatus({ admin, id, status }) {
      const newStatus = toStatus(status);
      const { id: applicationId, row } = await handled(admin, id);
      const enrolling = newStatus === "accepted" && row.student_id == null;
      const branchId = row.branch_id ?? admin.branchId ?? null;
      if (enrolling && branchId == null) throw new ValidationError("branch_required");

      await repository.setStatus(applicationId, newStatus);
      if (enrolling) {
        const studentId = await enrolment.enrol(studentOf(row), branchId);
        await repository.linkStudent(applicationId, studentId, branchId);
      }
      return { id: applicationId, status: newStatus };
    },

    async remove({ admin, id }) {
      const { id: applicationId } = await handled(admin, id);
      await repository.remove(applicationId);
    },
  };
}
