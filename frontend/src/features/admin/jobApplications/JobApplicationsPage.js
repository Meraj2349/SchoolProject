"use client";

import { useState } from "react";
import { FiDownload, FiEye, FiTrash2 } from "react-icons/fi";
import { Badge, Box, Button, ConfirmDialog, DataTable, Drawer, Field, PageHeader, Select, errorMessage, notify } from "@/components/admin/ui";
import { useDeleteJobApplication, useDownloadJobApplicationCv, useJobApplications, useSetJobApplicationStatus } from "@/hooks/useJobApplications";
import { useAllJobCirculars } from "@/hooks/useJobCirculars";
import { formatDate, localized } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const STATUSES = ["new", "shortlisted", "rejected", "hired"];
const STATUS_TONES = { new: "info", shortlisted: "warning", rejected: "default", hired: "success" };

/** Saves a Blob as a file: the CV comes through the API with the admin's token, so it cannot be a plain link. */
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000); // some browsers cancel the download if it goes at once
}

function ApplicationDrawer({ application, onClose, onStatus }) {
  const t = useTranslations("admin.jobApplications");
  const tJobs = useTranslations("jobs");
  const language = useLanguageStore((s) => s.language);
  const downloadCv = useDownloadJobApplicationCv();

  const download = async () => {
    try {
      const blob = await downloadCv.mutateAsync(application.id);
      const extension = (application.cv_file?.match(/\.\w+$/)?.[0] ?? "").toLowerCase();
      saveBlob(blob, `${application.full_name.replace(/\s+/g, "-")}-CV${extension}`);
    } catch {
      notify.error(t("downloadFailed"));
    }
  };

  const rows = [
    [t("post"), localized(application, "post_title", language)],
    [t("phone"), <a key="phone" href={`tel:${application.phone}`}>{application.phone}</a>],
    [t("email"), application.email ? <a key="email" href={`mailto:${application.email}`}>{application.email}</a> : "—"],
    [t("education"), application.education],
    [t("address"), application.address],
    [t("experience"), application.experience || "—"],
    [t("received"), formatDate(application.created_at, language)],
  ];

  return (
    <Drawer open title={application.full_name} onClose={onClose} footer={<Button onClick={onClose}>{t("close")}</Button>}>
      <dl className="m-0 mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-semibold text-slate-600">{label}</dt>
            <dd className="m-0 whitespace-pre-wrap break-words text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mb-4">
        {application.cv_file ? (
          <Button icon={FiDownload} onClick={download} disabled={downloadCv.isPending}>
            {t("downloadCv")}
          </Button>
        ) : (
          <p className="m-0 text-sm text-slate-500">{t("noCv")}</p>
        )}
      </div>
      <Field label={t("status")}>
        {(a11y) => (
          <Select
            {...a11y}
            value={application.status}
            onChange={(e) => onStatus(application, e.target.value)}
            options={STATUSES.map((s) => ({ value: s, label: tJobs(`statuses.${s}`) }))}
          />
        )}
      </Field>
    </Drawer>
  );
}

/** Applications sent from the website's job circulars, for the admin's branch (or all, for the super admin). */
export default function JobApplicationsPage({ initialCircularId = "" }) {
  const t = useTranslations("admin.jobApplications");
  const tJobs = useTranslations("jobs");
  const language = useLanguageStore((s) => s.language);
  const [filters, setFilters] = useState({ circularId: String(initialCircularId ?? ""), status: "" });
  const [viewingId, setViewingId] = useState(null);
  const [removing, setRemoving] = useState(null);

  const { data: applications = [], isLoading } = useJobApplications(filters);
  const { data: circulars = [] } = useAllJobCirculars();
  const setStatus = useSetJobApplicationStatus();
  const remove = useDeleteJobApplication();
  const viewing = applications.find((a) => a.id === viewingId) ?? null;
  const circularTitle = (id) => localized(circulars.find((c) => c.id === id) ?? {}, "title", language) || "—";

  const changeStatus = async (application, status) => {
    try {
      await setStatus.mutateAsync({ id: application.id, status });
      notify.success(t("statusUpdated"));
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
      setViewingId(null);
    }
  };

  const columns = [
    { key: "full_name", header: t("applicant"), sortable: true, render: (a) => <span className="font-medium text-slate-800">{a.full_name}</span> },
    { key: "post", header: t("post"), render: (a) => localized(a, "post_title", language) },
    { key: "circular", header: t("circular"), render: (a) => circularTitle(a.circular_id) },
    { key: "phone", header: t("phone") },
    { key: "status", header: t("status"), render: (a) => <Badge tone={STATUS_TONES[a.status]}>{tJobs(`statuses.${a.status}`)}</Badge> },
    { key: "created_at", header: t("received"), sortable: true, render: (a) => formatDate(a.created_at, language) },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (a) => (
        <div className="inline-flex gap-1">
          <Button size="sm" icon={FiEye} onClick={() => setViewingId(a.id)} aria-label={t("details")} title={t("details")} />
          <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => setRemoving(a)} aria-label={t("delete")} title={t("delete")} />
        </div>
      ),
    },
  ];

  const filter = (name) => (event) => setFilters((previous) => ({ ...previous, [name]: event.target.value }));

  return (
    <div className="space-y-4">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <Field label={t("circular")}>
          {(a11y) => (
            <Select
              {...a11y}
              value={filters.circularId}
              onChange={filter("circularId")}
              placeholder={t("allCirculars")}
              options={circulars.map((c) => ({ value: String(c.id), label: localized(c, "title", language) }))}
            />
          )}
        </Field>
        <Field label={t("status")}>
          {(a11y) => (
            <Select
              {...a11y}
              value={filters.status}
              onChange={filter("status")}
              placeholder={t("allStatuses")}
              options={STATUSES.map((s) => ({ value: s, label: tJobs(`statuses.${s}`) }))}
            />
          )}
        </Field>
      </div>

      <Box title={t("all")} tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={applications}
          rowKey="id"
          loading={isLoading}
          emptyText={t("none")}
          searchable
          searchText={(a) => `${a.full_name} ${a.phone} ${a.post_title_en} ${a.post_title_bn}`}
        />
      </Box>

      {viewing && <ApplicationDrawer application={viewing} onClose={() => setViewingId(null)} onStatus={changeStatus} />}

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
            <strong>{removing.full_name}</strong> — {t("deleteConfirmBody")}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
