import { describe, expect, it } from "@jest/globals";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeApplicationUseCases } from "./applications.usecases.js";

function fakeRepository(rows = []) {
  const store = new Map(rows.map((row) => [row.id, { status: "pending", student_id: null, ...row }]));
  return {
    store,
    branchExists: async (id) => [1, 2].includes(id),
    list: async ({ branchId }) => [...store.values()].filter((r) => branchId == null || r.branch_id === branchId),
    find: async (id) => store.get(id) ?? null,
    async insert(row) {
      const id = store.size + 1;
      store.set(id, { id, status: "pending", student_id: null, ...row });
      return id;
    },
    setStatus: async (id, status) => Object.assign(store.get(id), { status }),
    linkStudent: async (id, studentId, branchId) => Object.assign(store.get(id), { student_id: studentId, branch_id: branchId }),
    remove: async (id) => store.delete(id),
  };
}

function fakeEnrolment() {
  const enrolled = [];
  return { enrolled, enrol: async (student, branchId) => enrolled.push({ name: `${student.FirstName} ${student.LastName}`, branchId }) + 100 };
}

const FORM = {
  applicant_name: "Nusrat Jahan",
  date_of_birth: "2016-03-03",
  gender: "female",
  applying_for_class: "Class 3",
  parent_name: "Jahan",
  parent_contact: "01700000000",
};
const superOnAll = { role: "super_admin", branchId: null };
const adminA = { role: "branch_admin", branchId: 1 };

function setup(rows) {
  const repository = fakeRepository(rows);
  const enrolment = fakeEnrolment();
  return { repository, enrolment, applications: makeApplicationUseCases({ repository, enrolment }) };
}

describe("application use cases", () => {
  it("files an application under an existing branch only", async () => {
    const { applications, repository } = setup();

    expect(await applications.submit({ input: { ...FORM, branch_id: 2 } })).toEqual({ id: 1 });
    await expect(applications.submit({ input: { ...FORM, branch_id: 9 } })).rejects.toEqual(
      new ValidationError("application_branch_required"),
    );
    expect(repository.store.size).toBe(1);
  });

  it("lists the admin's branch, or every branch for a super admin on All", async () => {
    const { applications } = setup([{ id: 1, branch_id: 1 }, { id: 2, branch_id: 2 }, { id: 3, branch_id: null }]);

    expect((await applications.list({ admin: adminA })).map((a) => a.id)).toEqual([1]);
    expect(await applications.list({ admin: superOnAll })).toHaveLength(3);
  });

  it("hides other branches' and unassigned applications from a branch admin", async () => {
    const { applications } = setup([{ id: 2, branch_id: 2 }, { id: 3, branch_id: null }]);

    await expect(applications.get({ admin: adminA, id: "2" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(applications.remove({ admin: adminA, id: "3" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(applications.get({ admin: adminA, id: "x" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("enrols an accepted child once, in the application's branch", async () => {
    const { applications, repository, enrolment } = setup([{ id: 1, ...FORM, branch_id: 2 }]);

    await applications.setStatus({ admin: superOnAll, id: "1", status: "accepted" });
    await applications.setStatus({ admin: superOnAll, id: "1", status: "reviewed" });
    await applications.setStatus({ admin: superOnAll, id: "1", status: "accepted" });

    expect(enrolment.enrolled).toEqual([{ name: "Nusrat Jahan", branchId: 2 }]);
    expect(repository.store.get(1)).toMatchObject({ status: "accepted", student_id: 101 });
  });

  it("needs a chosen branch to accept an old application without one, and files it there", async () => {
    const { applications, repository, enrolment } = setup([{ id: 1, ...FORM, branch_id: null }]);

    await expect(applications.setStatus({ admin: superOnAll, id: "1", status: "accepted" })).rejects.toEqual(
      new ValidationError("branch_required"),
    );
    expect(repository.store.get(1).status).toBe("pending");

    await applications.setStatus({ admin: { role: "super_admin", branchId: 2 }, id: "1", status: "accepted" });
    expect(enrolment.enrolled).toEqual([{ name: "Nusrat Jahan", branchId: 2 }]);
    expect(repository.store.get(1).branch_id).toBe(2);
  });

  it("checks the status before changing anything", async () => {
    const { applications, repository } = setup([{ id: 1, ...FORM, branch_id: 1 }]);

    await expect(applications.setStatus({ admin: adminA, id: "1", status: "maybe" })).rejects.toBeInstanceOf(ValidationError);
    expect(repository.store.get(1).status).toBe("pending");
  });
});
