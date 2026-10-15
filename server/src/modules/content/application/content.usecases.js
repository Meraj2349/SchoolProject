import { assertCanManage, newRowBranch } from "../../../shared/branchScope.js";
import { NotFoundError } from "../../../shared/errors/index.js";

/**
 * Use cases for one kind of website content (see domain/contentKinds.js).
 * Items belong to a branch, or to the whole school (branch_id null).
 * `viewer`/`admin` is { role, branchId } from authMiddleware/optionalAuth.
 *
 * Repository port: list({ branchId, onlyVisible }), find(id), insert(row) → id,
 * update(id, changes), remove(id).
 */
export function makeContentUseCases({ kind, repository }) {
  async function manageable(admin, rawId) {
    const id = Number(rawId);
    const row = Number.isInteger(id) && id > 0 ? await repository.find(id) : null;
    if (!row) throw new NotFoundError(kind.notFound);
    assertCanManage(admin, row.branch_id, kind.notFound);
    return { id, row };
  }

  return {
    /** The viewer's branch plus whole-school items (all items with no branch). Visitors see only shown items. */
    list: ({ viewer, onlyVisible = false }) =>
      repository.list({ branchId: viewer.branchId ?? null, onlyVisible: onlyVisible || viewer.role === "public" }),

    /** Returns the new item's id. */
    create: async ({ admin, input }) => repository.insert({ ...kind.toNew(input), branch_id: newRowBranch(admin) }),

    /** Returns the item as it was before the change. The item keeps its branch. */
    async update({ admin, id, input }) {
      const item = await manageable(admin, id);
      await repository.update(item.id, kind.toChanges(input, item.row));
      return item.row;
    },

    async setVisibility({ admin, id, input }) {
      const item = await manageable(admin, id);
      await repository.update(item.id, kind.toVisibility(input));
    },

    /** Returns the deleted item. */
    async remove({ admin, id }) {
      const item = await manageable(admin, id);
      await repository.remove(item.id);
      return item.row;
    },
  };
}
