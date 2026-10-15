"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiDollarSign, FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import {
  Badge,
  Box,
  Button,
  ChooseBranchNotice,
  ConfirmDialog,
  DataTable,
  PageHeader,
  Select,
  errorMessage,
  notify,
} from "@/components/admin/ui";
import { useWriteBranch } from "@/hooks/useWriteBranch";
import { localDateString } from "@/lib/dates";
import { queryKeys } from "@/lib/queryKeys";
import { classesService } from "@/services/classes.service";
import { feesService } from "@/services/fees.service";
import { studentsService } from "@/services/students.service";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";
import StudentFormDrawer from "./StudentFormDrawer";
import { EMPTY_STUDENT, GENDERS, feeStatusByStudent, filterStudents, sectionsFor, toFormValues } from "./studentForm";

const NO_FILTERS = { className: "", section: "", gender: "" };
const FEE_BADGES = { paid: ["success", "feePaid"], partial: ["warning", "feePartial"], unpaid: ["danger", "feeUnpaid"] };

const fullName = (s) => `${s.FirstName} ${s.LastName}`;
const listOf = (body) => body?.data ?? (Array.isArray(body) ? body : []);

function FilterSelect({ label, ...props }) {
  return (
    <label className="flex items-center">
      <span className="sr-only">{label}</span>
      <Select className="w-auto" {...props} />
    </label>
  );
}

export default function AdminPage() {
  const t = useTranslations("admin.students");
  const qc = useQueryClient();
  const branchId = useBranchStore((s) => s.currentBranchId);
  const { needsBranch } = useWriteBranch();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, student = edit
  const [deleting, setDeleting] = useState(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: queryKeys.students.all(branchId),
    queryFn: studentsService.getAll,
    select: listOf,
  });
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.distinct(branchId),
    queryFn: classesService.getDistinct,
    select: listOf,
  });

  // This month's invoices drive the fee status column.
  const [year, month] = localDateString().split("-").map(Number);
  const period = { year, month };
  const { data: feeStatus = new Map() } = useQuery({
    queryKey: queryKeys.fees.invoices(period, branchId),
    queryFn: () => feesService.getInvoices(period),
    select: (body) => feeStatusByStudent(listOf(body)),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.students.all(branchId) });
  const save = useMutation({
    mutationFn: ({ id, data }) => (id ? studentsService.update(id, data) : studentsService.create(data)),
  });
  const remove = useMutation({ mutationFn: (id) => studentsService.remove(id) });

  const handleSave = async (data) => {
    try {
      await save.mutateAsync({ id: editing?.StudentID, data });
    } catch (error) {
      throw errorMessage(error, t("operationFailed"));
    }
    notify.success(editing?.StudentID ? t("studentUpdated") : t("studentAdded"));
    setEditing(null);
    refresh();
  };

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(deleting.StudentID);
      notify.success(t("deleted"));
      refresh();
    } catch (error) {
      notify.error(errorMessage(error, t("operationFailed")));
    } finally {
      setDeleting(null);
    }
  };

  const classNames = useMemo(() => [...new Set(classes.map((c) => c.ClassName).filter(Boolean))].sort(), [classes]);
  const rows = useMemo(() => filterStudents(students, filters), [students, filters]);
  const setFilter = (name) => (event) =>
    setFilters((previous) => ({ ...previous, [name]: event.target.value, ...(name === "className" ? { section: "" } : {}) }));

  const feeBadge = (student) => {
    const invoice = feeStatus.get(student.StudentID);
    if (!invoice) return <Badge>{t("notBilled")}</Badge>;
    const [tone, key] = FEE_BADGES[invoice.status] ?? FEE_BADGES.unpaid;
    return <Badge tone={tone}>{t(key)}</Badge>;
  };

  const columns = [
    { key: "name", header: t("name"), sortable: true, sortValue: fullName, render: (s) => <span className="font-medium text-slate-800">{fullName(s)}</span> },
    { key: "ClassName", header: t("class"), sortable: true },
    { key: "Section", header: t("section"), sortable: true },
    { key: "RollNumber", header: t("rollNumber"), sortable: true, sortValue: (s) => Number(s.RollNumber) || s.RollNumber },
    { key: "Gender", header: t("gender"), render: (s) => t(String(s.Gender).toLowerCase()) },
    { key: "ParentContact", header: t("contact"), render: (s) => s.ParentContact || "—" },
    { key: "fee", header: t("feeThisMonth"), render: feeBadge },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (s) => (
        <div className="inline-flex gap-1">
          {!needsBranch && (
            <Button size="sm" icon={FiEdit2} onClick={() => setEditing(s)} aria-label={t("edit")} title={t("edit")} />
          )}
          <Link
            href={`/admin/fees/students/${s.StudentID}`}
            prefetch={false}
            aria-label={t("feeLedger")}
            title={t("feeLedger")}
            className="admin-btn admin-btn-default admin-btn-sm no-underline"
          >
            <FiDollarSign aria-hidden="true" />
          </Link>
          {!needsBranch && (
            <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => setDeleting(s)} aria-label={t("delete")} title={t("delete")} />
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
          !needsBranch && (
            <Button variant="primary" icon={FiUserPlus} onClick={() => setEditing({})}>
              {t("addStudent")}
            </Button>
          )
        }
      />

      {needsBranch && <ChooseBranchNotice />}

      <Box title={t("allStudents")} tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="StudentID"
          loading={isLoading}
          emptyText={t("noStudents")}
          searchable
          searchText={(s) => `${fullName(s)} ${s.RollNumber}`}
          toolbar={
            <>
              <FilterSelect label={t("class")} value={filters.className} onChange={setFilter("className")} options={classNames} placeholder={t("allClasses")} />
              <FilterSelect
                label={t("section")}
                value={filters.section}
                onChange={setFilter("section")}
                options={sectionsFor(classes, filters.className)}
                placeholder={t("allSections")}
                disabled={!filters.className}
              />
              <FilterSelect
                label={t("gender")}
                value={filters.gender}
                onChange={setFilter("gender")}
                options={GENDERS.map((g) => ({ value: g, label: t(g.toLowerCase()) }))}
                placeholder={t("allGenders")}
              />
            </>
          }
        />
      </Box>

      {editing && (
        <StudentFormDrawer
          open
          key={editing.StudentID ?? "new"}
          initialValues={editing.StudentID ? toFormValues(editing) : EMPTY_STUDENT}
          editId={editing.StudentID ?? null}
          students={students}
          classes={classes}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("deleteConfirm")}
        confirmLabel={t("delete")}
        busy={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      >
        {deleting && <p className="m-0"><strong>{fullName(deleting)}</strong> — {t("deleteConfirmBody")}</p>}
      </ConfirmDialog>
    </div>
  );
}
