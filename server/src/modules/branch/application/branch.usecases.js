import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { toBranchUpdate, toNewBranch } from "../domain/branch.entity.js";

const IMAGE_FOLDER = "school/branches";

/**
 * Branch use cases. Dependencies are injected so tests can pass fakes.
 *
 * @param {object} deps
 * @param {{findAll, findById, create, update, remove, stats, usage}} deps.branchRepository
 * @param {{upload(path, folder): Promise<{url, publicId}>, remove(publicId)}} deps.imageStorage
 * @param {(args: {branchId, input: {year, month}}) => Promise<{billed, collected}>} [deps.feeSummary]
 *   the fee module's monthly summary, for the super admin's overview
 * @param {() => string} [deps.today] "YYYY-MM-DD" in the school's time zone
 */
export function makeBranchUseCases({ branchRepository, imageStorage, feeSummary, today }) {
  async function findOrFail(id) {
    const branch = await branchRepository.findById(id);
    if (!branch) throw new NotFoundError("branch_not_found");
    return branch;
  }

  async function uploadImage(image) {
    if (!image) return { image_url: null, image_public_id: null };
    const { url, publicId } = await imageStorage.upload(image.path, IMAGE_FOLDER);
    return { image_url: url, image_public_id: publicId };
  }

  return {
    listBranches: () => branchRepository.findAll(),

    getBranch: findOrFail,

    getBranchStats: () => branchRepository.stats(),

    async createBranch({ input, image = null }) {
      const branch = toNewBranch(input);
      const imageFields = await uploadImage(image);
      const { image_public_id, ...created } = await branchRepository.create({
        ...branch,
        ...imageFields,
      });
      return created;
    },

    async updateBranch({ id, input, image = null }) {
      const existing = await findOrFail(id);
      const changes = toBranchUpdate(input);

      if (image) {
        if (existing.image_public_id) await imageStorage.remove(existing.image_public_id);
        Object.assign(changes, await uploadImage(image));
      }

      if (Object.keys(changes).length === 0) {
        throw new ValidationError("branch_no_fields");
      }

      await branchRepository.update(id, changes);
    },

    /**
     * Deletes an empty branch. A branch that still has students, staff,
     * admins or fee records is refused with the counts, so nothing is lost.
     * The photo is removed only after the database delete succeeded.
     */
    async deleteBranch(id) {
      const existing = await findOrFail(id);
      const usage = await branchRepository.usage(existing.id);
      if (Object.values(usage).some((count) => count > 0)) {
        throw new ConflictError("branch_in_use", "branch_in_use", { details: usage });
      }
      await branchRepository.remove(existing.id);
      if (existing.image_public_id) await imageStorage.remove(existing.image_public_id);
      return existing;
    },

    /** Each branch's counts plus this month's fees billed and collected (super admins). */
    async getBranchOverview() {
      const [year, month] = today().split("-").map(Number);
      const branches = await branchRepository.stats();
      return Promise.all(
        branches.map(async (branch) => {
          const fees = await feeSummary({ branchId: branch.id, input: { year, month } });
          return { ...branch, feesBilled: fees.billed, feesCollected: fees.collected };
        }),
      );
    },
  };
}
