"use client";

import { useState } from "react";
import { FiAward, FiEdit2, FiTrash2 } from "react-icons/fi";
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
import { useAllAchievements, useDeleteAchievement, useSaveAchievement, useSetAchievementPublished } from "@/hooks/useAchievements";
import { resultSummary } from "@/lib/achievements";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import AchievementFormDrawer from "./AchievementFormDrawer";
import { EMPTY_ACHIEVEMENT, toAchievementFormData, toFormValues } from "./achievementForm";

/** The honours board's achievements: results, prizes and awards, per branch or whole school. */
export default function AchievementsPage() {
  const t = useTranslations("admin.achievements");
  const tShared = useTranslations("achievements");
  const language = useLanguageStore((s) => s.language);
  const { canManage } = useContentScope();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, achievement = edit
  const [removing, setRemoving] = useState(null);

  const { data: achievements = [], isLoading } = useAllAchievements();
  const save = useSaveAchievement();
  const setPublished = useSetAchievementPublished();
  const remove = useDeleteAchievement();

  const titleOf = (a) => (language === "bn" ? a.title_bn || a.title_en : a.title_en || a.title_bn);

  const handleSave = async (form, photo) => {
    try {
      await save.mutateAsync({ id: editing?.id, formData: toAchievementFormData(form, photo) });
    } catch (error) {
      throw errorMessage(error, t("operationFailed"));
    }
    notify.success(editing?.id ? t("updated") : t("added"));
    setEditing(null);
  };

  const togglePublished = async (a) => {
    try {
      await setPublished.mutateAsync({ id: a.id, isPublished: !a.is_published });
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
    {
      key: "title",
      header: t("title_en"),
      sortable: true,
      sortValue: titleOf,
      render: (a) => (
        <span className="inline-flex flex-wrap items-center gap-2 font-medium text-slate-800">
          {titleOf(a)}
          {Boolean(a.is_featured) && <Badge tone="warning">{t("featured")}</Badge>}
        </span>
      ),
    },
    { key: "category", header: t("category"), sortable: true, render: (a) => <Badge tone="primary">{tShared(`categories.${a.category}`)}</Badge> },
    { key: "year", header: t("year"), sortable: true },
    { key: "result", header: t("result"), render: (a) => resultSummary(a, tShared) || "—" },
    { key: "branch", header: t("branch"), render: (a) => <ContentScopeBadge branchId={a.branch_id} /> },
    {
      key: "is_published",
      header: t("published"),
      render: (a) => (
        <Button size="sm" disabled={!canManage(a)} onClick={() => togglePublished(a)}>
          {a.is_published ? t("published") : t("hidden")}
        </Button>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (a) =>
        canManage(a) ? (
          <div className="inline-flex gap-1">
            <Button size="sm" icon={FiEdit2} onClick={() => setEditing(a)} aria-label={t("edit")} title={t("edit")} />
            <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => setRemoving(a)} aria-label={t("delete")} title={t("delete")} />
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
          <Button variant="primary" icon={FiAward} onClick={() => setEditing({})}>
            {t("addAchievement")}
          </Button>
        }
      />
      <NewContentScopeNote />

      <Box title={t("allAchievements")} tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={achievements}
          rowKey="id"
          loading={isLoading}
          emptyText={t("noAchievements")}
          searchable
          searchText={(a) => `${a.title_en} ${a.title_bn} ${a.year}`}
        />
      </Box>

      {editing && (
        <AchievementFormDrawer
          key={editing.id ?? "new"}
          isNew={!editing.id}
          initialValues={editing.id ? toFormValues(editing) : EMPTY_ACHIEVEMENT}
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
            <strong>{titleOf(removing)}</strong> — {t("deleteConfirmBody")}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
