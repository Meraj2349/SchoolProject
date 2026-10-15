"use client";

import { useState } from "react";
import { Badge, Box, DataTable, PageHeader } from "@/components/admin/ui";
import { formatDuration, letterGrade } from "@/lib/quizGrade";
import { classLabel } from "@/lib/schoolClass";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import ClassFilter from "./ClassFilter";
import { useQuizSessions } from "./useQuiz";

const PAGE_SIZE = 25;
const GRADE_TONES = { A: "success", B: "success", C: "info", D: "warning", F: "danger" };

const formatWhen = (value, language) =>
  value
    ? new Date(value).toLocaleString(language === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeStyle: "short" })
    : "—";

/** Every quiz taken in the selected branch, newest first. */
export default function QuizResultsPage() {
  const t = useTranslations("admin.quiz");
  const language = useLanguageStore((s) => s.language);
  const [classKey, setClassKey] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuizSessions({ ...(classKey ? { classKey } : {}), page, pageSize: PAGE_SIZE });

  const columns = [
    { key: "when", header: t("when"), render: (s) => <span className="whitespace-nowrap">{formatWhen(s.CompletedAt, language)}</span> },
    { key: "StudentName", header: t("student"), render: (s) => <span className="font-medium text-slate-800">{s.StudentName}</span> },
    { key: "StudentRoll", header: t("roll"), render: (s) => s.StudentRoll ?? "—" },
    {
      key: "class",
      header: t("class"),
      render: (s) => [classLabel(s.ClassKey, language) || s.ClassName, s.Section].filter(Boolean).join(" · "),
    },
    { key: "Subject", header: t("subject"), render: (s) => s.Subject ?? t("allSubjectsShort") },
    {
      key: "score",
      header: t("score"),
      align: "right",
      render: (s) => `${s.CorrectAnswers}/${s.TotalQuestions} (${Math.round(s.ScorePercentage)}%)`,
    },
    {
      key: "grade",
      header: t("grade"),
      align: "center",
      render: (s) => {
        const grade = letterGrade(s.ScorePercentage);
        return <Badge tone={GRADE_TONES[grade]}>{grade}</Badge>;
      },
    },
    { key: "time", header: t("time"), align: "right", render: (s) => formatDuration(s.TimeTakenSeconds) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={t("resultsTitle")} subtitle={t("resultsSubtitle")} />
      <Box title={t("sessions")} tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey="SessionID"
          loading={isLoading}
          emptyText={t("noSessions")}
          toolbar={
            <ClassFilter
              value={classKey}
              onChange={(event) => {
                setClassKey(event.target.value);
                setPage(1);
              }}
            />
          }
          pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }}
        />
      </Box>
    </div>
  );
}
