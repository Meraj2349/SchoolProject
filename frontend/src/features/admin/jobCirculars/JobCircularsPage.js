"use client";

import { useState } from "react";
import Link from "next/link";
import { FiBriefcase, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  Badge,
  Box,
  Button,
  ConfirmDialog,
  ContentScopeBadge,
  DataTable,
  NewContentScopeNote,
  NotYoursMark,
  PageHeader,
  errorMessage,
  notify,
} from "@/components/admin/ui";
import { useContentScope } from "@/hooks/useContentScope";
import { useJobApplicationCounts } from "@/hooks/useJobApplications";
import { useAllJobCirculars, useDeleteJobCircular, useSaveJobCircular, useSetJobCircularPublished } from "@/hooks/useJobCirculars";
import { formatDate, localized } from "@/lib/homePage";
import { fillTemplate } from "@/lib/template";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import JobCircularFormDrawer from "./JobCircularFormDrawer";
import { emptyCircular, toCircularFormData, toFormValues } from "./jobCircularForm";

/** Job circulars (নিয়োগ বিজ্ঞপ্তি) per branch or for the whole school, and how many have applied. */
export default function JobCircularsPage() {
  const t = useTranslations("admin.jobCirculars");
  const language = useLanguageStore((s) => s.language);
  const { canManage } = useContentScope();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, circular = edit
  const [removing, setRemoving] = useState(null);

  const { data: circulars = [], isLoading } = useAllJobCirculars();
  const { data: counts = {} } = useJobApplicationCounts();
  const save = useSaveJobCircular();
  const setPublished = useSetJobCircularPublished();
  const remove = useDeleteJobCircular();

  const titleOf = (c) => localized(c, "title", language);
  const countOf = (c) => counts[c.id] ?? 0;

  const handleSave = async (form, poster) => {
    try {
      await save.mutateAsync({ id: editing?.id, formData: toCircularFormData(form, poster) });
    } catch (error) {
      throw errorMessage(error, t("operationFailed"));
    }
    notify.success(editing?.id ? t("updated") : t("added"));
    setEditing(null);
  };

  const togglePublished = async (c) => {
    try {
      await setPublished.mutateAsync({ id: c.id, isPublished: !c.is_published });
    } catch (error) {
      notify.error(errorMessage(error, t("operationFailed")));
    }
  };

  const handleRemove = async () => {
    try {
      await remove.mutateAsync(removing.id);
      notify.success(t("deleted"));
    } catch (error) {
      notify.error(errorMessage(error, t("operationFailed")));
    } finally {
      setRemoving(null);
    }
  };

  const columns = [
    { key: "title", header: t("titleColumn"), sortable: true, sortValue: titleOf, render: (c) => <span className="font-medium text-slate-800">{titleOf(c)}</span> },
    { key: "circular_date", header: t("circularDate"), sortable: true, render: (c) => formatDate(c.circular_date, language) },
    { key: "deadline", header: t("deadline"), render: (c) => formatDate(c.deadline, language) || "—" },
    { key: "posts", header: t("posts"), render: (c) => c.posts.map((p) => localized(p, "title", language)).join(", ") },
    { key: "status", header: t("status"), render: (c) => <Badge tone={c.accepting ? "success" : "default"}>{c.accepting ? t("openLabel") : t("closedLabel")}</Badge> },
    {
      key: "applications",
      header: t("applications"),
      align: "right",
      render: (c) => (
        <Link href={`/admin/job-applications?circular=${c.id}`} className="font-semibold text-blue-700 hover:underline" title={t("viewApplications")}>
          {countOf(c)}
        </Link>
      ),
    },
    { key: "branch", header: t("branch"), render: (c) => <ContentScopeBadge branchId={c.branch_id} /> },
    {
      key: "is_published",
      header: t("published"),
      render: (c) => (
        <Button size="sm" disabled={!canManage(c)} onClick={() => togglePublished(c)}>
          {c.is_published ? t("published") : t("hidden")}
        </Button>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (c) =>
        canManage(c) ? (
          <div className="inline-flex gap-1">
            <Button size="sm" icon={FiEdit2} onClick={() => setEditing(c)} aria-label={t("editAction")} title={t("edit")} />
            <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => setRemoving(c)} aria-label={t("delete")} title={t("delete")} />
          </div>
        ) : (
          <NotYoursMark />
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button variant="primary" icon={FiBriefcase} onClick={() => setEditing({})}>
            {t("add")}
          </Button>
        }
      />
      <NewContentScopeNote />

      <Box title={t("all")} tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={circulars}
          rowKey="id"
          loading={isLoading}
          emptyText={t("none")}
          searchable
          searchText={(c) => `${c.title_en} ${c.title_bn} ${c.posts.map((p) => `${p.title_en} ${p.title_bn}`).join(" ")}`}
        />
      </Box>

      {editing && (
        <JobCircularFormDrawer
          key={editing.id ?? "new"}
          isNew={!editing.id}
          initialValues={editing.id ? toFormValues(editing) : emptyCircular()}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        title={t("deleteConfirm")}
        confirmLabel={t("delete")}
        busy={remove.isPending}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      >
        {removing && (
          <p className="m-0">
            <strong>{titleOf(removing)}</strong> — {fillTemplate(t("deleteConfirmBody"), { count: countOf(removing) })}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
