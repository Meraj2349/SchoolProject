"use client";

import { useState } from "react";
import { FiEdit2, FiEye, FiEyeOff, FiPlus } from "react-icons/fi";
import { Badge, Box, Button, DataTable, PageHeader, errorMessage, notify } from "@/components/admin/ui";
import MathText from "@/features/quaker/MathText";
import { localize } from "@/features/quaker/quizText";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import QuestionFormDrawer from "./QuestionFormDrawer";
import { emptyQuestion, toFormValues } from "./questionForm";
import ClassFilter, { FilterSelect } from "./ClassFilter";
import { useClassOptions, useQuestionSubjects, useQuestions, useSaveQuestion, useSetQuestionActive } from "./useQuiz";

const PAGE_SIZE = 25;
const NO_FILTERS = { classKey: "", subject: "", search: "", status: "active", page: 1 };

/** The quiz question bank: questions per class, shared by every branch. */
export default function QuestionBankPage() {
  const t = useTranslations("admin.quiz");
  const language = useLanguageStore((s) => s.language);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [searchText, setSearchText] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, question = edit

  const classes = useClassOptions();
  const { data: subjects = [] } = useQuestionSubjects(filters.classKey);
  const { data: page, isLoading } = useQuestions({ ...filters, pageSize: PAGE_SIZE });
  const save = useSaveQuestion();
  const setActive = useSetQuestionActive();

  const setFilter = (name) => (event) =>
    setFilters((previous) => ({
      ...previous,
      [name]: event.target.value,
      page: 1,
      ...(name === "classKey" ? { subject: "" } : {}),
    }));

  const handleSave = async (data) => {
    try {
      await save.mutateAsync({ id: editing?.id, data });
    } catch (error) {
      throw errorMessage(error, t("saveFailed"));
    }
    notify.success(editing?.id ? t("questionUpdated") : t("questionAdded"));
    setEditing(null);
  };

  const toggle = async (question) => {
    try {
      await setActive.mutateAsync({ id: question.id, active: !question.active });
      notify.success(question.active ? t("questionHidden") : t("questionShown"));
    } catch (error) {
      notify.error(errorMessage(error, t("saveFailed")));
    }
  };

  const columns = [
    {
      key: "prompt",
      header: t("question"),
      render: (q) => (
        <div className="max-w-xl">
          <MathText as="p" className="m-0 text-slate-800">
            {localize(q, language).prompt}
          </MathText>
          {q.promptBn && (
            <span className="mt-1 inline-block">
              <Badge tone="info">বাংলা</Badge>
            </span>
          )}
        </div>
      ),
    },
    { key: "subject", header: t("subject") },
    { key: "answer", header: t("answer"), align: "center" },
    {
      key: "active",
      header: t("status"),
      render: (q) => <Badge tone={q.active ? "success" : "default"}>{q.active ? t("shown") : t("hidden")}</Badge>,
    },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (q) => (
        <div className="inline-flex gap-1">
          <Button size="sm" icon={FiEdit2} onClick={() => setEditing(q)} aria-label={t("edit")} title={t("edit")} />
          <Button
            size="sm"
            icon={q.active ? FiEyeOff : FiEye}
            onClick={() => toggle(q)}
            aria-label={q.active ? t("hide") : t("show")}
            title={q.active ? t("hideHelp") : t("show")}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("bankTitle")}
        subtitle={t("bankSubtitle")}
        actions={
          <Button variant="primary" icon={FiPlus} onClick={() => setEditing({})}>
            {t("addQuestion")}
          </Button>
        }
      />

      <Box title={t("questions")} tone="primary" bodyClassName="">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-200">
          <ClassFilter value={filters.classKey} onChange={setFilter("classKey")} placeholder={t("selectClass")} />
          <FilterSelect
            label={t("subject")}
            value={filters.subject}
            onChange={setFilter("subject")}
            options={subjects.map((s) => ({ value: s.subject, label: `${s.subject} (${s.count})` }))}
            placeholder={t("allSubjects")}
            disabled={!filters.classKey}
          />
          <FilterSelect
            label={t("status")}
            value={filters.status}
            onChange={setFilter("status")}
            options={[
              { value: "active", label: t("shownOnly") },
              { value: "hidden", label: t("hiddenOnly") },
              { value: "all", label: t("allStatuses") },
            ]}
          />
          <form
            role="search"
            className="ml-auto"
            onSubmit={(event) => {
              event.preventDefault();
              setFilters((previous) => ({ ...previous, search: searchText.trim(), page: 1 }));
            }}
          >
            <input
              type="search"
              aria-label={t("searchQuestions")}
              placeholder={t("searchQuestions")}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="admin-input w-56"
            />
          </form>
        </div>

        {!filters.classKey ? (
          <p className="py-12 text-center text-sm text-slate-500 m-0">{t("chooseClassFirst")}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={page?.items ?? []}
            loading={isLoading}
            emptyText={t("noQuestions")}
            pagination={{
              page: filters.page,
              pageSize: PAGE_SIZE,
              total: page?.total ?? 0,
              onPageChange: (next) => setFilters((previous) => ({ ...previous, page: next })),
            }}
          />
        )}
      </Box>

      {editing && (
        <QuestionFormDrawer
          key={editing.id ?? "new"}
          isNew={!editing.id}
          initialValues={editing.id ? toFormValues(editing) : emptyQuestion(filters.classKey)}
          classes={classes}
          subjects={subjects}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
