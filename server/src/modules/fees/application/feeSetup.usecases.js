import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import {
  DEFAULT_FEE_SETTINGS,
  parseYear,
  toFeeHead,
  toFeeSettings,
  toFeeStructure,
  toStudentDiscount,
} from "../domain/feeSetup.js";
import { requireBranch } from "./requireBranch.js";

/**
 * What an admin configures before billing: settings, class tuition, extra fee
 * heads and student discounts. Every read and write is scoped to a branch.
 *
 * @param {object} deps
 * @param {object} deps.feeRepository  see infrastructure/postgres-fee.repository.js
 */
export function makeFeeSetupUseCases({ feeRepository: repo }) {
  const findOrFail = async (find, branchId, id, notFoundCode) => {
    const row = await find(branchId, id);
    if (!row) throw new NotFoundError(notFoundCode);
    return row;
  };

  const findStructure = (branchId, id) => findOrFail(repo.findStructure, branchId, id, "fee_structure_not_found");
  const findHead = (branchId, id) => findOrFail(repo.findHead, branchId, id, "fee_head_not_found");
  const findDiscount = (branchId, id) => findOrFail(repo.findDiscount, branchId, id, "fee_discount_not_found");

  async function assertNoOtherStructure(branchId, { class_name, academic_year }, ownId = null) {
    const existing = await repo.findStructureByClass(branchId, class_name, academic_year);
    if (existing && existing.id !== ownId) throw new ValidationError("fee_structure_exists");
  }

  async function getSettings(branchId) {
    return (await repo.getSettings(requireBranch(branchId))) ?? { ...DEFAULT_FEE_SETTINGS };
  }

  return {
    getSettings,

    async updateSettings({ branchId, input }) {
      const settings = toFeeSettings(input, await getSettings(branchId));
      await repo.saveSettings(requireBranch(branchId), settings);
      return settings;
    },

    listStructures: async ({ branchId, academicYear }) =>
      repo.listStructures(branchId, { academic_year: academicYear ? parseYear(academicYear) : undefined }),

    async createStructure({ branchId, input }) {
      const branch = requireBranch(branchId);
      const structure = toFeeStructure(input);
      await assertNoOtherStructure(branch, structure);
      return repo.createStructure(branch, structure);
    },

    async updateStructure({ branchId, id, input }) {
      const branch = requireBranch(branchId);
      const existing = await findStructure(branch, id);
      const structure = toFeeStructure({ ...existing, ...input });
      await assertNoOtherStructure(branch, structure, existing.id);
      await repo.updateStructure(branch, existing.id, structure);
    },

    async deleteStructure({ branchId, id }) {
      const existing = await findStructure(requireBranch(branchId), id);
      await repo.removeStructure(existing.branch_id, existing.id);
    },

    listHeads: ({ branchId }) => repo.listHeads(branchId),

    async createHead({ branchId, input }) {
      return repo.createHead(requireBranch(branchId), toFeeHead(input));
    },

    async updateHead({ branchId, id, input }) {
      const existing = await findHead(requireBranch(branchId), id);
      await repo.updateHead(existing.branch_id, existing.id, toFeeHead({ ...existing, ...input }));
    },

    async deleteHead({ branchId, id }) {
      const existing = await findHead(requireBranch(branchId), id);
      await repo.removeHead(existing.branch_id, existing.id);
    },

    listDiscounts: ({ branchId, studentId }) => repo.listDiscounts(branchId, { student_id: studentId }),

    async createDiscount({ branchId, input }) {
      const branch = requireBranch(branchId);
      const discount = toStudentDiscount(input);
      const student = await repo.findStudent(branch, discount.student_id);
      if (!student) throw new NotFoundError("fee_student_not_found");
      return repo.createDiscount(branch, discount);
    },

    // The student a discount belongs to never changes; delete and re-create instead.
    async updateDiscount({ branchId, id, input }) {
      const existing = await findDiscount(requireBranch(branchId), id);
      const discount = toStudentDiscount({ ...existing, ...input, student_id: existing.student_id });
      await repo.updateDiscount(existing.branch_id, existing.id, discount);
    },

    async deleteDiscount({ branchId, id }) {
      const existing = await findDiscount(requireBranch(branchId), id);
      await repo.removeDiscount(existing.branch_id, existing.id);
    },
  };
}
