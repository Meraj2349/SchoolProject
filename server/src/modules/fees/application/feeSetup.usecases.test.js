import { beforeEach, describe, expect, it } from "@jest/globals";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeFakeFeeRepository } from "./fakeFeeRepository.js";
import { makeFeeSetupUseCases } from "./feeSetup.usecases.js";

const A = 1;
const B = 2;
const code = (c) => expect.objectContaining({ code: c });

describe("fee setup use cases", () => {
  let repo;
  let useCases;

  beforeEach(() => {
    repo = makeFakeFeeRepository({
      students: [
        { id: 7, branch_id: A, class_name: "Class 5" },
        { id: 8, branch_id: B, class_name: "Class 5" },
      ],
    });
    useCases = makeFeeSetupUseCases({ feeRepository: repo });
  });

  describe("settings", () => {
    it("returns the defaults for a branch that has none", async () => {
      expect(await useCases.getSettings(A)).toEqual({ due_day: 10, late_fine: 0, receipt_prefix: "RCT" });
    });

    it("saves changed settings on top of the current ones", async () => {
      await useCases.updateSettings({ branchId: A, input: { late_fine: 50 } });

      expect(await useCases.getSettings(A)).toEqual({ due_day: 10, late_fine: 50, receipt_prefix: "RCT" });
    });

    it("needs a branch (a super admin must pick one)", async () => {
      await expect(useCases.getSettings(null)).rejects.toThrow(code("fee_branch_required"));
      await expect(useCases.updateSettings({ branchId: null, input: {} })).rejects.toThrow(ValidationError);
    });
  });

  describe("class tuition", () => {
    const tuition = { class_name: "Class 5", academic_year: 2026, monthly_tuition: 1200 };

    it("creates and lists a class's tuition", async () => {
      const created = await useCases.createStructure({ branchId: A, input: tuition });

      expect(created).toMatchObject({ id: 1, ...tuition });
      expect(await useCases.listStructures({ branchId: A })).toHaveLength(1);
      expect(await useCases.listStructures({ branchId: B })).toHaveLength(0);
    });

    it("rejects a second tuition for the same class and year", async () => {
      await useCases.createStructure({ branchId: A, input: tuition });

      await expect(useCases.createStructure({ branchId: A, input: tuition })).rejects.toThrow(
        code("fee_structure_exists"),
      );
    });

    it("lets another branch set its own tuition for the same class", async () => {
      await useCases.createStructure({ branchId: A, input: tuition });

      await expect(useCases.createStructure({ branchId: B, input: tuition })).resolves.toBeDefined();
    });

    it("updates the tuition amount", async () => {
      const { id } = await useCases.createStructure({ branchId: A, input: tuition });

      await useCases.updateStructure({ branchId: A, id, input: { monthly_tuition: "1500" } });

      expect(repo.tables.structures.rows.get(id).monthly_tuition).toBe(1500);
    });

    it("cannot update or delete another branch's tuition", async () => {
      const { id } = await useCases.createStructure({ branchId: B, input: tuition });

      await expect(useCases.updateStructure({ branchId: A, id, input: {} })).rejects.toThrow(NotFoundError);
      await expect(useCases.deleteStructure({ branchId: A, id })).rejects.toThrow(code("fee_structure_not_found"));
      expect(repo.tables.structures.rows.has(id)).toBe(true);
    });
  });

  describe("fee heads", () => {
    it("creates, updates and deletes a fee head in the branch", async () => {
      const head = await useCases.createHead({ branchId: A, input: { name_en: "Exam fee", default_amount: 300 } });
      await useCases.updateHead({ branchId: A, id: head.id, input: { active: false } });

      expect(repo.tables.heads.rows.get(head.id)).toMatchObject({ name_en: "Exam fee", active: false });

      await useCases.deleteHead({ branchId: A, id: head.id });
      expect(await useCases.listHeads({ branchId: A })).toEqual([]);
    });

    it("cannot touch another branch's fee head", async () => {
      const head = await useCases.createHead({ branchId: B, input: { name_en: "Exam fee", default_amount: 300 } });

      await expect(useCases.deleteHead({ branchId: A, id: head.id })).rejects.toThrow(code("fee_head_not_found"));
    });
  });

  describe("discounts", () => {
    const scholarship = { student_id: 7, kind: "percent", value: 50 };

    it("gives a student of the branch a discount", async () => {
      const discount = await useCases.createDiscount({ branchId: A, input: scholarship });

      expect(discount).toMatchObject({ student_id: 7, branch_id: A, value: 50 });
      expect(await useCases.listDiscounts({ branchId: A, studentId: 7 })).toHaveLength(1);
    });

    it("cannot give a discount to another branch's student", async () => {
      await expect(
        useCases.createDiscount({ branchId: A, input: { ...scholarship, student_id: 8 } }),
      ).rejects.toThrow(code("fee_student_not_found"));
    });

    it("ends a discount without changing whose it is", async () => {
      const { id } = await useCases.createDiscount({ branchId: A, input: scholarship });

      await useCases.updateDiscount({ branchId: A, id, input: { valid_to: "2026-06-30", student_id: 8 } });

      expect(repo.tables.discounts.rows.get(id)).toMatchObject({ student_id: 7, valid_to: "2026-06-30" });
    });

    it("deletes a discount", async () => {
      const { id } = await useCases.createDiscount({ branchId: A, input: scholarship });

      await useCases.deleteDiscount({ branchId: A, id });

      expect(repo.tables.discounts.rows.size).toBe(0);
    });
  });
});
