"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { ErrorState, SiteLoader } from "@/components/site";
import { useMyQuizProgress } from "@/hooks/useQuizStudent";
import { formatDate, formatNumber } from "@/lib/homePage";
import { fillTemplate } from "@/lib/template";
import { isQuizSessionExpired, quizTokenHolder } from "@/services/quiz.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import IdentityFormPage from "./IdentityFormPage";
import { CARD, GoldStrip } from "./quizStyles";
import { classLabel } from "./quizText";

const WHEN = { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" };
const COLUMNS = ["when", "subject", "class", "score", "grade", "time"];

function letterGrade(percent) {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

function useDuration() {
  const t = useTranslations("quaker.progress");
  const language = useLanguageStore((s) => s.language);
  return (seconds) => {
    if (!seconds) return "—";
    const n = (value) => formatNumber(value, language);
    const m = Math.floor(seconds / 60);
    return m === 0 ? fillTemplate(t("seconds"), { s: n(seconds % 60) }) : fillTemplate(t("minutes"), { m: n(m), s: n(seconds % 60) });
  };
}

function StatCard({ label, value }) {
  return (
    <div className={CARD}>
      <GoldStrip />
      <div className="p-5">
        <p className="m-0 mb-2 text-xs font-bold uppercase tracking-widest text-school-muted">{label}</p>
        <p className="m-0 font-school-heading text-3xl font-bold text-school-navy">{value}</p>
      </div>
    </div>
  );
}

function SubjectBreakdown({ subjects }) {
  const t = useTranslations("quaker.progress");
  const language = useLanguageStore((s) => s.language);
  const n = (value) => formatNumber(value, language);
  return (
    <section aria-labelledby="progress-subjects" className={`${CARD} mb-10`}>
      <GoldStrip />
      <h2 id="progress-subjects" className="site-heading m-0 border-b border-school-cream-deep px-6 py-4 text-lg">
        {t("bySubject")}
      </h2>
      <ul className="m-0 list-none space-y-5 p-6">
        {subjects.map((s) => {
          const average = Math.round(Number(s.avgScore) || 0);
          return (
            <li key={s.subject}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-school-navy">{s.subject}</span>
                <span className="text-xs text-school-muted">
                  {n(s.sessions)} {s.sessions === 1 ? t("session") : t("sessions")} · {fillTemplate(t("correctOf"), { correct: n(s.totalCorrect), total: n(s.totalQuestions) })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-school-cream-deep">
                  <div className="h-full rounded-full bg-school-navy" style={{ width: `${Math.min(100, average)}%` }} />
                </div>
                <span className="w-14 text-right text-sm font-bold text-school-navy">{n(average)}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SessionHistory({ sessions, loading }) {
  const t = useTranslations("quaker.progress");
  const language = useLanguageStore((s) => s.language);
  const duration = useDuration();
  const n = (value) => formatNumber(value, language);

  return (
    <section aria-labelledby="progress-history" className={CARD}>
      <GoldStrip />
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-school-cream-deep px-6 py-4">
        <h2 id="progress-history" className="site-heading m-0 text-lg">
          {t("history")}
        </h2>
        <span className="text-sm text-school-muted">{fillTemplate(t("total"), { count: n(sessions.length) })}</span>
      </div>
      {loading ? (
        <SiteLoader label={t("loading")} />
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center">
          <p className="m-0 mb-4 text-school-muted">{t("none")}</p>
          <Link href="/quaker/quiz" className="site-cta">
            {t("firstQuiz")}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-school-cream text-school-muted">
                {COLUMNS.map((column, i) => (
                  <th key={column} scope="col" className={`px-6 py-3 text-xs font-bold uppercase tracking-wider ${i >= 3 ? "text-center" : "text-left"} ${i === 5 ? "text-right" : ""}`}>
                    {t(`columns.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const percent = Number(s.ScorePercentage) || 0;
                return (
                  <tr key={s.SessionID} className="border-t border-school-cream-deep hover:bg-school-cream/60">
                    <td className="whitespace-nowrap px-6 py-3.5 text-xs text-school-muted">{formatDate(s.CompletedAt || s.StartedAt, language, WHEN) || "—"}</td>
                    <td className="px-6 py-3.5 font-medium text-school-navy">{s.Subject || "—"}</td>
                    <td className="px-6 py-3.5 text-school-muted">{classLabel(s.ClassKey, language) || "—"}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-school-navy">
                      {n(s.CorrectAnswers)}/{n(s.TotalQuestions)} · {n(Math.round(percent))}%
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-block rounded-full bg-school-navy px-2.5 py-0.5 text-xs font-bold text-school-gold-soft">{letterGrade(percent)}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-school-muted">{duration(s.TimeTakenSeconds)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const noSubscription = () => () => {};

export default function ProgressPage() {
  const t = useTranslations("quaker.progress");
  const language = useLanguageStore((s) => s.language);
  const student = useQuizSessionStore((s) => s.student);
  const storeToken = useQuizSessionStore((s) => s.quizToken);
  // The quiz token lives in sessionStorage, which only the browser has (null while prerendering).
  const savedToken = useSyncExternalStore(noSubscription, () => quizTokenHolder.get() ?? "", () => null);
  const token = storeToken || savedToken;
  const { data, isLoading, isError, error, refetch } = useMyQuizProgress(token);

  if (token === null) return null;
  // No quiz session, or an expired or unknown one: ask who the student is (again).
  if (!token || (isError && (isQuizSessionExpired(error) || error?.response?.status === 404))) return <IdentityFormPage onVerified={() => {}} />;

  const loading = isLoading;
  const totals = data?.progress?.totals || {};
  const bySubject = data?.progress?.bySubject || [];
  const sessions = data?.sessions ?? [];
  const n = (value) => formatNumber(value ?? 0, language);
  const stat = (value) => (loading ? "—" : value);

  return (
    <div className="bg-linear-to-b from-school-cream to-school-cream-deep py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="site-heading m-0 text-3xl sm:text-4xl">{student?.firstName ? fillTemplate(t("titleFor"), { name: student.firstName }) : t("title")}</h1>
            <span className="site-rule" aria-hidden="true" />
            <p className="m-0 mt-3 text-school-muted">{t("subtitle")}</p>
          </div>
          <Link href="/quaker/quiz" className="site-cta">
            {t("newQuiz")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("totalSessions")} value={stat(n(totals.sessions))} />
          <StatCard label={t("avgScore")} value={stat(`${n(Math.round(Number(totals.avgScore) || 0))}%`)} />
          <StatCard label={t("correct")} value={stat(n(totals.totalCorrect))} />
          <StatCard label={t("totalAnswered")} value={stat(n(totals.totalQuestions))} />
        </div>

        {isError ? (
          <ErrorState message={t("failed")} onRetry={refetch} />
        ) : (
          <>
            {bySubject.length > 0 && <SubjectBreakdown subjects={bySubject} />}
            <SessionHistory sessions={sessions} loading={loading} />
          </>
        )}
      </div>
    </div>
  );
}
