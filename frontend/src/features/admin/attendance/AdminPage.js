"use client";

import { useMemo, useState } from "react";
import { FiCheckCircle, FiSave } from "react-icons/fi";
import { Badge, Box, Button, ChooseBranchNotice, Field, Input, PageHeader, Select, errorMessage, notify } from "@/components/admin/ui";
import { useAbsenceSms, useAttendanceRoster, useSaveAttendanceDay } from "@/hooks/useAttendance";
import { useClassNames, useClasses, useDistinctClasses } from "@/hooks/useClasses";
import { useWriteBranch } from "@/hooks/useWriteBranch";
import { ATTENDANCE_STATUSES, attendanceTotals, formatSchoolTime, schoolToday } from "@/lib/attendance";
import { branchName } from "@/lib/branches";
import { fillTemplate } from "@/lib/template";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { ClassTeacher } from "./ClassTeacher";

const STATUS_KEYS = { Present: "present", Absent: "absent", Late: "late", Leave: "leave" };
const SMS_TONES = { pending: "info", sending: "info", sent: "success", failed: "danger", cancelled: "default", skipped: "warning" };
const isDay = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** "Main Campus · Class teacher: Nasima Akter [App on]", under the class title. */
function ClassContext({ branch, classTeacher }) {
  const language = useLanguageStore((s) => s.language);
  const name = branchName(branch, language);
  return (
    <p className="mt-0 mb-3 flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
      {name && (
        <>
          <span className="font-medium text-slate-700">{name}</span>
          <span aria-hidden>·</span>
        </>
      )}
      <ClassTeacher classTeacher={classTeacher} labelled />
    </p>
  );
}

/** "Taken by Nasima Akter (class teacher) at 09:15", or that nobody has taken the day yet. */
function TakenBy({ takenBy }) {
  const t = useTranslations("admin.attendance");
  const language = useLanguageStore((s) => s.language);
  if (!takenBy) return <p className="m-0 text-sm text-slate-500">{t("notTaken")}</p>;
  return (
    <p className="m-0 flex items-center gap-1.5 text-sm text-slate-600">
      <FiCheckCircle aria-hidden className="text-emerald-600" />
      {fillTemplate(t("takenBy"), {
        name: takenBy.name ?? "—",
        role: t(takenBy.type === "teacher" ? "byTeacher" : "byAdmin"),
        time: formatSchoolTime(takenBy.at, language),
      })}
    </p>
  );
}

/** The day's SMS to parents of absent children in this class. */
function AbsenceSmsBox({ date, classId }) {
  const t = useTranslations("admin.attendance");
  const { data: messages = [] } = useAbsenceSms(date);
  const ofClass = messages.filter((m) => m.classId === classId);

  return (
    <Box title={t("smsTitle")}>
      <p className="mt-0 mb-3 text-sm text-slate-500">{t("smsHint")}</p>
      {ofClass.length === 0 ? (
        <p className="m-0 text-sm text-slate-500">{t("smsNone")}</p>
      ) : (
        <ul className="m-0 list-none space-y-2 p-0">
          {ofClass.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium text-slate-800">{m.studentName}</span>
              <span className="flex items-center gap-2">
                {m.status === "skipped" && m.error && (
                  <span className="text-xs text-slate-500">{t(`smsSkippedReasons.${m.error}`)}</span>
                )}
                <Badge tone={SMS_TONES[m.status] ?? "default"}>{t(`smsStatuses.${m.status}`)}</Badge>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
}

/**
 * The class's students with one status each. Changes are kept here until
 * saved; students nobody has marked yet start as Present.
 */
function RosterBox({ classId, day, canSave }) {
  const t = useTranslations("admin.attendance");
  const [edits, setEdits] = useState({});
  const save = useSaveAttendanceDay();
  const editable = canSave && day.editable;
  const statusOf = (student) => edits[student.studentId] ?? student.status ?? "Present";
  const totals = attendanceTotals(day.students.map(statusOf));

  const setAll = (status) => setEdits(Object.fromEntries(day.students.map((s) => [s.studentId, status])));

  const handleSave = async () => {
    try {
      const entries = day.students.map((s) => ({ studentId: s.studentId, status: statusOf(s) }));
      await save.mutateAsync({ classId, date: day.date, entries });
      setEdits({});
      notify.success(t("attendanceSaved"));
    } catch (error) {
      notify.error(errorMessage(error, t("saveFailed")));
    }
  };

  // Students someone changed after this page loaded: their newer status was kept.
  const keptCount = save.data?.data?.kept?.length ?? 0;

  return (
    <Box
      title={`${day.class.name} — ${day.class.section}`}
      tools={
        editable && (
          <>
            <Button onClick={() => setAll("Present")}>{t("allPresent")}</Button>
            <Button variant="primary" icon={FiSave} onClick={handleSave} disabled={save.isPending}>
              {save.isPending ? t("saving") : t("saveAttendance")}
            </Button>
          </>
        )
      }
    >
      <ClassContext branch={day.branch} classTeacher={day.classTeacher} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <TakenBy takenBy={day.takenBy} />
        <p className="m-0 text-sm font-medium text-slate-700">{fillTemplate(t("summary"), totals)}</p>
      </div>
      {keptCount > 0 && (
        <p role="status" className="mt-0 mb-3 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {fillTemplate(t("keptNewer"), { count: keptCount })}
        </p>
      )}
      {!day.editable && <p className="mt-0 mb-3 text-sm text-slate-500">{t("readOnly")}</p>}
      {day.students.length === 0 ? (
        <p className="m-0 text-sm text-slate-500">{t("noStudents")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="table-header">{t("roll")}</th>
                <th className="table-header">{t("name")}</th>
                {ATTENDANCE_STATUSES.map((status) => (
                  <th key={status} className="table-header text-center">
                    {t(STATUS_KEYS[status])}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {day.students.map((student) => (
                <tr key={student.studentId} className="hover:bg-indigo-50/30">
                  <td className="table-cell font-mono text-xs text-slate-500">{student.roll}</td>
                  <td className="table-cell font-medium text-slate-800">
                    {student.firstName} {student.lastName}
                  </td>
                  {ATTENDANCE_STATUSES.map((status) => (
                    <td key={status} className="table-cell text-center">
                      <input
                        type="radio"
                        name={`attendance-${student.studentId}`}
                        aria-label={t(STATUS_KEYS[status])}
                        checked={statusOf(student) === status}
                        onChange={() => setEdits((current) => ({ ...current, [student.studentId]: status }))}
                        disabled={!editable}
                        className="h-4 w-4 cursor-pointer accent-indigo-600"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}

/**
 * `initialClassId` / `initialDate` (from ?classId=&date=, e.g. the attendance
 * by branch page) open one class and day; picking another class goes back to
 * choosing by class name and section.
 */
export default function AdminPage({ initialClassId = null, initialDate = null }) {
  const t = useTranslations("admin.attendance");
  const { needsBranch } = useWriteBranch();
  const [filter, setFilter] = useState(() => ({
    classId: initialClassId ? String(initialClassId) : null,
    className: "",
    section: "",
    date: isDay(initialDate) ? initialDate : schoolToday(),
  }));

  const { data: classNames = [] } = useClassNames();
  const { data: distinctClasses = [] } = useDistinctClasses();
  const { data: classes = [] } = useClasses();

  // A class opened by id: its name and section fill the selects.
  const opened = filter.classId ? classes.find((c) => String(c.ClassID) === filter.classId) : null;
  const className = opened?.ClassName ?? filter.className;
  const section = opened?.Section ?? filter.section;

  const sections = useMemo(
    () => distinctClasses.filter((c) => c.ClassName === className).map((c) => c.Section).sort(),
    [distinctClasses, className],
  );

  // On "All branches" one class name and section can exist in several branches.
  const matches = opened ? [opened] : classes.filter((c) => c.ClassName === className && c.Section === section);
  const classId = matches.length === 1 ? matches[0].ClassID : null;
  const chosen = Boolean(className && section && filter.date);

  const { data: day, isFetching, isError, error } = useAttendanceRoster(classId, filter.date);

  const chooseClass = (className) => {
    const options = distinctClasses.filter((c) => c.ClassName === className).map((c) => c.Section);
    setFilter((f) => ({ ...f, classId: null, className, section: options.length === 1 ? options[0] : "" }));
  };

  return (
    <div className="space-y-4">
      <PageHeader title={t("markTitle")} subtitle={t("subtitle")} />

      {needsBranch && <ChooseBranchNotice />}

      <Box>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Field label={t("className")}>
            {(a11y) => (
              <Select {...a11y} value={className} onChange={(e) => chooseClass(e.target.value)} placeholder={t("className")} options={classNames} />
            )}
          </Field>
          <Field label={t("section")}>
            {(a11y) => (
              <Select
                {...a11y}
                value={section}
                onChange={(e) => setFilter((f) => ({ ...f, classId: null, className, section: e.target.value }))}
                placeholder={t("section")}
                options={sections}
                disabled={!className}
              />
            )}
          </Field>
          <Field label={t("date")}>
            {(a11y) => (
              <Input
                {...a11y}
                type="date"
                value={filter.date}
                max={schoolToday()}
                onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
              />
            )}
          </Field>
        </div>
      </Box>

      {!chosen && <p className="text-sm text-slate-500">{t("pickClass")}</p>}
      {chosen && matches.length === 0 && classes.length > 0 && <p className="text-sm text-slate-500">{t("classNotFound")}</p>}
      {chosen && matches.length > 1 && <ChooseBranchNotice />}
      {classId && isFetching && !day && <p className="text-sm text-slate-500">{t("loading")}</p>}
      {classId && isError && <p className="error-message">{errorMessage(error, t("loadFailed"))}</p>}

      {classId && day && (
        // min-w-0: let the columns shrink so a wide table scrolls inside its box, not the page.
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] [&>*]:min-w-0">
          <RosterBox key={`${classId}-${day.date}`} classId={classId} day={day} canSave={!needsBranch} />
          <AbsenceSmsBox date={day.date} classId={day.class.id} />
        </div>
      )}
    </div>
  );
}
