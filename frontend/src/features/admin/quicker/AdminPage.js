"use client";

import { useEffect, useState } from "react";
import { quizService } from "@/services/quiz.service";
import { useBranchStore } from "@/store/branchStore";

const TABS = [
  { key: "sessions", label: "Sessions" },
  { key: "leaderboard", label: "Leaderboard" },
];

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function AdminQuickerPage() {
  const currentBranchId = useBranchStore((s) => s.currentBranchId);
  const [tab, setTab] = useState("sessions");
  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (tab === "sessions") {
          const data = await quizService.adminSessions({ limit: 200 });
          if (!cancelled) setSessions(Array.isArray(data) ? data : []);
        } else {
          const data = await quizService.adminLeaderboard({ limit: 50 });
          if (!cancelled) setLeaderboard(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.error || err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tab, currentBranchId]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quicker Education
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor student quiz activity and top performers.
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
              tab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {tab === "sessions" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Sessions</h3>
            <span className="text-sm text-slate-500">
              {sessions.length} total
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No quiz sessions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold">Student</th>
                    <th className="text-left px-6 py-3 font-semibold">Class</th>
                    <th className="text-left px-6 py-3 font-semibold">Subject</th>
                    <th className="text-center px-6 py-3 font-semibold">Score</th>
                    <th className="text-right px-6 py-3 font-semibold">Time</th>
                    <th className="text-right px-6 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const pct = Number(s.ScorePercentage) || 0;
                    return (
                      <tr
                        key={s.SessionID}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-800">
                            {s.StudentName || "—"}
                          </div>
                          {s.StudentEmail && (
                            <div className="text-xs text-slate-500">
                              {s.StudentEmail}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {[s.ClassName, s.Section].filter(Boolean).join("-") ||
                            "—"}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {s.Subject || "All"}
                          {s.Grade && (
                            <span className="text-xs text-slate-400 ml-1">
                              · {s.Grade}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center font-semibold">
                          <span
                            className={
                              pct >= 70
                                ? "text-emerald-600"
                                : pct >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }
                          >
                            {s.CorrectAnswers}/{s.TotalQuestions} ·{" "}
                            {pct.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600">
                          {formatDuration(s.TimeTakenSeconds)}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-500 whitespace-nowrap">
                          {formatDate(s.CompletedAt || s.StartedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Top Performers</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ranked by average score across all completed quizzes.
            </p>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading…</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No leaderboard data yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold w-16">Rank</th>
                    <th className="text-left px-6 py-3 font-semibold">Student</th>
                    <th className="text-center px-6 py-3 font-semibold">
                      Sessions
                    </th>
                    <th className="text-center px-6 py-3 font-semibold">
                      Avg Score
                    </th>
                    <th className="text-right px-6 py-3 font-semibold">
                      Best Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, idx) => {
                    const avg = Number(row.avgScore) || 0;
                    const best = Number(row.bestScore) || 0;
                    return (
                      <tr
                        key={row.StudentUserID}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                              idx === 0
                                ? "bg-amber-400 text-white"
                                : idx === 1
                                  ? "bg-slate-300 text-slate-800"
                                  : idx === 2
                                    ? "bg-orange-400 text-white"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-800">
                          {row.StudentName || "—"}
                        </td>
                        <td className="px-6 py-3 text-center text-slate-600">
                          {row.sessions}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-indigo-600">
                          {avg.toFixed(1)}%
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600">
                          {best.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
