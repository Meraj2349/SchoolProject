import { describe, expect, it } from "@jest/globals";
import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeJobApplicationUseCases } from "./jobApplications.usecases.js";

const POSTS = [{ title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1 }];
const open = { id: 3, branch_id: 1, posts: POSTS, accepting: true };
const closed = { id: 4, branch_id: 1, posts: POSTS, accepting: false };
const FORM = { circular_id: "3", post_index: "0", full_name: "Nusrat Jahan", phone: "01712345678", education: "MA", address: "Natiapara" };
const superOnAll = { role: "super_admin", branchId: null };
const adminA = { role: "branch_admin", branchId: 1 };
const adminB = { role: "branch_admin", branchId: 2 };

function setup({ rows = [] } = {}) {
  const store = new Map(rows.map((row) => [row.id, { ...row }]));
  let nextId = 100;
  const events = [];
  const repository = {
    async list({ branchId, circularId, status }) {
      return [...store.values()].filter(
        (r) => (branchId == null || r.branch_id === branchId) && (!circularId || r.circular_id === circularId) && (!status || r.status === status),
      );
    },
    async find(id) {
      return store.get(id) ?? null;
    },
    async insert(row) {
      if ([...store.values()].some((r) => r.circular_id === row.circular_id && r.post_index === row.post_index && r.phone === row.phone)) {
        throw new ConflictError("job_application_duplicate");
      }
      const id = nextId++;
      store.set(id, { id, status: "new", ...row });
      return id;
    },
    async setStatus(id, status) {
      store.set(id, { ...store.get(id), status });
    },
    async remove(id) {
      store.delete(id);
    },
    async countsByCircular({ branchId }) {
      const counts = {};
      for (const r of store.values()) if (branchId == null || r.branch_id === branchId) counts[r.circular_id] = (counts[r.circular_id] ?? 0) + 1;
      return counts;
    },
  };
  const circulars = { find: async (id) => ({ 3: open, 4: closed })[id] ?? null };
  const cvs = {
    keep: async (upload, circularId) => (events.push(["keep", upload.filename, circularId]), upload.filename),
    discard: async (circularId, file) => events.push(["discard", circularId, file]),
    discardUpload: async (upload) => events.push(["discardUpload", upload.filename]),
    pathOf: (circularId, file) => `/private/${circularId}/${file}`,
  };
  return { store, events, useCases: makeJobApplicationUseCases({ repository, circulars, cvs }) };
}

const CV = { filename: "cv-1.pdf", path: "/incoming/cv-1.pdf" };

describe("job application use cases", () => {
  it("files an application to an open circular, with its CV", async () => {
    const { store, events, useCases } = setup();

    const { id } = await useCases.submit({ input: FORM, upload: CV });

    expect(store.get(id)).toMatchObject({ circular_id: 3, branch_id: 1, post_title_en: "Accountant", cv_file: "cv-1.pdf", status: "new" });
    expect(events).toEqual([["keep", "cv-1.pdf", 3]]);
  });

  it("refuses a closed or missing circular, and drops the uploaded CV", async () => {
    const { store, events, useCases } = setup();

    await expect(useCases.submit({ input: { ...FORM, circular_id: "4" }, upload: CV })).rejects.toThrow(new ConflictError("job_circular_closed"));
    await expect(useCases.submit({ input: { ...FORM, circular_id: "9" } })).rejects.toThrow(new NotFoundError("job_circular_not_found"));
    await expect(useCases.submit({ input: { ...FORM, circular_id: "x" } })).rejects.toThrow(new NotFoundError("job_circular_not_found"));
    expect(store.size).toBe(0);
    expect(events).toEqual([["discardUpload", "cv-1.pdf"]]);
  });

  it("refuses a bad form or a second application for the same post, and drops the CV", async () => {
    const { events, useCases } = setup();
    await useCases.submit({ input: FORM });

    await expect(useCases.submit({ input: { ...FORM, phone: "123" }, upload: CV })).rejects.toThrow(new ValidationError("job_application_phone_invalid"));
    await expect(useCases.submit({ input: FORM, upload: { ...CV, filename: "cv-2.pdf" } })).rejects.toThrow(new ConflictError("job_application_duplicate"));
    expect(events).toEqual([["discardUpload", "cv-1.pdf"], ["keep", "cv-2.pdf", 3], ["discard", 3, "cv-2.pdf"]]);
  });

  it("quietly ignores a form a bot filled in (the hidden website field)", async () => {
    const { store, events, useCases } = setup();

    expect(await useCases.submit({ input: { ...FORM, website: "http://spam" }, upload: CV })).toEqual({ id: null });
    expect(store.size).toBe(0);
    expect(events).toEqual([["discardUpload", "cv-1.pdf"]]);
  });

  it("shows each admin only their branch's applications, filtered by circular and status", async () => {
    const { useCases } = setup({
      rows: [
        { id: 1, circular_id: 3, branch_id: 1, status: "new" },
        { id: 2, circular_id: 3, branch_id: 1, status: "hired" },
        { id: 3, circular_id: 5, branch_id: 2, status: "new" },
      ],
    });

    expect((await useCases.list({ admin: adminA })).map((r) => r.id)).toEqual([1, 2]);
    expect((await useCases.list({ admin: superOnAll })).map((r) => r.id)).toEqual([1, 2, 3]);
    expect((await useCases.list({ admin: superOnAll, circularId: "3", status: "hired" })).map((r) => r.id)).toEqual([2]);
    expect((await useCases.list({ admin: adminA, status: "bogus" })).map((r) => r.id)).toEqual([1, 2]);
    expect(await useCases.counts({ admin: adminA })).toEqual({ 3: 2 });
  });

  it("lets only the branch's admins see, change, download or delete an application", async () => {
    const { store, events, useCases } = setup({ rows: [{ id: 1, circular_id: 3, branch_id: 1, status: "new", full_name: "Nusrat Jahan", cv_file: "cv-1.pdf" }] });

    await expect(useCases.get({ admin: adminB, id: "1" })).rejects.toThrow(new NotFoundError("job_application_not_found"));
    await expect(useCases.cv({ admin: adminB, id: "1" })).rejects.toThrow(new NotFoundError("job_application_not_found"));
    await expect(useCases.setStatus({ admin: adminB, id: "1", status: "hired" })).rejects.toThrow(NotFoundError);

    expect(await useCases.cv({ admin: adminA, id: "1" })).toEqual({ path: "/private/3/cv-1.pdf", downloadName: "Nusrat-Jahan-CV.pdf" });
    await useCases.setStatus({ admin: superOnAll, id: "1", status: "shortlisted" });
    expect(store.get(1).status).toBe("shortlisted");
    await expect(useCases.setStatus({ admin: adminA, id: "1", status: "maybe" })).rejects.toThrow(new ValidationError("job_application_invalid_status"));

    await useCases.remove({ admin: adminA, id: "1" });
    expect(store.size).toBe(0);
    expect(events).toEqual([["discard", 3, "cv-1.pdf"]]);
  });

  it("says when an application has no CV", async () => {
    const { useCases } = setup({ rows: [{ id: 1, circular_id: 3, branch_id: 1, full_name: "A", cv_file: null }] });

    await expect(useCases.cv({ admin: adminA, id: "1" })).rejects.toThrow(new NotFoundError("job_application_no_cv"));
  });
});
