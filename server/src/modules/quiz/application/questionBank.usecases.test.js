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
