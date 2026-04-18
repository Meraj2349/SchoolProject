"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { quizService, quizTokenHolder } from "@/services/quiz.service";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import { branchService } from "@/services/branch.service";

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
const inputClass =
  "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40";
const labelClass = "block text-sm font-medium text-white/80 mb-2";

export default function ProgressPage() {
  const { student, setSession, hydrateFromStorage } = useQuizSessionStore();

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
    branchService
      .getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBranches(list.filter((b) => !b.is_proposed));
      })
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    const token = quizTokenHolder.get();
    if (token && !dataLoaded) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        quizService.myProgress().catch(() => null),
        quizService.mySessions().catch(() => []),
      ]);
      setProgress(p);
      setSessions(Array.isArray(s) ? s : []);
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError("");
    if (
      !branchId ||
      !firstName ||
      !lastName ||
      !className ||
      !section ||
      !rollNumber
    ) {
      setVerifyError("Please fill in all fields.");
      return;
    }
    setVerifying(true);
    try {
      const { token, student: s } = await quizService.verifyStudent({
        branchId,
        firstName,
        lastName,
        className,
        section,
        rollNumber,
      });
      setSession(token, s);
      await loadData();
    } catch (err) {
      setVerifyError(
        err.response?.data?.error || err.message || "Verification failed",
      );
    } finally {
      setVerifying(false);
    }
  };

  const totals = progress?.totals || {};
  const bySubject = progress?.bySubject || [];

  /* ── IDENTITY FORM — admin-auth design language ── */
  if (!dataLoaded) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a1628]">
        {/* Left hero panel */}
        <div className="relative hidden lg:block overflow-hidden">
          <Image
            src="/images/School Gate Picture.jpg"
            alt="School gate"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-br from-[#0a1628]/90 via-[#0a1628]/60 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center font-bold text-[#0a1628] text-lg shadow-lg">
                📊
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Star Shikkha Poribar
              </span>
            </div>
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Track your journey.
                <br />
                <span className="text-amber-300">See your growth.</span>
              </h1>
              <p className="text-white/70 text-lg max-w-md">
                Your full quiz history, subject-wise averages, and session
                statistics — all in one place.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <span>◆ Session history</span>
              <span>◆ Subject averages</span>
              <span>◆ Score trends</span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex items-center justify-center p-6 sm:p-12 relative">
          <div className="lg:hidden absolute inset-0">
            <Image
              src="/images/School Gate Picture.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#0a1628]/85" />
          </div>

          <div className="relative w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="mb-6">
                <p className="text-center text-xs font-bold tracking-[0.14em] uppercase text-amber-300 mb-2">
                  Progress
                </p>
                <h2 className="text-center text-3xl font-bold text-white mb-1">
                  Check your progress
                </h2>
                <p className="text-center text-sm text-white/60">
                  Enter your student details to view your quiz history.
                </p>
              </div>

              {verifyError && (
                <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-5 text-sm">
                  {verifyError}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className={labelClass}>Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className={inputClass + " cursor-pointer appearance-none"}
                    style={{ colorScheme: "dark" }}
                    required
                  >
                    <option value="">— Select your branch —</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name_en || b.name_bn || `Branch ${b.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Rifat"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Ahmed"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Class</label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g. Nursery"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Section</label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. A"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. B1-N-Be-01"
                    className={inputClass}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl cursor-pointer transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30"
                >
                  {verifying ? "Loading…" : "View My Progress →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      "Grade",
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
                          {s.Grade || "—"}
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
