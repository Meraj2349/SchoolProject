"use client";

import { fillTemplate } from "@/lib/template";
import { useTranslations } from "@/store/languageStore";
import MathText from "./MathText";
import { hasBangla, localize } from "./quizText";
import { ErrorBox, GREEN, GoldStrip, PRIMARY_BUTTON, SECONDARY_BUTTON, pill } from "./quizStyles";

/** One question at a time, with a question-language switch. */
export default function QuizPlayer({
  questions,
  current,
  answers,
  questionLanguage,
  onQuestionLanguage,
  onAnswer,
  onPrevious,
  onNext,
  onSubmit,
  submitting,
  error,
}) {
  const t = useTranslations("quiz");
  const question = questions[current];
  const { prompt, options } = localize(question, questionLanguage);
  const selected = answers[question.id];
  const isLast = current === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const englishOnly = questionLanguage === "bn" && !hasBangla(question);

  return (
    <div className="bg-[#f7f4ec] min-h-screen pb-16">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[rgba(201,168,76,0.3)]">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
            <p className="m-0 text-lg font-extrabold text-[#0d1f3c] tabular-nums">
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#7a5c1e] mr-2">{t("question")}</span>
              {current + 1} / {questions.length}
            </p>
            <div className="flex items-center gap-2" role="group" aria-label={t("questionLanguage")}>
              {[
                ["bn", t("bangla")],
                ["en", t("english")],
              ].map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={questionLanguage === code}
                  onClick={() => onQuestionLanguage(code)}
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={pill(questionLanguage === code)}
                >
                  {label}
                </button>
              ))}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums bg-emerald-50 text-emerald-700 border border-emerald-200">
                {fillTemplate(t("answered"), { count: answeredCount, total: questions.length })}
              </span>
            </div>
          </div>
          <div className="h-1.5 bg-[rgba(201,168,76,0.15)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%`, background: GREEN }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 pt-8">
        <ErrorBox>{error}</ErrorBox>

        <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] overflow-hidden mb-6 shadow-[0_12px_32px_rgba(13,31,60,0.08)]">
          <GoldStrip />
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {question.subject && (
              <span className="inline-block mb-6 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {question.subject}
              </span>
            )}
            {englishOnly && <p className="text-xs text-[#7a5c1e] mb-3">{t("noBanglaForThis")}</p>}

            <MathText
              as="h2"
              className="text-[1.35rem] sm:text-[1.55rem] font-semibold text-[#0d1f3c] leading-[1.55] mb-8 whitespace-pre-wrap"
            >
              {prompt}
            </MathText>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map(({ letter, text }) => {
                const isSelected = selected === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onAnswer(question.id, letter)}
                    className="text-left px-5 py-4 rounded-xl border-2 transition-all flex items-start gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    style={
                      isSelected
                        ? { background: "rgba(16,185,129,0.08)", borderColor: "#10b981" }
                        : { background: "#fcfbf7", borderColor: "rgba(201,168,76,0.25)" }
                    }
                  >
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg font-extrabold text-sm"
                      style={
                        isSelected
                          ? { background: GREEN, color: "#fff" }
                          : { background: "rgba(201,168,76,0.15)", color: "#7a5c1e" }
                      }
                    >
                      {letter}
                    </span>
                    <MathText as="span" className="text-[1rem] sm:text-[1.05rem] text-[#0d1f3c] leading-relaxed pt-1 min-w-0 break-words">
                      {text}
                    </MathText>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onPrevious} disabled={current === 0} className={`flex-1 ${SECONDARY_BUTTON}`}>
            {t("previous")}
          </button>
          {isLast ? (
            <button type="button" onClick={onSubmit} disabled={submitting} className={`grow ${PRIMARY_BUTTON}`} style={{ background: GREEN }}>
              {submitting ? t("submitting") : t("submit")}
            </button>
          ) : (
            <button type="button" onClick={onNext} className={`grow ${PRIMARY_BUTTON}`} style={{ background: GREEN }}>
              {t("next")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
