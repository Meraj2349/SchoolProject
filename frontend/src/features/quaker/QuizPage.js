"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fillTemplate } from "@/lib/template";
import { isQuizSessionExpired, quizErrorMessage, quizService, quizTokenHolder } from "@/services/quiz.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import QuizPlayer from "./QuizPlayer";
import QuizResults from "./QuizResults";
import QuizSetup from "./QuizSetup";

const START_PAGE = "/quaker/start";

/** The student's quiz: choose (setup) → answer (playing) → score (results). */
export default function QuizPage() {
  const router = useRouter();
  const t = useTranslations("quiz");
  const siteLanguage = useLanguageStore((s) => s.language);
  const student = useQuizSessionStore((s) => s.student);

  const [phase, setPhase] = useState("setup");
  const [meta, setMeta] = useState(null);
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [questionLanguage, setQuestionLanguage] = useState(siteLanguage);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const startedAt = useRef(0);
  const shownAt = useRef(0);
  const secondsOn = useRef({});

  // A failed call: back to the identity form if the quiz token has expired.
  const handleError = (failure, fallbackKey) => {
    if (isQuizSessionExpired(failure)) {
      router.replace(START_PAGE);
      return;
    }
    setError(quizErrorMessage(failure, t(fallbackKey)));
  };

  useEffect(() => {
    if (!quizTokenHolder.get()) {
      router.replace(START_PAGE);
      return;
    }
    quizService
      .getMeta()
      .then(setMeta)
      .catch((failure) => handleError(failure, "failedToLoad"));
    // Load once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seconds spent on the question being left, added to its total.
  const leaveQuestion = () => {
    const id = questions[current]?.id;
    if (id == null) return;
    secondsOn.current[id] = (secondsOn.current[id] ?? 0) + Math.round((Date.now() - shownAt.current) / 1000);
    shownAt.current = Date.now();
  };

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const quiz = await quizService.start({ subject, count });
      setQuestions(quiz.questions);
      setCurrent(0);
      setAnswers({});
      secondsOn.current = {};
      startedAt.current = Date.now();
      shownAt.current = Date.now();
      setQuestionLanguage(siteLanguage);
      setPhase("playing");
    } catch (failure) {
      handleError(failure, "failedToLoad");
    } finally {
      setBusy(false);
    }
  };

  const move = (step) => {
    leaveQuestion();
    setCurrent((index) => Math.min(Math.max(index + step, 0), questions.length - 1));
  };

  const submit = async () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0 && !window.confirm(fillTemplate(t("unansweredWarning"), { count: unanswered }))) return;
    leaveQuestion();
    setBusy(true);
    setError("");
    try {
      const finished = await quizService.finish({
        answers: questions.map((q) => ({
          questionId: q.id,
          userAnswer: answers[q.id] ?? "",
          timeSpentSeconds: secondsOn.current[q.id] ?? 0,
        })),
        timeTakenSeconds: Math.round((Date.now() - startedAt.current) / 1000),
      });
      setResult(finished);
      setPhase("results");
    } catch (failure) {
      handleError(failure, "failedToSubmit");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "playing") {
    return (
      <QuizPlayer
        questions={questions}
        current={current}
        answers={answers}
        questionLanguage={questionLanguage}
        onQuestionLanguage={setQuestionLanguage}
        onAnswer={(id, letter) => setAnswers((previous) => ({ ...previous, [id]: letter }))}
        onPrevious={() => move(-1)}
        onNext={() => move(1)}
        onSubmit={submit}
        submitting={busy}
        error={error}
      />
    );
  }

  if (phase === "results" && result) {
    return (
      <QuizResults
        result={result}
        questions={questions}
        questionLanguage={questionLanguage}
        onAgain={() => {
          setResult(null);
          setPhase("setup");
        }}
      />
    );
  }

  return (
    <QuizSetup
      student={student}
      meta={meta}
      language={siteLanguage}
      subject={subject}
      onSubject={setSubject}
      count={count}
      onCount={setCount}
      onStart={start}
      starting={busy}
      error={error}
    />
  );
}
