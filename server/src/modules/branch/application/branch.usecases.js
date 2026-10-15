import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { toBranchUpdate, toNewBranch } from "../domain/branch.entity.js";

const IMAGE_FOLDER = "school/branches";

/**
 * Branch use cases. Dependencies are injected so tests can pass fakes.
 *
 * @param {object} deps
 * @param {{findAll, findById, create, update, remove, stats}} deps.branchRepository
 * @param {{upload(path, folder): Promise<{url, publicId}>, remove(publicId)}} deps.imageStorage
 */
export function makeBranchUseCases({ branchRepository, imageStorage }) {
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

    async deleteBranch(id) {
      const existing = await findOrFail(id);
      if (existing.image_public_id) await imageStorage.remove(existing.image_public_id);
      await branchRepository.remove(id);
      return existing;
    },
  };
}
