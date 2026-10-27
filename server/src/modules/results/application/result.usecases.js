import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { toMarks, toNewResult, toSearchFilters } from "../domain/result.js";

// What visitors and admins do with results. `branchId` is the admin's branch,
// the branch a visitor picked, or null for all branches.
export function makeResultUseCases({ resultRepository }) {
  async function findOrFail(id, branchId) {
    const resultId = Number(id);
    const result = Number.isInteger(resultId) ? await resultRepository.findById(resultId, { branchId }) : null;
    if (!result) throw new NotFoundError("result_not_found");
    return result;
  }

  // The student, exam and subject must all be of the class the result is for.
  async function checkBelongsToClass({ studentId, examId, subjectId, classId }, branchId) {
    if (!(await resultRepository.studentInClass({ studentId, classId, branchId }))) {
      throw new ValidationError("result_student_not_in_class");
    }
    if (!(await resultRepository.examForClass({ examId, classId }))) throw new ValidationError("result_exam_not_for_class");
    if (!(await resultRepository.subjectForClass({ subjectId, classId }))) {
      throw new ValidationError("result_subject_not_for_class");
    }
  }

  return {
    search: ({ branchId, query }) => resultRepository.search({ branchId, filters: toSearchFilters(query) }),

    /** `branchId` is the branch the admin enters results for. Gives the new result's id. */
    async addResult({ branchId, input }) {
      const result = toNewResult(input);
      await checkBelongsToClass(result, branchId);
      if (await resultRepository.exists(result)) throw new ConflictError("result_duplicate");
      return resultRepository.create(result);
    },

    async changeMarks({ branchId, id, input }) {
      const marks = toMarks(input?.MarksObtained);
      const result = await findOrFail(id, branchId);
      await resultRepository.updateMarks(result.id, marks);
    },

    async removeResult({ branchId, id }) {
      const result = await findOrFail(id, branchId);
      await resultRepository.remove(result.id);
    },
  };
}
