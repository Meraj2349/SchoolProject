import { beforeEach, describe, expect, it } from "@jest/globals";
import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeResultUseCases } from "./result.usecases.js";

// Branch 1: student 3 in class 51, which has exam 7 and subject 11.
function makeFakeRepository() {
  const results = new Map([[20, { id: 20, branchId: 2, marks: 90 }]]);
  return {
    results,
    searched: [],
    search: async function (args) {
      this.searched.push(args);
      return [{ ResultID: 1 }];
    },
    studentInClass: async ({ studentId, classId, branchId }) => studentId === 3 && classId === 51 && branchId === 1,
    examForClass: async ({ examId, classId }) => examId === 7 && classId === 51,
    subjectForClass: async ({ subjectId, classId }) => subjectId === 11 && classId === 51,
    exists: async ({ studentId, examId, subjectId }) =>
      [...results.values()].some((r) => r.studentId === studentId && r.examId === examId && r.subjectId === subjectId),
    create: async (result) => {
      results.set(21, { id: 21, branchId: 1, ...result });
      return 21;
    },
    findById: async (id, { branchId }) => {
      const result = results.get(id);
      return result && (branchId == null || result.branchId === branchId) ? result : null;
    },
    updateMarks: async (id, marks) => results.set(id, { ...results.get(id), marks }),
    remove: async (id) => results.delete(id),
  };
}

const entry = (overrides = {}) => ({ StudentID: 3, ExamID: 7, SubjectID: 11, ClassID: 51, MarksObtained: 77, ...overrides });

describe("result use cases", () => {
  let repository;
  let useCases;

  beforeEach(() => {
    repository = makeFakeRepository();
    useCases = makeResultUseCases({ resultRepository: repository });
  });

  it("searches the branch's results with the page's filters", async () => {
    await useCases.search({ branchId: 1, query: { firstName: "Rahim", ignored: "x" } });

    expect(repository.searched).toEqual([{ branchId: 1, filters: { name: "Rahim" } }]);
  });

  describe("addResult", () => {
    it("saves the marks and gives the new id", async () => {
      expect(await useCases.addResult({ branchId: 1, input: entry() })).toBe(21);
      expect(repository.results.get(21)).toMatchObject({ studentId: 3, examId: 7, subjectId: 11, classId: 51, marks: 77 });
    });

    it.each([
      ["a student of another class or branch", { branchId: 2, input: entry() }, "result_student_not_in_class"],
      ["an exam of another class", { branchId: 1, input: entry({ ExamID: 8 }) }, "result_exam_not_for_class"],
      ["a subject of another class", { branchId: 1, input: entry({ SubjectID: 12 }) }, "result_subject_not_for_class"],
    ])("refuses %s", async (_label, args, code) => {
      await expect(useCases.addResult(args)).rejects.toThrow(new ValidationError(code));
      expect(repository.results.has(21)).toBe(false);
    });

    it("refuses a second result for the same student, exam and subject", async () => {
      await useCases.addResult({ branchId: 1, input: entry() });

      await expect(useCases.addResult({ branchId: 1, input: entry({ MarksObtained: 80 }) })).rejects.toThrow(new ConflictError("result_duplicate"));
    });
  });

  describe("changeMarks", () => {
    it("changes the marks of the branch's result", async () => {
      await useCases.changeMarks({ branchId: 2, id: "20", input: { MarksObtained: 95 } });

      expect(repository.results.get(20).marks).toBe(95);
    });

    it("refuses marks above 100", async () => {
      await expect(useCases.changeMarks({ branchId: 2, id: 20, input: { MarksObtained: 101 } })).rejects.toBeInstanceOf(ValidationError);
    });

    it.each([
      ["another branch's result", 20],
      ["a missing result", 99],
      ["an id that is not a number", "x"],
    ])("does not find %s", async (_label, id) => {
      await expect(useCases.changeMarks({ branchId: 1, id, input: { MarksObtained: 10 } })).rejects.toThrow(new NotFoundError("result_not_found"));
    });
  });

  describe("removeResult", () => {
    it("deletes the branch's result", async () => {
      await useCases.removeResult({ branchId: null, id: 20 });

      expect(repository.results.has(20)).toBe(false);
    });

    it("does not find another branch's result", async () => {
      await expect(useCases.removeResult({ branchId: 1, id: 20 })).rejects.toThrow(new NotFoundError("result_not_found"));
      expect(repository.results.has(20)).toBe(true);
    });
  });
});
