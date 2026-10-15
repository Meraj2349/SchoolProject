// Pure rules for the admin question form. The server checks the same rules;
// these give instant feedback. Form values are flat strings for the inputs.

export const LETTERS = ["A", "B", "C", "D"];
const BANGLA = LETTERS.map((letter) => `bn${letter}`); // bnA..bnD
const SUBJECT_MAX = 100;

const text = (value) => String(value ?? "").trim();

export const emptyQuestion = (classKey = "") => ({
  classKey,
  subject: "",
  prompt: "",
  A: "",
  B: "",
  C: "",
  D: "",
  promptBn: "",
  bnA: "",
  bnB: "",
  bnC: "",
  bnD: "",
  answer: "A",
});

/** Field errors as { field: "required" | "tooLong" }; empty when valid. */
export function validateQuestionForm(form) {
  const errors = {};
  for (const field of ["classKey", "subject", "prompt", ...LETTERS]) {
    if (!text(form[field])) errors[field] = "required";
  }
  if (text(form.subject).length > SUBJECT_MAX) errors.subject = "tooLong";

  // Bangla is optional, but all or nothing.
  const banglaOptions = BANGLA.filter((field) => text(form[field]));
  if (text(form.promptBn)) {
    for (const field of BANGLA) if (!text(form[field])) errors[field] = "required";
  } else if (banglaOptions.length > 0) {
    errors.promptBn = "required";
  }
  return errors;
}

/** The request body for creating or updating a question. */
export function toQuestionPayload(form) {
  const promptBn = text(form.promptBn);
  return {
    classKey: form.classKey,
    subject: text(form.subject),
    prompt: text(form.prompt),
    options: Object.fromEntries(LETTERS.map((letter) => [letter, text(form[letter])])),
    promptBn: promptBn || null,
    optionsBn: promptBn ? Object.fromEntries(LETTERS.map((letter) => [letter, text(form[`bn${letter}`])])) : null,
    answer: form.answer,
  };
}

/** Form values for editing an existing question. */
export function toFormValues(question) {
  return {
    ...emptyQuestion(question.classKey),
    subject: question.subject ?? "",
    prompt: question.prompt ?? "",
    ...Object.fromEntries(LETTERS.map((letter) => [letter, question.options?.[letter] ?? ""])),
    promptBn: question.promptBn ?? "",
    ...Object.fromEntries(LETTERS.map((letter) => [`bn${letter}`, question.optionsBn?.[letter] ?? ""])),
    answer: question.answer ?? "A",
  };
}
