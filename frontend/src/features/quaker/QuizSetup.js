"use client";

import { fillTemplate } from "@/lib/template";
import { useTranslations } from "@/store/languageStore";
import { classLabel } from "./quizText";
import { ACCENT, CARD, ErrorBox, GoldStrip, PRIMARY_BUTTON, pill } from "./quizStyles";

export const QUESTION_COUNTS = [5, 10, 15, 20];

/** Choose a subject of your own class and how many questions. */
export default function QuizSetup({ student, meta, language, subject, onSubject, count, onCount, onStart, starting, error }) {
  const t = useTranslations("quiz");
  const questions = (n) => fillTemplate(t("questionsAvailable"), { count: n });
  const hasQuestions = (meta?.total ?? 0) > 0;

  return (
    <div className="bg-gradient-to-b from-school-cream to-school-cream-deep py-10">
      <div className="max-w-2xl mx-auto px-5">
        <div className="text-center mb-10">
          <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold text-school-navy mb-2 tracking-tight leading-tight">
            {t("pickTitle")}
          </h1>
          {student?.firstName && (
            <p className="text-[0.95rem] text-school-muted">{fillTemplate(t("welcome"), { name: student.firstName })}</p>
          )}
        </div>

        <ErrorBox>{error}</ErrorBox>

        <div className={CARD}>
          <GoldStrip />
          {!meta ? (
            <p className="p-6 text-center text-school-muted">{t("loading")}</p>
          ) : (
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-school-navy mb-1">{t("yourClass")}</p>
                <p className="text-lg font-bold text-[#7a5c1e] m-0">{classLabel(meta.classKey, language) || meta.className}</p>
              </div>

              {!hasQuestions ? (
                <div className="rounded-xl p-5 text-center" style={{ background: "rgba(201,168,76,0.12)", color: "#7a5c1e" }}>
                  <p className="font-bold mb-1">{t("noQuestionsTitle")}</p>
                  <p className="text-sm m-0">{t("noQuestionsBody")}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="quiz-subject" className="block text-sm font-semibold text-school-navy mb-2">
                      {t("subject")}
                    </label>
                    <select
                      id="quiz-subject"
                      value={subject}
                      onChange={(event) => onSubject(event.target.value)}
                      className="w-full px-4 py-3 rounded-xl border bg-[#f9f9f9] text-school-navy border-[rgba(201,168,76,0.4)] focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                    >
                      <option value="">{`${t("allSubjects")} (${questions(meta.total)})`}</option>
                      {meta.subjects.map((s) => (
                        <option key={s.subject} value={s.subject}>
                          {`${s.subject} (${questions(s.count)})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <fieldset>
                    <legend className="block text-sm font-semibold text-school-navy mb-2">{t("numberOfQuestions")}</legend>
                    <div className="grid grid-cols-4 gap-2">
                      {QUESTION_COUNTS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          aria-pressed={count === n}
                          onClick={() => onCount(n)}
                          className="py-2.5 rounded-xl text-sm font-bold transition-all"
                          style={pill(count === n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <button
                    type="button"
                    onClick={onStart}
                    disabled={starting}
                    className={`w-full ${PRIMARY_BUTTON}`}
                    style={{ background: ACCENT }}
                  >
                    {starting ? t("starting") : t("start")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
