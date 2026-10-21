"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { Badge, Box, Field, Input, PageHeader, errorMessage } from "@/components/admin/ui";
import { useAttendanceOverview } from "@/hooks/useAttendance";
import { formatSchoolTime, schoolToday } from "@/lib/attendance";
import { branchName } from "@/lib/branches";
import { formatNumber } from "@/lib/homePage";
import { fillTemplate } from "@/lib/template";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { ClassTeacher } from "./ClassTeacher";

const COUNT_KEYS = ["present", "absent", "late", "leave"];

/** The mark page with this class and day already chosen. */
export const markPageHref = (classId, date) =>
  `/admin/attendance?${new URLSearchParams({ classId: String(classId), date })}`;

/** "Taken 09:15" and by whom, or a red "Not taken". */
function TakenState({ takenBy }) {
  const t = useTranslations("admin.attendance");
  const language = useLanguageStore((s) => s.language);
  if (!takenBy) return <Badge tone="danger">{t("notTakenShort")}</Badge>;
  return (
    <span className="flex flex-col items-start gap-0.5">
      <Badge tone="success">{fillTemplate(t("takenAt"), { time: formatSchoolTime(takenBy.at, language) })}</Badge>
      <span className="text-xs text-slate-500" title={takenBy.name ?? undefined}>
        {t(takenBy.type === "teacher" ? "takenByTeacher" : "takenByAdmin")}
      </span>
    </span>
  );
}

// On a phone each row becomes a card: the head row hides and every cell shows its
// label. (Not the shared .table-cell class: its name is also Tailwind's display utility.)
const CELL_BASE = "text-sm text-slate-700 md:table-cell md:px-5 md:border-b md:border-slate-100 md:py-3.5";
const LABEL = "before:text-xs before:font-semibold before:uppercase before:text-slate-500 before:content-[attr(data-label)] md:before:content-none";
const CELL = `${CELL_BASE} ${LABEL} col-span-4 flex items-center justify-between gap-3 px-5 py-1.5`;
// The four counts sit side by side on a phone, each under its label.
const COUNT_CELL = `${CELL_BASE} ${LABEL} flex flex-col items-center gap-0.5 px-1 py-2 md:text-center`;

function ClassesTable({ classes, date }) {
  const t = useTranslations("admin.attendance");
  const language = useLanguageStore((s) => s.language);
  const number = (n) => formatNumber(n, language);

  return (
    // relative: keeps the hidden "Open" header inside the box, not off the page edge.
    <div className="relative md:overflow-x-auto">
      <table className="block w-full border-collapse md:table">
        <thead className="hidden md:table-header-group">
          <tr>
            <th className="table-header">{t("class")}</th>
            <th className="table-header">{t("classTeacher")}</th>
            <th className="table-header">{t("status")}</th>
            {COUNT_KEYS.map((key) => (
              <th key={key} className="table-header text-center">
                {t(key)}
              </th>
            ))}
            <th className="table-header">
              <span className="sr-only">{t("open")}</span>
            </th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {classes.map((c) => {
            const title = `${c.name} — ${c.section}`;
            return (
              <tr key={c.id} className="mb-3 grid grid-cols-4 rounded border border-slate-200 py-1 last:mb-0 hover:bg-indigo-50/30 md:mb-0 md:table-row md:rounded-none md:border-0 md:py-0">
                <td className={`${CELL_BASE} col-span-4 block whitespace-nowrap px-5 py-2 font-semibold text-slate-800 md:font-medium`}>{title}</td>
                <td data-label={t("classTeacher")} className={`${CELL} text-sm`}>
                  <ClassTeacher classTeacher={c.classTeacher} />
                </td>
                <td data-label={t("status")} className={CELL}>
                  <TakenState takenBy={c.takenBy} />
                </td>
                {COUNT_KEYS.map((key) => (
                  <td
                    key={key}
                    data-label={t(key)}
                    className={`${COUNT_CELL} ${key === "absent" && c.counts?.absent ? "font-semibold text-red-600" : ""}`}
                  >
                    {c.takenBy ? number(c.counts?.[key]) : "—"}
                  </td>
                ))}
                <td className={`${CELL_BASE} col-span-4 block px-5 py-2`}>
                  <Link
                    href={markPageHref(c.id, date)}
                    aria-label={fillTemplate(t("openClass"), { class: title })}
                    className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-indigo-600 hover:underline"
                  >
                    {t("open")} <FiArrowRight aria-hidden />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BranchBox({ branch, date }) {
  const t = useTranslations("admin.attendance");
  const language = useLanguageStore((s) => s.language);
  const totals = Object.fromEntries(Object.entries(branch.totals ?? {}).map(([key, n]) => [key, formatNumber(n, language)]));

  return (
    <Box title={branchName(branch, language)} tools={<span className="text-xs text-slate-500">{fillTemplate(t("overviewTotals"), totals)}</span>}>
      {branch.classes.length === 0 ? (
        <p className="m-0 text-sm text-slate-500">{t("overviewNoClasses")}</p>
      ) : (
        <ClassesTable classes={branch.classes} date={date} />
      )}
    </Box>
  );
}

/** Admin — one day's attendance in every branch: which classes are taken, by whom, and the counts. */
export default function OverviewPage() {
  const t = useTranslations("admin.attendance");
  const [date, setDate] = useState(schoolToday);
  const { data, isLoading, isError, error } = useAttendanceOverview(date);
  const branches = data?.branches ?? [];

  return (
    <div className="space-y-4">
      <PageHeader title={t("overviewTitle")} subtitle={t("overviewSubtitle")} />

      <Box>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Field label={t("date")}>
            {(a11y) => <Input {...a11y} type="date" value={date} max={schoolToday()} onChange={(e) => setDate(e.target.value)} />}
          </Field>
        </div>
      </Box>

      {isLoading && <p className="text-sm text-slate-500">{t("loading")}</p>}
      {isError && <p className="error-message">{errorMessage(error, t("overviewLoadFailed"))}</p>}
      {data && branches.length === 0 && <p className="text-sm text-slate-500">{t("overviewNoBranches")}</p>}

      {branches.map((branch) => (
        <BranchBox key={branch.id} branch={branch} date={data.date ?? date} />
      ))}
    </div>
  );
}
