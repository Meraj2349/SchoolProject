"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isQuizSessionExpired, quizService, quizTokenHolder } from "@/services/quiz.service";
import { useLanguageStore } from "@/store/languageStore";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import IdentityFormPage from "./IdentityFormPage";
import { classLabel } from "./quizText";

function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m === 0 ? `${s}s` : `${m}m ${s}s`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function letterGrade(pct) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

/* Stat card — echoes ClassStatistics circle counter but in card form */
function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07)] overflow-hidden">
      <div
        className="h-[3px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
        }}
      />
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5a6072] mb-2">
          {label}
        </p>
        <p className="text-2xl font-extrabold" style={{ color: "#0d1f3c" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* Shared input / label styles — same as LoginPage / IdentityFormPage */
export default function ProgressPage() {
  const language = useLanguageStore((s) => s.language);
  const student = useQuizSessionStore((s) => s.student);
  const [status, setStatus] = useState("checking"); // checking | needsIdentity | ready
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([quizService.myProgress(), quizService.mySessions()]);
      setProgress(p);
      setSessions(Array.isArray(s) ? s : []);
      setStatus("ready");
    } catch (failure) {
      // An expired or unknown quiz session: ask who the student is again.
      setStatus(isQuizSessionExpired(failure) || failure?.response?.status === 404 ? "needsIdentity" : "ready");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizTokenHolder.get()) loadData();
    else setStatus("needsIdentity");
  }, []);

  const totals = progress?.totals || {};
  const bySubject = progress?.bySubject || [];

  if (status === "needsIdentity") return <IdentityFormPage onVerified={loadData} />;
  if (status === "checking") return null;

  /* ── DATA DASHBOARD — public-site language ── */
  return (
    <div className="bg-gradient-to-b from-[#fdf8f0] to-[#f5ede0] min-h-screen py-10">
      {/* Gold strip top */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] pointer-events-none z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-5">
        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-[14px] mb-4">
            <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
            <span className="text-[0.75rem] text-[#c9a84c]">★</span>
            <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold text-[#0d1f3c] tracking-tight leading-tight">
                {student
                  ? `${student.firstName}'s learning journey`
                  : "Your learning journey"}
              </h1>
              <p className="text-[0.95rem] text-[#5a6072] mt-1">
                All your quiz sessions and subject performance in one place.
              </p>
            </div>
            <Link
              href="/quaker/quiz"
              className="inline-flex items-center gap-2 font-bold text-white no-underline px-5 py-2.5 rounded-xl transition-all"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(16,185,129,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(16,185,129,0.3)";
              }}
            >
              New Quiz →
            </Link>
          </div>
        </div>

        {/* Stat cards grid */}
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Sessions"
            value={loading ? "—" : (totals.sessions ?? 0)}
          />
          <StatCard
            label="Avg Score"
            value={
              loading
                ? "—"
                : totals.avgScore != null
                  ? `${Math.round(totals.avgScore)}%`
                  : "0%"
            }
          />
          <StatCard
            label="Correct"
            value={loading ? "—" : (totals.totalCorrect ?? 0)}
          />
          <StatCard
            label="Total Answered"
            value={loading ? "—" : (totals.totalQuestions ?? 0)}
          />
        </div>

        {/* Subject breakdown */}
        {bySubject.length > 0 && (
          <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07)] overflow-hidden mb-10">
            <div
              className="h-[3px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
              }}
            />
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#c9a84c" }}
              />
              <h3 className="text-lg font-bold text-[#0d1f3c]">
                Subject Breakdown
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {bySubject.map((s) => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#0d1f3c]">
                      {s.subject}
                    </span>
                    <span className="text-xs text-[#5a6072]">
                      {s.sessions} {s.sessions === 1 ? "session" : "sessions"} ·{" "}
                      {s.totalCorrect}/{s.totalQuestions} correct
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.round(s.avgScore))}%`,
                          background:
                            "linear-gradient(90deg, #10b981, #059669)",
                        }}
                      />
                    </div>
                    <span
                      className="w-14 text-right text-sm font-bold"
                      style={{ color: "#047857" }}
                    >
                      {Math.round(s.avgScore)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session history table */}
        <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07)] overflow-hidden">
          <div
            className="h-[3px]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
            }}
          />
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#c9a84c" }}
              />
              <h3 className="text-lg font-bold text-[#0d1f3c]">
                Session History
              </h3>
            </div>
            <span className="text-sm text-[#5a6072]">
              {sessions.length} total
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#5a6072] italic text-sm">
              Loading…
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#5a6072] mb-4">No quizzes yet.</p>
              <Link
                href="/quaker/quiz"
                className="inline-block px-5 py-2.5 font-bold text-white rounded-xl no-underline transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                }}
              >
                Take your first quiz →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background: "rgba(201,168,76,0.06)",
                      borderBottom: "1px solid rgba(201,168,76,0.2)",
                    }}
                  >
                    {[
                      "When",
                      "Subject",
                      "Class",
                      "Score",
                      "Letter",
                      "Time",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[#5a6072] ${
                          i >= 3 ? "text-center" : "text-left"
                        } ${i === 5 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const pct = Number(s.ScorePercentage) || 0;
                    return (
                      <tr
                        key={s.SessionID}
                        className="border-t border-gray-50 transition-colors"
                        style={{}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(201,168,76,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "";
                        }}
                      >
                        <td className="px-6 py-3.5 text-[#5a6072] whitespace-nowrap text-xs">
                          {formatDate(s.CompletedAt || s.StartedAt)}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-[#0d1f3c]">
                          {s.Subject || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-[#5a6072]">
                          {classLabel(s.ClassKey, language) || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-center font-bold text-[#047857]">
                          {s.CorrectAnswers}/{s.TotalQuestions} ·{" "}
                          {pct.toFixed(0)}%
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: "rgba(201,168,76,0.12)",
                              color: "#7a5c1e",
                              border: "1px solid rgba(201,168,76,0.35)",
                            }}
                          >
                            {letterGrade(pct)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-[#5a6072]">
                          {formatDuration(s.TimeTakenSeconds)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
