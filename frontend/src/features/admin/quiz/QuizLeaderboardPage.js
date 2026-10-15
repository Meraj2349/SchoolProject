"use client";

import { useState } from "react";
import { Box, DataTable, PageHeader } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";
import ClassFilter from "./ClassFilter";
import { useLeaderboard } from "./useQuiz";

const LIMIT = 50;

/** Students of the selected branch ranked by average quiz score. */
export default function QuizLeaderboardPage() {
  const t = useTranslations("admin.quiz");
  const [classKey, setClassKey] = useState("");
  const { data = [], isLoading } = useLeaderboard({ ...(classKey ? { classKey } : {}), limit: LIMIT });
  const rows = data.map((row, index) => ({ ...row, rank: index + 1 }));

  const columns = [
    { key: "rank", header: t("rank"), align: "center", render: (r) => <span className="font-bold">{r.rank}</span> },
    { key: "StudentName", header: t("student"), render: (r) => <span className="font-medium text-slate-800">{r.StudentName}</span> },
    { key: "StudentRoll", header: t("roll"), render: (r) => r.StudentRoll ?? "—" },
    { key: "class", header: t("class"), render: (r) => [r.ClassName, r.Section].filter(Boolean).join(" · ") },
    { key: "sessions", header: t("quizzes"), align: "right" },
    { key: "avgScore", header: t("average"), align: "right", render: (r) => `${Math.round(r.avgScore)}%` },
    { key: "bestScore", header: t("best"), align: "right", render: (r) => `${Math.round(r.bestScore)}%` },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={t("leaderboardTitle")} subtitle={t("leaderboardSubtitle")} />
      <Box title={t("leaderboardTitle")} tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="StudentID"
          loading={isLoading}
          emptyText={t("noLeaderboard")}
          pageSize={LIMIT}
          toolbar={<ClassFilter value={classKey} onChange={(event) => setClassKey(event.target.value)} />}
        />
      </Box>
    </div>
  );
}
