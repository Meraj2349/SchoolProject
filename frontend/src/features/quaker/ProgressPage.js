"use client";

import { useEffect, useState } from "react";
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
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function letterGrade(pct) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-xs text-white/60 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-amber-300">{value}</p>
    </div>
  );
}

export default function ProgressPage() {
  const { student, setSession, hydrateFromStorage } = useQuizSessionStore();

  // Identity form state — used when no live session
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Data state
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
    branchService.getAll().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setBranches(list.filter((b) => !b.is_proposed));
    }).catch(() => setBranches([]));
  }, []);

  // If already have a token (from quiz flow), load data immediately
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
    if (!branchId || !firstName || !lastName || !className || !section || !rollNumber) {
      setVerifyError("Please fill in all fields.");
      return;
    }
    setVerifying(true);
    try {
      const { token, student: s } = await quizService.verifyStudent({
        branchId, firstName, lastName, className, section, rollNumber,
      });
      setSession(token, s);
      await loadData();
    } catch (err) {
      setVerifyError(err.response?.data?.error || err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40";
  const labelClass = "block text-sm font-medium text-white/80 mb-2";

  const totals = progress?.totals || {};
  const bySubject = progress?.bySubject || [];

  // Show identity form if data not yet loaded
  if (!dataLoaded) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-amber-300 text-sm font-medium mb-2">Progress</p>
          <h1 className="text-4xl font-bold mb-2">Check your progress</h1>
          <p className="text-white/60">Enter your student details to view your quiz history.</p>
        </div>

        {verifyError && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-6 text-sm">
            {verifyError}
          </div>
        )}

        <form onSubmit={handleVerify} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <label className={labelClass}>Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={inputClass}
              style={{ colorScheme: "dark" }}
              required
            >
              <option value="">-- Select your branch --</option>
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
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Rifat" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Ahmed" className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class</label>
              <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. Nursery" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Section</label>
              <input type="text" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" className={inputClass} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Roll Number</label>
            <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="e.g. B1-N-Be-01" className={inputClass} required />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-300"
          >
            {verifying ? "Loading…" : "View My Progress →"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-amber-300 text-sm font-medium mb-2">Progress</p>
          <h1 className="text-4xl font-bold">
            {student ? `${student.firstName}'s learning journey` : "Your learning journey"}
          </h1>
        </div>
        <Link
          href="/quaker/quiz"
          className="px-5 py-2.5 bg-amber-400 text-[#0a1628] font-bold rounded-xl hover:bg-amber-300 transition-all no-underline"
        >
          New Quiz →
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Sessions" value={loading ? "—" : totals.sessions ?? 0} />
        <StatCard label="Avg Score" value={loading ? "—" : totals.avgScore != null ? `${Math.round(totals.avgScore)}%` : "0%"} />
        <StatCard label="Correct" value={loading ? "—" : totals.totalCorrect ?? 0} />
        <StatCard label="Total Answered" value={loading ? "—" : totals.totalQuestions ?? 0} />
      </div>

      {bySubject.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
          <h3 className="text-xl font-bold mb-5">Subject Breakdown</h3>
          <div className="space-y-4">
            {bySubject.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{s.subject}</span>
                  <span className="text-xs text-white/60">
                    {s.sessions} {s.sessions === 1 ? "session" : "sessions"} · {s.totalCorrect}/{s.totalQuestions} correct
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, Math.round(s.avgScore))}%` }} />
                  </div>
                  <span className="w-14 text-right text-sm font-bold text-amber-300">{Math.round(s.avgScore)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold">Session History</h3>
          <span className="text-sm text-white/60">{sessions.length} total</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-white/40">Loading…</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/60 mb-4">No quizzes yet.</p>
            <Link href="/quaker/quiz" className="inline-block px-5 py-2.5 bg-amber-400 text-[#0a1628] font-bold rounded-xl hover:bg-amber-300 transition-all no-underline">
              Take your first quiz →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">When</th>
                  <th className="text-left px-6 py-3 font-semibold">Subject</th>
                  <th className="text-left px-6 py-3 font-semibold">Grade</th>
                  <th className="text-center px-6 py-3 font-semibold">Score</th>
                  <th className="text-center px-6 py-3 font-semibold">Letter</th>
                  <th className="text-right px-6 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const pct = Number(s.ScorePercentage) || 0;
                  return (
                    <tr key={s.SessionID} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 text-white/80 whitespace-nowrap">{formatDate(s.CompletedAt || s.StartedAt)}</td>
                      <td className="px-6 py-3 text-white/80">{s.Subject || "—"}</td>
                      <td className="px-6 py-3 text-white/60">{s.Grade || "—"}</td>
                      <td className="px-6 py-3 text-center font-semibold text-amber-300">
                        {s.CorrectAnswers}/{s.TotalQuestions} · {pct.toFixed(0)}%
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-amber-400/10 border border-amber-300/30 text-amber-200 rounded text-xs font-bold">
                          {letterGrade(pct)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-white/60">{formatDuration(s.TimeTakenSeconds)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
