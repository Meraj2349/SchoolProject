"use client";

import Link from "next/link";
import { useId } from "react";
import { fillTemplate } from "@/lib/template";
import { useTranslations } from "@/store/languageStore";
import MathText from "./MathText";
import { localize } from "./quizText";
import { CARD, GREEN, GoldStrip, PRIMARY_BUTTON } from "./quizStyles";

function AnswerLine({ label, letter, text, tone }) {
  return (
    <div className="text-[#5a6072] flex flex-wrap gap-x-2 items-baseline">
      <span className="shrink-0">{label}:</span>
      <span className="font-bold" style={{ color: tone }}>
        {letter}
      </span>
      {text && (
        <MathText as="span" className="text-[#0d1f3c] break-words min-w-0">
          {text}
        </MathText>
      )}
    </div>
  );
}

/** Score and an answer-by-answer review, in the question language. */
export default function QuizResults({ result, questions, questionLanguage, onAgain }) {
  const t = useTranslations("quiz");
  const reviewId = useId();
  const { totalQuestions, correctAnswers, scorePercentage, grade, details } = result;

  return (
    <div className="bg-gradient-to-b from-[#fdf8f0] to-[#f5ede0] min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-5">
        <div className="relative bg-[#0d1f3c] rounded-2xl overflow-hidden mb-8 text-center px-8 py-10">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-[rgba(226,192,122,0.7)] mb-3">{t("complete")}</p>
          <div className="mx-auto w-28 h-28 rounded-full border-2 border-[rgba(201,168,76,0.45)] flex justify-center items-center mb-4">
            <span className="text-4xl font-black text-[#e2c07a]">{grade}</span>
          </div>
          <p className="text-5xl font-black text-[#e2c07a] mb-2">{`${Number(scorePercentage).toFixed(1)}%`}</p>
          <p className="text-[rgba(226,192,122,0.75)] text-lg font-medium m-0">
            {fillTemplate(t("correctOutOf"), { correct: correctAnswers, total: totalQuestions })}
          </p>
        </div>

        <div className="flex gap-3 mb-10">
          <button type="button" onClick={onAgain} className={`flex-1 ${PRIMARY_BUTTON}`} style={{ background: GREEN }}>
            {t("anotherQuiz")}
          </button>
          <Link
            href="/quaker/progress"
            className="flex-1 py-3.5 text-center border border-gray-300 text-gray-700 font-semibold text-base rounded-xl hover:bg-gray-50 no-underline bg-white"
          >
            {t("viewProgress")}
          </Link>
        </div>

        <section aria-labelledby={reviewId} className={CARD}>
          <GoldStrip />
          <h3 id={reviewId} className="px-6 py-4 border-b border-gray-100 text-lg font-bold text-[#0d1f3c] m-0">
            {t("review")}
          </h3>
          <ol className="p-4 space-y-3 list-none m-0">
            {details.map((d, index) => {
              const { prompt, options } = localize(
                questions.find((q) => q.id === d.questionId),
                questionLanguage,
              );
              const textOf = (letter) => options.find((o) => o.letter === letter)?.text ?? "";
              return (
                <li
                  key={d.questionId}
                  className="rounded-xl p-5 border"
                  style={
                    d.isCorrect
                      ? { background: "rgba(16,185,129,0.04)", borderColor: "rgba(16,185,129,0.3)" }
                      : { background: "rgba(244,63,94,0.04)", borderColor: "rgba(244,63,94,0.25)" }
                  }
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm font-semibold text-[#0d1f3c] leading-snug flex gap-2 m-0">
                      <span className="tabular-nums text-[#7a5c1e]">{index + 1}.</span>
                      <MathText as="span" className="break-words">
                        {prompt}
                      </MathText>
                    </p>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap"
                      style={d.isCorrect ? { background: "rgba(16,185,129,0.12)", color: "#047857" } : { background: "rgba(244,63,94,0.1)", color: "#be123c" }}
                    >
                      {d.isCorrect ? t("correct") : t("wrong")}
                    </span>
                  </div>
                  <div className="text-sm space-y-2">
                    <AnswerLine
                      label={t("yourAnswer")}
                      letter={d.userAnswer || t("noAnswer")}
                      text={textOf(d.userAnswer)}
                      tone={d.isCorrect ? "#047857" : "#be123c"}
                    />
                    {!d.isCorrect && (
                      <AnswerLine label={t("correctAnswer")} letter={d.correctAnswer} text={textOf(d.correctAnswer)} tone="#047857" />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
