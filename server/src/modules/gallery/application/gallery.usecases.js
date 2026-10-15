import { assertCanManage, canManage, canSee, newRowBranch } from "../../../shared/branchScope.js";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { personOf, toImageChanges, toNewImage } from "../domain/galleryImage.js";

/**
 * Gallery images belong to a branch or the whole school (branch_id null). A
 * student's or teacher's portrait always belongs to that person's branch.
 * `viewer`/`admin` is { role, branchId } from authMiddleware/optionalAuth.
 *
 * Ports:
 * - repository: list({ branchId, type, studentId, teacherId }), find(id), insert(row) → id, update(id, changes), remove(id)
 * - imageStorage: upload(path, folder) → { url, publicId }, remove(publicId)
 * - people: branchOf("student" | "teacher", id) → branch id, or null if there is no such person
 */
export function makeGalleryUseCases({ repository, imageStorage, people }) {
  const folderOf = (type) => `school/${type}s`;

  // A portrait goes to its person's branch, which must be one the admin manages.
  async function branchFor(admin, image, otherwise) {
    const person = personOf(image);
    if (!person) return otherwise;
    const branchId = await people.branchOf(person.kind, person.id);
    if (branchId == null) throw new ValidationError(`${person.kind}_not_found`);
    if (!canManage(admin, branchId)) throw new ValidationError("branch_mismatch");
    return branchId;
  }

  async function find(rawId) {
    const id = Number(rawId);
    const row = Number.isInteger(id) && id > 0 ? await repository.find(id) : null;
    if (!row) throw new NotFoundError("image_not_found");
    return { id, row };
  }

  async function manageable(admin, rawId) {
    const image = await find(rawId);
    assertCanManage(admin, image.row.branch_id, "image_not_found");
    return image;
  }

  const requireFile = (file) => {
    if (!file) throw new ValidationError("no_file_uploaded");
  };

  return {
    /** `filter`: { type ("all" = any), studentId, teacherId }. */
    list: ({ viewer, filter = {} }) => repository.list({ branchId: viewer.branchId ?? null, ...filter }),

    async get({ viewer, id }) {
      const { row } = await find(id);
      if (!canSee(viewer.branchId ?? null, row.branch_id)) throw new NotFoundError("image_not_found");
      return row;
    },

    async upload({ admin, input, file }) {
      requireFile(file);
      const image = toNewImage(input);
      const branch_id = await branchFor(admin, image, newRowBranch(admin));
      const stored = await imageStorage.upload(file.path, folderOf(image.ImageType));
      let id;
      try {
        id = await repository.insert({ ...image, ImagePath: stored.url, PublicID: stored.publicId, branch_id });
      } catch (error) {
        await imageStorage.remove(stored.publicId).catch(() => {});
        throw error;
      }
      return repository.find(id);
    },

    async update({ admin, id, input }) {
      const image = await manageable(admin, id);
      const changes = toImageChanges(input, image.row);
      const branch_id = await branchFor(admin, { ...image.row, ...changes }, image.row.branch_id);
      await repository.update(image.id, { ...changes, branch_id });
      return repository.find(image.id);
    },

    /** Points the image at a new file, then removes the old file from storage. */
    async replaceFile({ admin, id, file }) {
      requireFile(file);
      const image = await manageable(admin, id);
      const stored = await imageStorage.upload(file.path, folderOf(image.row.ImageType));
      await repository.update(image.id, { ImagePath: stored.url, PublicID: stored.publicId });
      await imageStorage.remove(image.row.PublicID);
      return repository.find(image.id);
    },

    /** Deletes the record first, so a failed delete never loses the file. */
    async remove({ admin, id }) {
      const image = await manageable(admin, id);
      await repository.remove(image.id);
      await imageStorage.remove(image.row.PublicID);
    },
  };
}
