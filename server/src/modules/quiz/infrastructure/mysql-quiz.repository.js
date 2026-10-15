import db from "../../../../config/db.config.js";

// MySQL adapter for the quiz repository port. Questions are shared by every
// branch; maps QuizQuestions rows to { id, classKey, subject, prompt, ... }.

export const mysqlQuizRepository = {
  async existingSourceKeys(keys) {
    if (keys.length === 0) return new Set();
    const [rows] = await db.query("SELECT SourceKey FROM QuizQuestions WHERE SourceKey IN (?)", [keys]);
    return new Set(rows.map((row) => row.SourceKey));
  },

  async createQuestion({ sourceKey = null, classKey, subject, prompt, options, promptBn, optionsBn, answer, createdBy = null }) {
    const [result] = await db.query(
      `INSERT INTO QuizQuestions
         (SourceKey, ClassKey, Subject, Prompt, OptionsJSON, PromptBn, OptionsBnJSON, CorrectAnswer, CreatedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sourceKey,
        classKey,
        subject,
        prompt,
        JSON.stringify(options),
        promptBn,
        optionsBn ? JSON.stringify(optionsBn) : null,
        answer,
        createdBy,
      ],
    );
    return { id: result.insertId };
  },
};
