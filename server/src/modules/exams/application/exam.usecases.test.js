import { beforeEach, describe, expect, it } from "@jest/globals";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeExamUseCases } from "./exam.usecases.js";

// Two branches with the same class name and section, as real branches have.
const CLASSES = [
  { id: 51, branchId: 1, className: "Class 5", section: "Good" },
  { id: 52, branchId: 2, className: "Class 5", section: "Good" },
  { id: 61, branchId: 1, className: "Class 6", section: "Good" },
];

function makeFakeRepository() {
  const exams = new Map([
    [7, { id: 7, branchId: 1, classId: 51, type: "Annual", name: "Annual 2025", date: "2025-11-20" }],
    [8, { id: 8, branchId: 2, classId: 52, type: "Annual", name: "North annual", date: "2025-11-21" }],
  ]);
  let nextId = 9;
  const visible = (exam, branchId) => branchId == null || exam.branchId === branchId;
  return {
    exams,
    removed: [],
    findAll: async ({ branchId }) => [...exams.values()].filter((exam) => visible(exam, branchId)),
    distinctNames: async () => [...new Set([...exams.values()].map((exam) => exam.name))].sort(),
    findClass: async ({ branchId, className, section }) =>
      CLASSES.find((c) => c.branchId === branchId && c.className === className && c.section === section) ?? null,
    findById: async (id, { branchId }) => {
      const exam = exams.get(id);
      return exam && visible(exam, branchId) ? exam : null;
    },
    create: async ({ classId, ...exam }) => {
      const created = { id: nextId++, classId, branchId: CLASSES.find((c) => c.id === classId).branchId, ...exam };
      exams.set(created.id, created);
      return created;
    },
    update: async (id, changes) => exams.set(id, { ...exams.get(id), ...changes }),
    remove: async function (id) {
      this.removed.push(id);
      exams.delete(id);
    },
  };
}

const form = (overrides = {}) => ({
  ExamType: "Monthly",
  ExamName: "October test",
  ClassName: "Class 5",
  SectionName: "Good",
  ExamDate: "2026-11-02",
  ...overrides,
});

describe("exam use cases", () => {
  let repository;
  let useCases;

  beforeEach(() => {
    repository = makeFakeRepository();
    useCases = makeExamUseCases({ examRepository: repository, today: () => "2026-10-27" });
  });

  it("lists the branch's exams, or every exam on all branches", async () => {
    expect((await useCases.listExams({ branchId: 1 })).map((exam) => exam.id)).toEqual([7]);
    expect(await useCases.listExams({ branchId: null })).toHaveLength(2);
  });

  it("gives every exam name once", async () => {
    expect(await useCases.examNames()).toEqual(["Annual 2025", "North annual"]);
  });

  describe("createExam", () => {
    it("schedules the exam for the branch's class", async () => {
      const exam = await useCases.createExam({ branchId: 2, input: form() });

      expect(exam).toMatchObject({ classId: 52, branchId: 2, name: "October test", type: "Monthly", date: "2026-11-02" });
    });

    it("refuses a class the branch does not have", async () => {
      await expect(useCases.createExam({ branchId: 2, input: form({ ClassName: "Class 6" }) })).rejects.toThrow(
        new NotFoundError("exam_class_not_found"),
      );
    });

    it("refuses a past date for a new exam", async () => {
      await expect(useCases.createExam({ branchId: 1, input: form({ ExamDate: "2026-10-01" }) })).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe("updateExam", () => {
    it("renames a held exam", async () => {
      await useCases.updateExam({ branchId: 1, id: "7", input: { ExamName: "Annual exam 2025", ExamDate: "2025-11-20" } });

      expect(repository.exams.get(7)).toMatchObject({ name: "Annual exam 2025", date: "2025-11-20", classId: 51 });
    });

    it("moves the exam to another class of its own branch, whatever branch the admin is viewing", async () => {
      await useCases.updateExam({ branchId: null, id: 8, input: form({ ExamName: "Renamed" }) });

      expect(repository.exams.get(8)).toMatchObject({ name: "Renamed", classId: 52 });
    });

    it("refuses a class the exam's branch does not have", async () => {
      await expect(useCases.updateExam({ branchId: null, id: 8, input: form({ ClassName: "Class 6" }) })).rejects.toThrow(
        new NotFoundError("exam_class_not_found"),
      );
    });

    it.each([
      ["another branch's exam", 8],
      ["a missing exam", 99],
      ["an id that is not a number", "abc"],
    ])("does not find %s", async (_label, id) => {
      await expect(useCases.updateExam({ branchId: 1, id, input: { ExamName: "x" } })).rejects.toThrow(new NotFoundError("exam_not_found"));
    });
  });

  describe("deleteExam", () => {
    it("deletes the exam (the repository takes its results with it)", async () => {
      const deleted = await useCases.deleteExam({ branchId: 1, id: "7" });

      expect(deleted).toMatchObject({ id: 7, name: "Annual 2025" });
      expect(repository.removed).toEqual([7]);
    });

    it("does not find another branch's exam", async () => {
      await expect(useCases.deleteExam({ branchId: 1, id: 8 })).rejects.toThrow(new NotFoundError("exam_not_found"));
      expect(repository.removed).toEqual([]);
    });
  });
});
