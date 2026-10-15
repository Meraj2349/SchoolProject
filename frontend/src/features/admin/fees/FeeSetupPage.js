"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Badge, Box, Button, ConfirmDialog, DataTable, Field, Input, MoneyText, PageHeader, Select, Tabs, errorMessage, notify } from "@/components/admin/ui";
import { queryKeys } from "@/lib/queryKeys";
import { classesService } from "@/services/classes.service";
import { feesService } from "@/services/fees.service";
import { useTranslations } from "@/store/languageStore";
import ChooseBranchNotice from "./ChooseBranchNotice";
import { currentPeriod } from "./currentPeriod";
import { yearOptions } from "./feeRules";
import FormDrawer from "./FormDrawer";
import { useFeeBranch, useFeeMutation, useFeeSettings, useHeads, useStructures } from "./useFees";

const amountText = (value) => (value == null || value === "" ? "" : String(Number(value)));
const isActive = (head) => head.active === true || Number(head.active) === 1;

/** Shared "edit / delete" plumbing for the tuition and fee-head tables. */
function useCrud({ create, update, remove }) {
  const t = useTranslations("admin.fees");
  const [editing, setEditing] = useState(null); // null closed, {} new, row = edit
  const [deleting, setDeleting] = useState(null);
  const save = useFeeMutation(({ id, data }) => (id ? update(id, data) : create(data)));
  const destroy = useFeeMutation(remove);

  return {
    editing,
    deleting,
    startAdd: () => setEditing({}),
    startEdit: setEditing,
    startDelete: setDeleting,
    close: () => setEditing(null),
    async submit(data) {
      await save.mutateAsync({ id: editing?.id, data });
      notify.success(t("saved"));
      setEditing(null);
    },
    deleteDialog: (
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("deleteTitle")}
        confirmLabel={t("delete")}
        busy={destroy.isPending}
        onConfirm={async () => {
          try {
            await destroy.mutateAsync(deleting.id);
            notify.success(t("deleted"));
          } catch (error) {
            notify.error(errorMessage(error, t("loadFailed")));
          } finally {
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    ),
  };
}

const rowActions = (t, crud) => ({
  key: "actions",
  header: t("actions"),
  align: "right",
  render: (row) => (
    <div className="inline-flex gap-1">
      <Button size="sm" icon={FiEdit2} aria-label={t("edit")} title={t("edit")} onClick={() => crud.startEdit(row)} />
      <Button size="sm" variant="danger" icon={FiTrash2} aria-label={t("delete")} title={t("delete")} onClick={() => crud.startDelete(row)} />
    </div>
  ),
});

function TuitionTab({ t }) {
  const [year, setYear] = useState(currentPeriod().year);
  const { data: structures = [], isLoading } = useStructures(year, { enabled: true });
  const { data: classNames = [] } = useQuery({
    queryKey: queryKeys.classes.names(),
    queryFn: classesService.getNames,
    select: (d) => (Array.isArray(d) ? d : (d?.data ?? [])),
  });
  const crud = useCrud({ create: feesService.createStructure, update: feesService.updateStructure, remove: feesService.deleteStructure });

  const columns = [
    { key: "class_name", header: t("className"), sortable: true },
    { key: "academic_year", header: t("academicYear") },
    { key: "monthly_tuition", header: t("monthlyTuition"), align: "right", sortable: true, sortValue: (s) => Number(s.monthly_tuition), render: (s) => <MoneyText amount={s.monthly_tuition} /> },
    rowActions(t, crud),
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label className="flex items-center gap-2 text-sm">
          {t("academicYear")}
          <Select className="w-auto" value={year} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions(currentPeriod().year)} />
        </label>
        <Button variant="primary" icon={FiPlus} onClick={crud.startAdd}>
          {t("addTuition")}
        </Button>
      </div>
      <DataTable columns={columns} rows={structures} loading={isLoading} emptyText={t("noTuition")} />
      {crud.editing && (
        <FormDrawer
          title={crud.editing.id ? t("editTuition") : t("addTuition")}
          initialValues={{
            class_name: crud.editing.class_name ?? "",
            academic_year: String(crud.editing.academic_year ?? year),
            monthly_tuition: amountText(crud.editing.monthly_tuition),
          }}
          fields={[
            { name: "class_name", label: t("className"), type: "select", options: classNames, required: true },
            { name: "academic_year", label: t("academicYear"), type: "number", required: true },
            { name: "monthly_tuition", label: t("monthlyTuition"), type: "number", required: true },
          ]}
          onSubmit={crud.submit}
          onClose={crud.close}
        />
      )}
      {crud.deleteDialog}
    </>
  );
}

function HeadsTab({ t }) {
  const { data: heads = [], isLoading } = useHeads();
  const crud = useCrud({ create: feesService.createHead, update: feesService.updateHead, remove: feesService.deleteHead });

  const columns = [
    { key: "name_en", header: t("headName"), sortable: true },
    { key: "name_bn", header: t("headNameBn") },
    { key: "default_amount", header: t("defaultAmount"), align: "right", render: (h) => <MoneyText amount={h.default_amount} /> },
    { key: "active", header: t("status"), render: (h) => <Badge tone={isActive(h) ? "success" : "default"}>{isActive(h) ? t("active") : t("inactive")}</Badge> },
    rowActions(t, crud),
  ];

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button variant="primary" icon={FiPlus} onClick={crud.startAdd}>
          {t("addHead")}
        </Button>
      </div>
      <DataTable columns={columns} rows={heads} loading={isLoading} emptyText={t("noHeads")} />
      {crud.editing && (
        <FormDrawer
          title={crud.editing.id ? t("editHead") : t("addHead")}
          initialValues={{
            name_en: crud.editing.name_en ?? "",
            name_bn: crud.editing.name_bn ?? "",
            default_amount: amountText(crud.editing.default_amount),
            active: crud.editing.id ? isActive(crud.editing) : true,
          }}
          fields={[
            { name: "name_en", label: t("headName"), required: true },
            { name: "name_bn", label: t("headNameBn") },
            { name: "default_amount", label: t("defaultAmount"), type: "number", required: true },
            { name: "active", label: t("active"), type: "checkbox" },
          ]}
          onSubmit={crud.submit}
          onClose={crud.close}
        />
      )}
      {crud.deleteDialog}
    </>
  );
}

function SettingsForm({ settings, t }) {
  const [values, setValues] = useState({
    due_day: String(settings.due_day),
    late_fine: amountText(settings.late_fine),
    receipt_prefix: settings.receipt_prefix,
  });
  const [saveError, setSaveError] = useState(null);
  const save = useFeeMutation(feesService.updateSettings);
  const set = (field) => (event) => setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaveError(null);
    try {
      await save.mutateAsync(values);
      notify.success(t("saved"));
    } catch (error) {
      setSaveError(errorMessage(error, t("loadFailed")));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-md">
      {saveError && <div role="alert" className="error-message">{saveError}</div>}
      <Field label={t("dueDay")} required help={t("dueDayHelp")}>
        {(a11y) => <Input {...a11y} inputMode="numeric" value={values.due_day} onChange={set("due_day")} />}
      </Field>
      <Field label={t("lateFine")} required>
        {(a11y) => <Input {...a11y} inputMode="decimal" value={values.late_fine} onChange={set("late_fine")} />}
      </Field>
      <Field label={t("receiptPrefix")} required help={t("receiptPrefixHelp")}>
        {(a11y) => <Input {...a11y} value={values.receipt_prefix} onChange={set("receipt_prefix")} />}
      </Field>
      <Button variant="primary" type="submit" disabled={save.isPending}>
        {t("save")}
      </Button>
    </form>
  );
}

function SettingsTab({ t }) {
  const { branchId } = useFeeBranch();
  const { data: settings } = useFeeSettings({ enabled: true });
  // key: a new branch gets a fresh form; its state is copied from `settings` once.
  return settings ? <SettingsForm key={branchId} settings={settings} t={t} /> : <p role="status">…</p>;
}

export default function FeeSetupPage() {
  const t = useTranslations("admin.fees");
  const { needsBranch } = useFeeBranch();

  return (
    <div className="space-y-4">
      <PageHeader title={t("setupTitle")} subtitle={t("setupSubtitle")} />
      {needsBranch ? (
        <ChooseBranchNotice />
      ) : (
        <Box tone="primary">
          <Tabs
            tabs={[
              { key: "tuition", label: t("tuitionTab"), content: <TuitionTab t={t} /> },
              { key: "heads", label: t("headsTab"), content: <HeadsTab t={t} /> },
              { key: "settings", label: t("settingsTab"), content: <SettingsTab t={t} /> },
            ]}
          />
        </Box>
      )}
    </div>
  );
}
