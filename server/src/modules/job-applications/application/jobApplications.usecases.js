import path from "path";
import { canManage } from "../../../shared/branchScope.js";
import { ConflictError, NotFoundError } from "../../../shared/errors/index.js";
import { STATUSES, toNewJobApplication, toStatus } from "../domain/jobApplication.js";

/**
 * Online applications to job circulars. Visitors apply to an open circular;
 * a branch admin handles their branch's applications, the super admin all.
 * `admin` is { role, branchId } from authMiddleware.
 *
 * Ports:
 * - repository: list({ branchId, circularId, status }), find(id), insert(row) → id
 *   (ConflictError "job_application_duplicate" for the same phone and post),
 *   setStatus(id, status), remove(id), countsByCircular({ branchId })
 * - circulars: find(id) → { id, branch_id, posts, accepting } of a published circular, or null
 * - cvs: keep(upload, circularId) → file, discard(circularId, file), discardUpload(upload), pathOf(circularId, file)
 */
export function makeJobApplicationUseCases({ repository, circulars, cvs }) {
  const positive = (raw) => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  };

  async function handled(admin, rawId) {
    const id = positive(rawId);
    const row = id ? await repository.find(id) : null;
    if (!row || !canManage(admin, row.branch_id)) throw new NotFoundError("job_application_not_found");
    return { id, row };
  }

  return {
    /**
     * `upload` is multer's file for the CV, if any. Until it is filed under its
     * circular it is dropped on any refusal; once filed, a failed save removes it.
     */
    async submit({ input, upload = null }) {
      let cv_file = null;
      let circularId = null;
      try {
        // A filled-in hidden field means a bot: say nothing, keep nothing.
        if (typeof input.website === "string" && input.website.trim()) {
          if (upload) await cvs.discardUpload(upload);
          return { id: null };
        }
        circularId = positive(input.circular_id);
        const circular = circularId ? await circulars.find(circularId) : null;
        if (!circular) throw new NotFoundError("job_circular_not_found");
        if (!circular.accepting) throw new ConflictError("job_circular_closed");
        const row = toNewJobApplication(input, circular);

        if (upload) cv_file = await cvs.keep(upload, circular.id);
        return { id: await repository.insert({ ...row, cv_file }) };
      } catch (error) {
        if (cv_file) await cvs.discard(circularId, cv_file);
        else if (upload) await cvs.discardUpload(upload);
        throw error;
      }
    },

    list: ({ admin, circularId, status }) =>
      repository.list({
        branchId: admin.branchId ?? null,
        circularId: positive(circularId),
        status: STATUSES.includes(status) ? status : null,
      }),

    /** { [circularId]: number of applications } for the admin's branch. */
    counts: ({ admin }) => repository.countsByCircular({ branchId: admin.branchId ?? null }),

    get: async ({ admin, id }) => (await handled(admin, id)).row,

    /** Where the CV is on disk, and a file name for the download. */
    async cv({ admin, id }) {
      const { row } = await handled(admin, id);
      const location = row.cv_file ? cvs.pathOf(row.circular_id, row.cv_file) : null;
      if (!location) throw new NotFoundError("job_application_no_cv");
      const name = String(row.full_name).trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "applicant";
      return { path: location, downloadName: `${name}-CV${path.extname(row.cv_file).toLowerCase()}` };
    },

    async setStatus({ admin, id, status }) {
      const newStatus = toStatus(status);
      const { id: applicationId } = await handled(admin, id);
      await repository.setStatus(applicationId, newStatus);
      return { id: applicationId, status: newStatus };
    },

    async remove({ admin, id }) {
      const { id: applicationId, row } = await handled(admin, id);
      await repository.remove(applicationId);
      if (row.cv_file) await cvs.discard(row.circular_id, row.cv_file);
    },
  };
}
