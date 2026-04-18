"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { quizService, quizTokenHolder } from "@/services/quiz.service";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import MathText from "./MathText";

/**
 * Normalize question.options to an array of { letter, text }.
 * DB stores `{"A":"...","B":"...","C":"...","D":"..."}` but occasionally
 * an array slips through; handle both.
 */
function normalizeOptions(opts) {
  if (!opts) return [];
  if (Array.isArray(opts)) {
    return opts.map((text, i) => ({
      letter: String.fromCharCode(65 + i),
      text: String(text ?? ""),
    }));
  }
  if (typeof opts === "object") {
    return Object.keys(opts)
      .sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()))
      .map((key) => ({
        letter: String(key).toUpperCase(),
        text: String(opts[key] ?? ""),
      }));
  }
  return [];
}

const QUESTION_COUNTS = [5, 10, 15, 20];

/* Difficulty pill colours — borrowed from QuickLinks card palette */
const DIFF_COLORS = {
  easy: {
    gradient: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
    shadow: "rgba(16,185,129,0.35)",
  },
  medium: {
    gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
    shadow: "rgba(245,158,11,0.35)",
  },
  hard: {
    gradient: "linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)",
    shadow: "rgba(244,63,94,0.35)",
  },
  all: {
    gradient: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)",
    shadow: "rgba(139,92,246,0.35)",
  },
};

/* Shared token strings */
const inputClass =
  "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40 cursor-pointer appearance-none";

export default function QuizPage() {
  const router = useRouter();
  const { student, quizToken, hydrateFromStorage } = useQuizSessionStore();

  const [phase, setPhase] = useState("setup"); // setup | playing | results
  const [meta, setMeta] = useState({ subjects: [], grades: [], difficulties: [] });
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [relaxedNote, setRelaxedNote] = useState("");

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const perQuestionStart = useRef(null);

  const [result, setResult] = useState(null);

  useEffect(() => {
    hydrateFromStorage();
    const token = quizTokenHolder.get();
    if (!token) {
      router.replace("/quaker/start");
    }
  }, [hydrateFromStorage, router]);

  useEffect(() => {
    quizService
      .getMeta()
      .then((m) =>
        setMeta({
          subjects: m.subjects || [],
          grades: m.grades || [],
          difficulties: m.difficulties || [],
        }),
      )
      .catch(() => setMeta({ subjects: [], grades: [], difficulties: [] }));
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setError("");
    setRelaxedNote("");
    try {
      const data = await quizService.start({
        subject,
        grade,
        difficulty,
        numQuestions,
      });
      if (!data.questions?.length) {
        setError("No quiz questions available. Try again later.");
        setLoading(false);
        return;
      }
      if (data.relaxed) {
        const msg = {
          difficulty: `No ${difficulty} questions for that subject+grade — showing mixed difficulty.`,
          "grade+difficulty": `No questions for that exact grade — showing all grades.`,
          all: `No questions for those filters — showing a random mix.`,
        }[data.relaxed];
        setRelaxedNote(msg || "Filters relaxed to find questions.");
      }
      setQuestions(data.questions);
      setCurrent(0);
      setAnswers({});
      setQuestionTimes({});
      setStartedAt(Date.now());
      perQuestionStart.current = Date.now();
      setPhase("playing");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to start";
      if (err.response?.status === 401) {
        router.replace("/quaker/start");
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const recordTime = (qid) => {
    if (perQuestionStart.current) {
      const elapsed = Math.round(
        (Date.now() - perQuestionStart.current) / 1000,
      );
      setQuestionTimes((p) => ({ ...p, [qid]: (p[qid] || 0) + elapsed }));
      perQuestionStart.current = Date.now();
    }
  };

  const pickAnswer = (qid, letter) =>
    setAnswers((p) => ({ ...p, [qid]: letter }));

  const goNext = () => {
    const q = questions[current];
    recordTime(q.id);
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  };

  const goPrev = () => {
    if (current > 0) {
      recordTime(questions[current].id);
      setCurrent((c) => c - 1);
    }
  };

  const handleFinish = async () => {
    recordTime(questions[current].id);
    setLoading(true);
    setError("");
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id] || "",
        timeSpentSeconds: questionTimes[q.id] || 0,
      }));
      const totalTime = Math.round((Date.now() - startedAt) / 1000);
      const studentName = student
        ? `${student.firstName} ${student.lastName}`.trim()
        : "Student";

      const data = await quizService.finish({
        subject,
        grade,
        answers: answersPayload,
        timeTakenSeconds: totalTime,
        studentName,
        className: student?.className || null,
        section: student?.section || null,
      });
      setResult(data);
      setPhase("results");
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || "Failed to submit";
      if (err.response?.status === 401) {
        router.replace("/quaker/start");
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPhase("setup");
    setQuestions([]);
    setAnswers({});
    setQuestionTimes({});
    setResult(null);
    setCurrent(0);
    setError("");
  };

  /* ── SETUP PHASE ── */
  if (phase === "setup") {
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

        <div className="max-w-2xl mx-auto px-5">
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-[14px] mb-4">
              <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
              <span className="text-[0.75rem] text-[#c9a84c]">★</span>
              <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
            </div>
            <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold text-[#0d1f3c] mb-2 tracking-tight leading-tight">
              Pick your quiz
            </h1>
            <p className="text-[0.95rem] text-[#5a6072] leading-relaxed">
              {student
                ? `Welcome, ${student.firstName}! Choose filters to generate a random quiz.`
                : "Choose filters to generate a fresh random quiz."}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-700 px-4 py-2.5 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          {/* Card — LeadershipSection card style */}
          <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07),0_8px_24px_rgba(13,31,60,0.06)] overflow-hidden">
            {/* Gold top accent */}
            <div
              className="h-[3px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
              }}
            />
            <div className="p-6 space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-2">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                  style={{
                    colorScheme: "light",
                    color: "#0d1f3c",
                    background: "#f9f9f9",
                    borderColor: "rgba(201,168,76,0.4)",
                  }}
                >
                  <option value="all">All subjects</option>
                  {meta.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-2">
                  Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className={inputClass}
                  style={{
                    colorScheme: "light",
                    color: "#0d1f3c",
                    background: "#f9f9f9",
                    borderColor: "rgba(201,168,76,0.4)",
                  }}
                >
                  <option value="all">All grades</option>
                  {meta.grades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty pills */}
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-2">
                  Difficulty
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["all", ...(meta.difficulties || [])].map((d) => {
                    const isActive = difficulty === d;
                    const colors = DIFF_COLORS[d] || DIFF_COLORS.all;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className="py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
                        style={
                          isActive
                            ? {
                                background: colors.gradient,
                                color: "#fff",
                                boxShadow: `0 4px 14px ${colors.shadow}`,
                                transform: "translateY(-2px)",
                              }
                            : {
                                background: "#f5f5f5",
                                color: "#5a6072",
                                border: "1px solid rgba(201,168,76,0.2)",
                              }
                        }
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question count pills */}
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-2">
                  Number of questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {QUESTION_COUNTS.map((n) => {
                    const isActive = numQuestions === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNumQuestions(n)}
                        className="py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={
                          isActive
                            ? {
                                background:
                                  "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                                color: "#fff",
                                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                                transform: "translateY(-2px)",
                              }
                            : {
                                background: "#f5f5f5",
                                color: "#5a6072",
                                border: "1px solid rgba(201,168,76,0.2)",
                              }
                        }
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start button — Navbar green CTA style */}
              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full py-3.5 text-white font-bold text-base rounded-xl cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(16,185,129,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(16,185,129,0.3)";
                }}
              >
                {loading ? "Loading…" : "Start Quiz →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── PLAYING PHASE ── */
  if (phase === "playing") {
    const q = questions[current];
    const options = normalizeOptions(q.options);
    const selected = answers[q.id];
    const answeredCount = Object.keys(answers).length;
    const progressPct = ((current + 1) / questions.length) * 100;

    return (
      <div className="bg-[#f7f4ec] min-h-screen pb-16">
        {/* Sticky top bar — progress, counter, answered chip */}
        <div
          className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[rgba(201,168,76,0.3)]"
          style={{ boxShadow: "0 1px 0 rgba(13,31,60,0.04)" }}
        >
          <div className="max-w-4xl mx-auto px-5 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#7a5c1e]">
                  Question
                </span>
                <span className="text-lg font-extrabold text-[#0d1f3c] tabular-nums">
                  {String(current + 1).padStart(2, "0")}
                  <span className="text-[#9ca3af] font-medium mx-1">/</span>
                  <span className="text-[#5a6072] font-semibold">
                    {String(questions.length).padStart(2, "0")}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    color: "#047857",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  {answeredCount}/{questions.length} answered
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-[rgba(201,168,76,0.15)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background:
                    "linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)",
                  boxShadow: "0 0 8px rgba(16,185,129,0.4)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 pt-8">
          {relaxedNote && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(201,168,76,0.12)",
                color: "#7a5c1e",
                border: "1px solid rgba(201,168,76,0.35)",
              }}
            >
              <span className="font-semibold">Heads up:</span> {relaxedNote}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Question card */}
          <div
            className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] overflow-hidden mb-6"
            style={{
              boxShadow:
                "0 1px 2px rgba(13,31,60,0.04), 0 12px 32px rgba(13,31,60,0.08)",
            }}
          >
            <div
              className="h-[3px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
              }}
            />
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              {/* Tag chips */}
              <div className="flex gap-2 flex-wrap mb-6">
                {q.subject && (
                  <span
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      color: "#047857",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    {q.subject}
                  </span>
                )}
                {q.grade && (
                  <span
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase"
                    style={{
                      background: "rgba(201,168,76,0.12)",
                      color: "#7a5c1e",
                      border: "1px solid rgba(201,168,76,0.3)",
                    }}
                  >
                    Class {q.grade}
                  </span>
                )}
                {q.difficulty && (
                  <span
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase"
                    style={{
                      background: "rgba(75,46,131,0.1)",
                      color: "#4b2e83",
                      border: "1px solid rgba(75,46,131,0.2)",
                    }}
                  >
                    {q.difficulty}
                  </span>
                )}
              </div>

              {/* Question prompt — serif display face for gravitas + MathText */}
              <MathText
                as="div"
                className="text-[1.35rem] sm:text-[1.55rem] font-semibold text-[#0d1f3c] leading-[1.55] mb-8 quiz-prompt whitespace-pre-wrap"
              >
                {q.question}
              </MathText>

              {/* Options — 2-col on desktop, 1-col mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map(({ letter, text }) => {
                  const isSelected = selected === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => pickAnswer(q.id, letter)}
                      className="group text-left px-5 py-4 rounded-xl border-2 transition-all flex items-start gap-3.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      style={
                        isSelected
                          ? {
                              background:
                                "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.06) 100%)",
                              borderColor: "#10b981",
                              boxShadow:
                                "0 4px 16px rgba(16,185,129,0.22), inset 0 1px 0 rgba(255,255,255,0.6)",
                            }
                          : {
                              background: "#fcfbf7",
                              borderColor: "rgba(201,168,76,0.25)",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "#f0fdf4";
                          e.currentTarget.style.borderColor =
                            "rgba(16,185,129,0.5)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "#fcfbf7";
                          e.currentTarget.style.borderColor =
                            "rgba(201,168,76,0.25)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <span
                        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg font-extrabold text-sm transition-all"
                        style={
                          isSelected
                            ? {
                                background:
                                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "#fff",
                                boxShadow: "0 4px 10px rgba(16,185,129,0.4)",
                              }
                            : {
                                background: "rgba(201,168,76,0.15)",
                                color: "#7a5c1e",
                                border: "1px solid rgba(201,168,76,0.3)",
                              }
                        }
                      >
                        {letter}
                      </span>
                      <MathText
                        as="span"
                        className="text-[1rem] sm:text-[1.05rem] text-[#0d1f3c] leading-relaxed pt-1 min-w-0 break-words"
                      >
                        {text}
                      </MathText>
                      {isSelected && (
                        <span
                          className="shrink-0 ml-auto self-center text-emerald-600 text-lg"
                          aria-hidden
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Keyboard hint */}
              <p className="mt-6 text-xs text-[#9ca3af] text-center">
                Tip: click an option or tap it on mobile to select
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={current === 0}
              className="flex-1 py-3.5 text-[#5a6072] font-semibold text-base rounded-xl border border-gray-200 cursor-pointer transition-all hover:bg-gray-50 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="grow py-3.5 text-white font-bold text-base rounded-xl transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="grow py-3.5 text-white font-bold text-base rounded-xl transition-all disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                }}
              >
                {loading ? "Submitting…" : "Submit Quiz ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULTS PHASE ── */
  if (phase === "results" && result) {
    const {
      totalQuestions,
      correctAnswers,
      scorePercentage,
      grade: letterGrade,
      details,
    } = result;

    /* Grade to colour mapping */
    const gradeColor =
      scorePercentage >= 80
        ? {
            text: "#047857",
            bg: "rgba(16,185,129,0.1)",
            border: "rgba(16,185,129,0.35)",
          }
        : scorePercentage >= 60
          ? {
              text: "#b45309",
              bg: "rgba(245,158,11,0.1)",
              border: "rgba(245,158,11,0.35)",
            }
          : {
              text: "#b91c1c",
              bg: "rgba(244,63,94,0.08)",
              border: "rgba(244,63,94,0.3)",
            };

    return (
      <div className="bg-gradient-to-b from-[#fdf8f0] to-[#f5ede0] min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-5">
          {/* Score hero strip — echoes ClassStatistics dark strip + large counter circles */}
          <div className="relative bg-[#0d1f3c] rounded-2xl overflow-hidden mb-8 text-center">
            {/* Diagonal texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
              }}
            />
            {/* Top gold strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(to_right,transparent_0%,#c9a84c_30%,#e2c07a_50%,#c9a84c_70%,transparent_100%)]" />

            <div className="relative z-[1] px-8 py-10">
              {/* Star rule */}
              <div className="inline-flex items-center gap-[14px] mb-4">
                <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
                <span className="text-[0.75rem] text-[#c9a84c]">★</span>
                <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
              </div>
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[rgba(226,192,122,0.7)] mb-3">
                Quiz Complete
              </p>

              {/* Grade circle — ClassStatistics counter circle style */}
              <div className="mx-auto w-28 h-28 rounded-full border-2 border-[rgba(201,168,76,0.45)] flex flex-col justify-center items-center bg-[rgba(255,255,255,0.05)] shadow-[0_0_0_6px_rgba(201,168,76,0.07),0_4px_18px_rgba(0,0,0,0.25)] mb-4">
                <div className="absolute inset-[5px] rounded-full border border-[rgba(201,168,76,0.18)] pointer-events-none" />
                <span className="text-4xl font-black text-[#e2c07a] leading-none [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                  {letterGrade}
                </span>
              </div>

              <div className="text-5xl font-black text-[#e2c07a] mb-2 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                {scorePercentage.toFixed(1)}%
              </div>
              <p className="text-[rgba(226,192,122,0.75)] text-lg font-medium">
                {correctAnswers} out of {totalQuestions} correct
              </p>

              {/* Diamond divider */}
              <div className="inline-flex items-center gap-[10px] mt-3">
                <span className="block w-10 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.5)]" />
                <span className="text-[0.5rem] text-[#c9a84c]">◆</span>
                <span className="block w-10 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.5)]" />
              </div>
            </div>

            {/* Bottom gold strip */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[linear-gradient(to_right,transparent_0%,#c9a84c_30%,#e2c07a_50%,#c9a84c_70%,transparent_100%)]" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-10">
            <button
              onClick={resetAll}
              className="flex-1 py-3.5 text-white font-bold text-base rounded-xl transition-all"
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
              Another Quiz
            </button>
            <Link
              href="/quaker/progress"
              className="flex-1 py-3.5 text-center border border-gray-300 text-gray-700 font-semibold text-base rounded-xl hover:bg-gray-50 transition-all no-underline bg-white"
            >
              View Progress
            </Link>
          </div>

          {/* Answer Review */}
          <div className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07)] overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
              }}
            />
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#c9a84c" }}
              />
              <h3 className="text-lg font-bold text-[#0d1f3c]">
                Answer Review
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {details.map((d, idx) => {
                const q = questions.find((x) => x.id === d.questionId);
                const reviewOptions = normalizeOptions(q?.options);
                const findOptText = (letter) =>
                  reviewOptions.find((o) => o.letter === letter)?.text || "";
                const userText = findOptText(d.userAnswer);
                const correctText = findOptText(d.correctAnswer);
                return (
                  <div
                    key={d.questionId}
                    className="rounded-xl p-5 border"
                    style={
                      d.isCorrect
                        ? {
                            background: "rgba(16,185,129,0.04)",
                            borderColor: "rgba(16,185,129,0.3)",
                          }
                        : {
                            background: "rgba(244,63,94,0.04)",
                            borderColor: "rgba(244,63,94,0.25)",
                          }
                    }
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#0d1f3c] leading-snug flex gap-2">
                          <span className="tabular-nums text-[#7a5c1e]">
                            {idx + 1}.
                          </span>
                          <MathText as="span" className="break-words">
                            {q?.question || `Question ${d.questionId}`}
                          </MathText>
                        </div>
                      </div>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
                        style={
                          d.isCorrect
                            ? {
                                background: "rgba(16,185,129,0.12)",
                                color: "#047857",
                              }
                            : {
                                background: "rgba(244,63,94,0.1)",
                                color: "#be123c",
                              }
                        }
                      >
                        {d.isCorrect ? "✓ Correct" : "✗ Wrong"}
                      </span>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="text-[#5a6072] flex flex-wrap gap-x-2 items-baseline">
                        <span className="shrink-0">Your answer:</span>
                        <span
                          className="font-bold"
                          style={{
                            color: d.isCorrect ? "#047857" : "#be123c",
                          }}
                        >
                          {d.userAnswer || "—"}
                        </span>
                        {userText && (
                          <MathText
                            as="span"
                            className="text-[#0d1f3c] break-words min-w-0"
                          >
                            {userText}
                          </MathText>
                        )}
                      </div>
                      {!d.isCorrect && (
                        <div className="text-[#5a6072] flex flex-wrap gap-x-2 items-baseline">
                          <span className="shrink-0">Correct:</span>
                          <span className="font-bold text-[#047857]">
                            {d.correctAnswer}
                          </span>
                          {correctText && (
                            <MathText
                              as="span"
                              className="text-[#0d1f3c] break-words min-w-0"
                            >
                              {correctText}
                            </MathText>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
