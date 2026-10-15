"use client";

import { useMemo, useState } from "react";
import { FiAlertTriangle, FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import { Badge, Box, Button, ConfirmDialog, DataTable, PageHeader, Select, errorMessage, notify } from "@/components/admin/ui";
import { adminsService } from "@/services/admins.service";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import AdminFormDrawer from "./AdminFormDrawer";
import { EMPTY_ADMIN, SUPER_ADMINS, branchesWithoutAdmin, filterAdmins, toAdminPayload, toFormValues } from "./adminForm";
import { useAdminMutation, useAdmins, useBranches } from "./useAdmins";

const ROLE_TONES = { super_admin: "primary", branch_admin: "info" };

export default function AdminsPage() {
  const t = useTranslations("admin.admins");
  const language = useLanguageStore((s) => s.language);
  const isSuperAdmin = useAuthStore((s) => s.role) === "super_admin";
  const [branchFilter, setBranchFilter] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, admin = edit
  const [removing, setRemoving] = useState(null);

  const { data: admins = [], isLoading } = useAdmins({ enabled: isSuperAdmin });
  const { data: branches = [] } = useBranches({ enabled: isSuperAdmin });
  const save = useAdminMutation(({ id, data }) => (id ? adminsService.update(id, data) : adminsService.create(data)));
  const remove = useAdminMutation((id) => adminsService.remove(id));

  const branchName = (branch) =>
    (language === "bn" ? branch.name_bn || branch.name_en : branch.name_en || branch.name_bn) || `#${branch.id}`;
  const branchOptions = branches.map((b) => ({ value: String(b.id), label: branchName(b) }));
  const nameOfBranch = (admin) => {
    const branch = branches.find((b) => b.id === admin.branch_id);
    return branch ? branchName(branch) : admin.branch_name ?? "—";
  };

  const rows = useMemo(() => filterAdmins(admins, branchFilter), [admins, branchFilter]);
  const unmanaged = useMemo(() => branchesWithoutAdmin(admins, branches), [admins, branches]);

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <FiAlertTriangle className="text-5xl mb-4 text-amber-400" aria-hidden="true" />
        <p className="text-base font-medium">{t("superAdminOnly")}</p>
      </div>
    );
  }

  const handleSave = async (form) => {
    try {
      await save.mutateAsync({ id: editing?.id, data: toAdminPayload(form) });
    } catch (error) {
      throw errorMessage(error, t("operationFailed"));
    }
    notify.success(editing?.id ? t("adminUpdated") : t("adminAdded"));
    setEditing(null);
  };

  const handleRemove = async () => {
    try {
      await remove.mutateAsync(removing.id);
      notify.success(t("adminRemoved"));
    } catch (error) {
      notify.error(errorMessage(error, t("operationFailed")));
    } finally {
      setRemoving(null);
    }
  };

  const columns = [
    {
      key: "username",
      header: t("name"),
      sortable: true,
      render: (a) => (
        <span className="inline-flex items-center gap-2 font-medium text-slate-800">
          {a.username}
          {a.is_you && <Badge tone="success">{t("you")}</Badge>}
        </span>
      ),
    },
    { key: "email", header: t("email"), sortable: true },
    { key: "role", header: t("role"), sortable: true, render: (a) => <Badge tone={ROLE_TONES[a.role]}>{t(a.role)}</Badge> },
    {
      key: "branch",
      header: t("branch"),
      sortable: true,
      sortValue: (a) => (a.role === "super_admin" ? "" : nameOfBranch(a)),
      render: (a) => (a.role === "super_admin" ? <span className="text-slate-500">{t("allBranches")}</span> : nameOfBranch(a)),
    },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (a) => (
        <div className="inline-flex gap-1">
          <Button size="sm" icon={FiEdit2} onClick={() => setEditing(a)} aria-label={t("edit")} title={t("edit")} />
          {!a.is_you && (
            <Button
              size="sm"
              variant="danger"
              icon={FiTrash2}
              onClick={() => setRemoving(a)}
              aria-label={t("remove")}
              title={t("remove")}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button variant="primary" icon={FiUserPlus} onClick={() => setEditing({})}>
            {t("addAdmin")}
          </Button>
        }
      />

      {!isLoading && unmanaged.length > 0 && (
        <div
          role="note"
          className="flex items-center gap-2 px-4 py-3 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-sm"
        >
          <FiAlertTriangle aria-hidden="true" />
          <span>
            {t("branchesWithoutAdmin")} <strong>{unmanaged.map(branchName).join(", ")}</strong>
          </span>
        </div>
      )}

      <Box title={t("allAdmins")} tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={isLoading}
          emptyText={t("noAdmins")}
          searchable
          searchText={(a) => `${a.username} ${a.email}`}
          toolbar={
            <label className="flex items-center">
              <span className="sr-only">{t("branch")}</span>
              <Select
                className="w-auto"
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
                placeholder={t("everyone")}
                options={[{ value: SUPER_ADMINS, label: t("superAdminsOnly") }, ...branchOptions]}
              />
            </label>
          }
        />
      </Box>

      {editing && (
        <AdminFormDrawer
          key={editing.id ?? "new"}
          isNew={!editing.id}
          ownAccount={Boolean(editing.is_you)}
          initialValues={editing.id ? toFormValues(editing) : EMPTY_ADMIN}
          branchOptions={branchOptions}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        title={t("removeConfirm")}
        confirmLabel={t("remove")}
        busy={remove.isPending}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      >
        {removing && (
          <p className="m-0">
            <strong>{removing.username}</strong> ({removing.email}) — {t("removeConfirmBody")}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
