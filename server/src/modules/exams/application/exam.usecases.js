import { NotFoundError } from "../../../shared/errors/index.js";
import { toExamChanges, toNewExam } from "../domain/exam.js";

// What admins do with exams. `branchId` is the admin's branch, or null for a
// super admin viewing all branches.
export function makeExamUseCases({ examRepository, today }) {
  async function findOrFail(id, branchId) {
    const examId = Number(id);
    const exam = Number.isInteger(examId) ? await examRepository.findById(examId, { branchId }) : null;
    if (!exam) throw new NotFoundError("exam_not_found");
    return exam;
  }

  async function classOrFail(branchId, { className, section }) {
    const found = await examRepository.findClass({ branchId, className, section });
    if (!found) throw new NotFoundError("exam_class_not_found");
    return found;
  }

  return {
    listExams: ({ branchId }) => examRepository.findAll({ branchId }),

    examNames: () => examRepository.distinctNames(),

    /** `branchId` is the branch the exam is for (a super admin must have picked one). */
    async createExam({ branchId, input }) {
      const { className, section, ...exam } = toNewExam(input, { today: today() });
      const schoolClass = await classOrFail(branchId, { className, section });
      return examRepository.create({ ...exam, classId: schoolClass.id });
    },

    async updateExam({ branchId, id, input }) {
      const { className, section, ...changes } = toExamChanges(input);
      const exam = await findOrFail(id, branchId);
      // The class is looked up in the exam's own branch, not the one the admin is viewing.
      if (className) changes.classId = (await classOrFail(exam.branchId, { className, section })).id;
      await examRepository.update(exam.id, changes);
    },

    async deleteExam({ branchId, id }) {
      const exam = await findOrFail(id, branchId);
      await examRepository.remove(exam.id);
      return exam;
    },
  };
}
