import { beforeEach, describe, expect, it } from "@jest/globals";
import { makeFakeQuizRepository } from "./fakeQuizRepository.js";
import { makeQuestionBankUseCases } from "./questionBank.usecases.js";

const input = (n, change = {}) => ({
  sourceKey: `benqa:10th-Physics:${n}`,
  classKey: "10",
  subject: "Physics",
  prompt: `Question ${n}?`,
  options: { A: "1", B: "2", C: "3", D: "4" },
  promptBn: `প্রশ্ন ${n}?`,
  optionsBn: { A: "১", B: "২", C: "৩", D: "৪" },
  answer: "a",
  ...change,
});

describe("importQuestions", () => {
  let repo;
  let bank;

  beforeEach(() => {
    repo = makeFakeQuizRepository();
    bank = makeQuestionBankUseCases({ quizRepository: repo });
  });

  it("imports valid questions with their source key", async () => {
    const report = await bank.importQuestions([input(1), input(2)]);

    expect(report).toEqual({ imported: 2, alreadyImported: 0, skipped: {} });
    expect([...repo.questions.values()][0]).toMatchObject({
      sourceKey: "benqa:10th-Physics:1",
      classKey: "10",
      answer: "A",
      promptBn: "প্রশ্ন 1?",
    });
  });

  it("skips bad rows and says why", async () => {
    const report = await bank.importQuestions([
      input(1),
      input(2, { answer: "*" }),
      input(3, { options: { A: "1", B: "2", C: "3", D: "#ERROR!" } }),
      input(4, { options: { A: "1", B: "", C: "3", D: "4" } }),
    ]);

    expect(report).toEqual({
      imported: 1,
      alreadyImported: 0,
      skipped: { quiz_answer_invalid: 1, quiz_spreadsheet_error: 1, quiz_options_required: 1 },
    });
  });

  it("skips a repeated question in the same class and subject", async () => {
    const report = await bank.importQuestions([input(1), input(2, { prompt: " Question 1? " }), input(3, { subject: "Math" , prompt: "Question 1?" })]);

    expect(report).toMatchObject({ imported: 2, skipped: { quiz_duplicate: 1 } });
  });

  it("keeps the English question when the Bangla text is incomplete", async () => {
    const report = await bank.importQuestions([input(1, { optionsBn: { A: "১", B: "", C: "৩", D: "৪" } })]);

    expect(report.imported).toBe(1);
    expect([...repo.questions.values()][0]).toMatchObject({ prompt: "Question 1?", promptBn: null, optionsBn: null });
  });

  it("is safe to run again and never overwrites questions already there", async () => {
    await bank.importQuestions([input(1), input(2)]);
    [...repo.questions.values()][0].prompt = "Edited by a teacher";

    const report = await bank.importQuestions([input(1), input(2), input(3)]);

    expect(report).toEqual({ imported: 1, alreadyImported: 2, skipped: {} });
    expect(repo.questions.size).toBe(3);
    expect([...repo.questions.values()][0].prompt).toBe("Edited by a teacher");
  });
});

const newQuestion = {
  classKey: "Class 6",
  subject: "Math",
  prompt: "What is \\frac{1}{2} of 10?",
  options: { A: "2", B: "5", C: "10", D: "20" },
  answer: "b",
};

describe("managing questions", () => {
  let repo;
  let bank;

  beforeEach(() => {
    repo = makeFakeQuizRepository();
    bank = makeQuestionBankUseCases({ quizRepository: repo });
  });

  it("adds a question for a class and records who added it", async () => {
    const created = await bank.createQuestion({ input: newQuestion, adminId: 3 });

    expect(created).toMatchObject({ classKey: "6", subject: "Math", answer: "B", active: true, promptBn: null });
    expect(repo.questions.get(created.id)).toMatchObject({ createdBy: 3 });
  });

  it("rejects an invalid question", async () => {
    await expect(bank.createQuestion({ input: { ...newQuestion, answer: "E" }, adminId: 3 })).rejects.toMatchObject({
      code: "quiz_answer_invalid",
    });
    expect(repo.questions.size).toBe(0);
  });

  it("edits a question, keeping what was not sent", async () => {
    const { id } = await bank.createQuestion({ input: newQuestion, adminId: 3 });

    const updated = await bank.updateQuestion({
      id,
      input: { promptBn: "১০ এর অর্ধেক কত?", optionsBn: { A: "২", B: "৫", C: "১০", D: "২০" } },
      adminId: 4,
    });

    expect(updated).toMatchObject({ prompt: newQuestion.prompt, promptBn: "১০ এর অর্ধেক কত?", answer: "B" });
    expect(repo.questions.get(id)).toMatchObject({ updatedBy: 4 });
  });

  it("hides and shows a question", async () => {
    const { id } = await bank.createQuestion({ input: newQuestion, adminId: 3 });

    expect(await bank.setActive({ id, active: false, adminId: 3 })).toMatchObject({ active: false });
    expect(await bank.setActive({ id, active: true, adminId: 3 })).toMatchObject({ active: true });
  });

  it("needs a clear yes or no to hide or show", async () => {
    const { id } = await bank.createQuestion({ input: newQuestion, adminId: 3 });

    await expect(bank.setActive({ id, active: "maybe", adminId: 3 })).rejects.toMatchObject({ code: "quiz_active_invalid" });
  });

  it("says when a question does not exist", async () => {
    await expect(bank.getQuestion(99)).rejects.toMatchObject({ code: "quiz_question_not_found" });
    await expect(bank.updateQuestion({ id: 99, input: {}, adminId: 3 })).rejects.toMatchObject({ code: "quiz_question_not_found" });
    await expect(bank.setActive({ id: 99, active: false, adminId: 3 })).rejects.toMatchObject({ code: "quiz_question_not_found" });
  });

  describe("listing", () => {
    beforeEach(async () => {
      for (let n = 1; n <= 30; n += 1) {
        await bank.createQuestion({ input: { ...newQuestion, prompt: `Math question ${n}` }, adminId: 3 });
      }
      const science = await bank.createQuestion({ input: { ...newQuestion, subject: "Science", prompt: "About plants" }, adminId: 3 });
      await bank.setActive({ id: science.id, active: false, adminId: 3 });
      await bank.createQuestion({ input: { ...newQuestion, classKey: "7", prompt: "Class 7 question" }, adminId: 3 });
    });

    it("pages through a class's active questions", async () => {
      const page = await bank.listQuestions({ classKey: "Class 6", page: "2", pageSize: "25" });

      expect(page).toMatchObject({ total: 30, page: 2, pageSize: 25 });
      expect(page.items).toHaveLength(5);
    });

    it("filters by subject, search text and hidden status", async () => {
      expect((await bank.listQuestions({ classKey: "6", search: "question 1" })).total).toBe(11);
      expect((await bank.listQuestions({ classKey: "6", status: "hidden" })).items.map((q) => q.prompt)).toEqual(["About plants"]);
      expect((await bank.listQuestions({ classKey: "6", status: "all" })).total).toBe(31);
      expect((await bank.listQuestions({ classKey: "6", subject: "Science", status: "all" })).total).toBe(1);
    });

    it("needs a valid class", async () => {
      await expect(bank.listQuestions({ classKey: "Class 99" })).rejects.toMatchObject({ code: "quiz_class_invalid" });
    });

    it("counts questions per subject for a class, hidden ones included", async () => {
      expect(await bank.subjectsFor("6")).toEqual([
        { subject: "Math", count: 30 },
        { subject: "Science", count: 1 },
      ]);
    });
  });
});

