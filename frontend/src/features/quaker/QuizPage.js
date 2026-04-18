"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { quizService, quizTokenHolder } from "@/services/quiz.service";
import { useQuizSessionStore } from "@/store/quizSessionStore";

const DIFFICULTIES = ["all", "easy", "medium", "hard"];
const QUESTION_COUNTS = [5, 10, 15, 20];

export default function QuizPage() {
  const router = useRouter();
  const { student, quizToken, hydrateFromStorage } = useQuizSessionStore();

  const [phase, setPhase] = useState("setup"); // setup | playing | results
  const [meta, setMeta] = useState({ subjects: [], grades: [] });
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const perQuestionStart = useRef(null);

  const [result, setResult] = useState(null);

  // Guard: if no quiz token, redirect to identity form
  useEffect(() => {
    hydrateFromStorage();
    const token = quizTokenHolder.get();
    if (!token) {
      router.replace("/quaker/start");
    }
  }, []);

  useEffect(() => {
    quizService
      .getMeta()
      .then(setMeta)
      .catch(() => setMeta({ subjects: [], grades: [] }));
  }, []);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40 cursor-pointer appearance-none";

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await quizService.start({ subject, grade, difficulty, numQuestions });
      if (!data.questions?.length) {
        setError("No questions match those filters. Try different options.");
        setLoading(false);
        return;
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
      const elapsed = Math.round((Date.now() - perQuestionStart.current) / 1000);
      setQuestionTimes((p) => ({ ...p, [qid]: (p[qid] || 0) + elapsed }));
      perQuestionStart.current = Date.now();
    }
  };

  const pickAnswer = (qid, letter) => setAnswers((p) => ({ ...p, [qid]: letter }));

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
      const msg = err.response?.data?.error || err.message || "Failed to submit";
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

  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-amber-300 text-sm font-medium mb-2">Quiz</p>
          <h1 className="text-4xl font-bold mb-2">Pick your quiz</h1>
          {student && (
            <p className="text-white/60">
              Welcome, {student.firstName}! Choose filters to generate a random quiz.
            </p>
          )}
          {!student && (
            <p className="text-white/60">Choose filters to generate a fresh random quiz.</p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass}
              style={{ colorScheme: "dark" }}
            >
              <option value="all">All subjects</option>
              {meta.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={inputClass}
              style={{ colorScheme: "dark" }}
            >
              <option value="all">All grades</option>
              {meta.grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Difficulty</label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    difficulty === d
                      ? "bg-amber-400 text-[#0a1628]"
                      : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Number of questions</label>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumQuestions(n)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    numQuestions === n
                      ? "bg-amber-400 text-[#0a1628]"
                      : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30"
          >
            {loading ? "Loading…" : "Start Quiz →"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    const q = questions[current];
    const options = Array.isArray(q.options) ? q.options : [];
    const selected = answers[q.id];
    const answeredCount = Object.keys(answers).length;
    const progressPct = ((current + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/60">Question {current + 1} of {questions.length}</p>
          <p className="text-sm text-amber-300 font-semibold">{answeredCount} answered</p>
        </div>

        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex gap-2 mb-4">
            {q.subject && (
              <span className="px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs font-semibold">
                {q.subject}
              </span>
            )}
            {q.grade && (
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-white/70 text-xs font-medium">{q.grade}</span>
            )}
            {q.difficulty && (
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-white/70 text-xs font-medium capitalize">{q.difficulty}</span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold leading-relaxed mb-6 whitespace-pre-wrap">
            {q.question}
          </h2>

          <div className="space-y-3">
            {options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selected === letter;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pickAnswer(q.id, letter)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "bg-amber-400/10 border-amber-300 text-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold mr-3 text-sm ${
                      isSelected ? "bg-amber-400 text-[#0a1628]" : "bg-white/10 text-white/80"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={current === 0}
            className="flex-1 py-3.5 text-white/80 font-semibold text-base rounded-xl border border-white/20 cursor-pointer transition-all hover:bg-white/5 bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          {current < questions.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="grow py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl transition-all hover:bg-amber-300"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="grow py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl transition-all disabled:opacity-60 hover:bg-amber-300"
            >
              {loading ? "Submitting…" : "Submit Quiz ✓"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "results" && result) {
    const { totalQuestions, correctAnswers, scorePercentage, grade: letterGrade, details } = result;

    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-linear-to-br from-amber-400 to-amber-300 text-[#0a1628] rounded-2xl p-10 text-center mb-8">
          <p className="text-sm font-semibold mb-2 tracking-wide">QUIZ COMPLETE</p>
          <div className="text-7xl font-black mb-2">{letterGrade}</div>
          <div className="text-4xl font-bold mb-3">{scorePercentage.toFixed(1)}%</div>
          <p className="text-lg font-medium">{correctAnswers} out of {totalQuestions} correct</p>
        </div>

        <div className="flex gap-3 mb-10">
          <button
            onClick={resetAll}
            className="flex-1 py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl hover:bg-amber-300 transition-all"
          >
            Another Quiz
          </button>
          <Link
            href="/quaker/progress"
            className="flex-1 py-3.5 text-center border border-white/20 text-white font-semibold text-base rounded-xl hover:bg-white/5 transition-all no-underline"
          >
            View Progress
          </Link>
        </div>

        <h3 className="text-xl font-bold mb-4">Answer Review</h3>
        <div className="space-y-3">
          {details.map((d, idx) => {
            const q = questions.find((x) => x.id === d.questionId);
            return (
              <div
                key={d.questionId}
                className={`bg-white/5 border rounded-xl p-5 ${d.isCorrect ? "border-emerald-400/40" : "border-red-400/40"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-medium text-white/90">
                    {idx + 1}. {q?.question || `Question ${d.questionId}`}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      d.isCorrect ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"
                    }`}
                  >
                    {d.isCorrect ? "✓ Correct" : "✗ Wrong"}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-white/60">
                    Your answer:{" "}
                    <span className={`font-semibold ${d.isCorrect ? "text-emerald-300" : "text-red-300"}`}>
                      {d.userAnswer || "—"}
                    </span>
                  </p>
                  {!d.isCorrect && (
                    <p className="text-white/60">
                      Correct:{" "}
                      <span className="font-semibold text-emerald-300">{d.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
