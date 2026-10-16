import { describe, expect, it, jest } from "@jest/globals";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { notice } from "../domain/contentKinds.js";
import { makeContentUseCases } from "./content.usecases.js";

// In-memory stand-in for the MySQL repository.
function fakeRepository(rows = []) {
  const store = new Map(rows.map((row) => [row.id, { ...row }]));
  let nextId = Math.max(0, ...store.keys()) + 1;
  return {
    store,
    async list({ branchId, onlyVisible }) {
      return [...store.values()].filter(
        (row) =>
          (branchId == null || row.branch_id == null || row.branch_id === branchId) && (!onlyVisible || row.visible),
      );
    },
    async find(id) {
      return store.get(id) ?? null;
    },
    async findVisible(id) {
      const row = store.get(id);
      return row?.visible ? row : null;
    },
    async insert(row) {
      const id = nextId++;
      store.set(id, { id, ...row });
      return id;
    },
    async update(id, changes) {
      store.set(id, { ...store.get(id), ...changes });
    },
    async remove(id) {
      store.delete(id);
    },
  };
}

const superOnAll = { role: "super_admin", branchId: null };
const adminA = { role: "branch_admin", branchId: 1 };
const visitorOfA = { role: "public", branchId: 1 };

describe("content use cases", () => {
  it("lists a branch's items plus whole-school items, only shown ones for visitors", async () => {
    const repository = fakeRepository([
      { id: 1, branch_id: 1, visible: true },
      { id: 2, branch_id: null, visible: false },
      { id: 3, branch_id: 2, visible: true },
    ]);
    const content = makeContentUseCases({ kind: notice, repository });

    expect((await content.list({ viewer: adminA })).map((r) => r.id)).toEqual([1, 2]);
    expect((await content.list({ viewer: visitorOfA })).map((r) => r.id)).toEqual([1]);
    expect((await content.list({ viewer: adminA, onlyVisible: true })).map((r) => r.id)).toEqual([1]);
  });

  it("creates in the acting branch, or for the whole school", async () => {
    const repository = fakeRepository();
    const content = makeContentUseCases({ kind: notice, repository });

    const mine = await content.create({ admin: adminA, input: { title: "A", description: "B" } });
    const school = await content.create({ admin: superOnAll, input: { title: "A", description: "B" } });

    expect(repository.store.get(mine).branch_id).toBe(1);
    expect(repository.store.get(school).branch_id).toBeNull();
  });

  it("validates before saving", async () => {
    const repository = fakeRepository();
    const content = makeContentUseCases({ kind: notice, repository });

    await expect(content.create({ admin: adminA, input: {} })).rejects.toBeInstanceOf(ValidationError);
    expect(repository.store.size).toBe(0);
  });

  it("edits only items the admin may manage, and returns the item as it was", async () => {
    const repository = fakeRepository([
      { id: 1, branch_id: 1, Title: "Old" },
      { id: 2, branch_id: null, Title: "School" },
      { id: 3, branch_id: 2, Title: "North" },
    ]);
    const content = makeContentUseCases({ kind: notice, repository });
    const input = { title: "New", description: "D" };

    expect(await content.update({ admin: adminA, id: "1", input })).toMatchObject({ Title: "Old" });
    expect(repository.store.get(1).Title).toBe("New");
    await expect(content.update({ admin: adminA, id: "2", input })).rejects.toBeInstanceOf(ForbiddenError);
    await expect(content.update({ admin: adminA, id: "3", input })).rejects.toEqual(new NotFoundError("notice_not_found"));
    expect([repository.store.get(2).Title, repository.store.get(3).Title]).toEqual(["School", "North"]);
  });

  it("answers not found for a missing or malformed id", async () => {
    const content = makeContentUseCases({ kind: notice, repository: fakeRepository() });

    await expect(content.remove({ admin: superOnAll, id: "9" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(content.remove({ admin: superOnAll, id: "abc" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("shows, hides and deletes for an admin who may manage the item", async () => {
    const repository = fakeRepository([{ id: 1, branch_id: 2, Show: true }]);
    const content = makeContentUseCases({ kind: notice, repository });

    await content.setVisibility({ admin: superOnAll, id: "1", input: { show: false } });
    expect(repository.store.get(1).Show).toBe(false);

    await expect(content.remove({ admin: adminA, id: "1" })).rejects.toBeInstanceOf(NotFoundError);
    expect(await content.remove({ admin: superOnAll, id: "1" })).toMatchObject({ id: 1 });
    expect(repository.store.size).toBe(0);
  });

  it("shapes rows with the kind's present() when it has one", async () => {
    const kind = { ...notice, present: (row) => ({ ...row, shaped: true }) };
    const content = makeContentUseCases({ kind, repository: fakeRepository([{ id: 1, branch_id: null, visible: true }]) });

    expect(await content.list({ viewer: visitorOfA })).toEqual([{ id: 1, branch_id: null, visible: true, shaped: true }]);
  });

  it("gets one shown item for visitors, and hides the rest", async () => {
    const kind = { ...notice, present: (row) => ({ ...row, shaped: true }) };
    const content = makeContentUseCases({
      kind,
      repository: fakeRepository([
        { id: 1, branch_id: 2, visible: true },
        { id: 2, branch_id: null, visible: false },
      ]),
    });

    expect(await content.getVisible({ id: "1" })).toMatchObject({ id: 1, shaped: true });
    await expect(content.getVisible({ id: "2" })).rejects.toThrow(new NotFoundError(notice.notFound));
    await expect(content.getVisible({ id: "abc" })).rejects.toThrow(new NotFoundError(notice.notFound));
  });

  it("tells onRemoved about a deleted item, after the delete", async () => {
    const repository = fakeRepository([{ id: 4, branch_id: 1, visible: true }]);
    const seen = [];
    const content = makeContentUseCases({ kind: notice, repository, onRemoved: async (row) => seen.push([row.id, repository.store.has(4)]) });

    await content.remove({ admin: adminA, id: "4" });

    expect(seen).toEqual([[4, false]]);
  });

  it("still reports a delete as done when the cleanup afterwards fails", async () => {
    const repository = fakeRepository([{ id: 4, branch_id: 1, visible: true }]);
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const content = makeContentUseCases({ kind: notice, repository, onRemoved: async () => Promise.reject(new Error("disk")) });

    await expect(content.remove({ admin: adminA, id: "4" })).resolves.toMatchObject({ id: 4 });
    expect(repository.store.has(4)).toBe(false);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
