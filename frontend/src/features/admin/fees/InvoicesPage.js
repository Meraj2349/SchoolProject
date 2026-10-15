"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiDollarSign } from "react-icons/fi";
import { Badge, Box, Button, DataTable, MoneyText, PageHeader, Select } from "@/components/admin/ui";
import { localDateString } from "@/lib/dates";
import { useTranslations } from "@/store/languageStore";
import ChooseBranchNotice from "./ChooseBranchNotice";
import { currentPeriod } from "./currentPeriod";
import { statusBadge } from "./feeRules";
import PaymentDoneDialog from "./PaymentDoneDialog";
import PaymentDrawer from "./PaymentDrawer";
import PeriodPicker from "./PeriodPicker";
import { useFeeBranch, useInvoices } from "./useFees";

const STATUSES = ["unpaid", "partial", "paid"];
const unique = (values) => [...new Set(values.filter(Boolean))].sort();

function FilterSelect({ label, ...props }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <Select className="w-auto" {...props} />
    </label>
  );
}

export default function InvoicesPage() {
  const t = useTranslations("admin.fees");
  const { needsBranch } = useFeeBranch();
  const [period, setPeriod] = useState(currentPeriod);
  const [status, setStatus] = useState("");
  const [classFilter, setClassFilter] = useState({ className: "", section: "" });
  const [collecting, setCollecting] = useState(null);
  const [paid, setPaid] = useState(null);

  const serverFilters = { ...period, ...(status ? { status } : {}) };
  const { data: invoices = [], isLoading, isError } = useInvoices(serverFilters);
  const today = localDateString();

  const classNames = useMemo(() => unique(invoices.map((i) => i.class_name)), [invoices]);
  const sections = useMemo(
    () => unique(invoices.filter((i) => i.class_name === classFilter.className).map((i) => i.section)),
    [invoices, classFilter.className],
  );
  const rows = invoices.filter(
    (i) => (!classFilter.className || i.class_name === classFilter.className) && (!classFilter.section || i.section === classFilter.section),
  );

  const columns = [
    {
      key: "student_name",
      header: t("student"),
      sortable: true,
      render: (i) => (
        <Link href={`/admin/fees/students/${i.student_id}`} prefetch={false} className="text-[var(--admin-primary)] no-underline hover:underline">
          {i.student_name}
        </Link>
      ),
    },
    { key: "roll_number", header: t("roll"), sortable: true, sortValue: (i) => Number(i.roll_number) || i.roll_number },
    { key: "class", header: t("className"), sortable: true, sortValue: (i) => `${i.class_name} ${i.section}`, render: (i) => `${i.class_name} ${i.section ?? ""}` },
    { key: "total", header: t("total"), align: "right", sortable: true, render: (i) => <MoneyText amount={i.total} /> },
    { key: "paid", header: t("paid"), align: "right", render: (i) => <MoneyText amount={i.paid} /> },
    { key: "balance", header: t("balance"), align: "right", sortable: true, render: (i) => <MoneyText amount={i.balance} className="font-semibold" /> },
    {
      key: "status",
      header: t("status"),
      render: (i) => {
        const badge = statusBadge(i.status, { dueDate: i.due_date, today });
        return <Badge tone={badge.tone}>{t(badge.key)}</Badge>;
      },
    },
    { key: "due_date", header: t("dueDate"), sortable: true },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (i) =>
        !needsBranch && i.balance > 0 ? (
          <Button size="sm" variant="success" icon={FiDollarSign} onClick={() => setCollecting(i.id)}>
            {t("collect")}
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={t("invoicesTitle")} subtitle={t("invoicesSubtitle")} actions={<PeriodPicker period={period} onChange={setPeriod} />} />
      {needsBranch && <ChooseBranchNotice />}
      {isError && <div role="alert" className="error-message">{t("loadFailed")}</div>}

      <Box tone="primary" bodyClassName="">
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          emptyText={t("noInvoicesMonth")}
          searchable
          searchText={(i) => `${i.student_name} ${i.roll_number}`}
          toolbar={
            <>
              <FilterSelect
                label={t("className")}
                value={classFilter.className}
                onChange={(e) => setClassFilter({ className: e.target.value, section: "" })}
                options={classNames}
                placeholder={t("allClasses")}
              />
              <FilterSelect
                label={t("section")}
                value={classFilter.section}
                onChange={(e) => setClassFilter((f) => ({ ...f, section: e.target.value }))}
                options={sections}
                placeholder={t("allSections")}
                disabled={!classFilter.className}
              />
              <FilterSelect
                label={t("status")}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={STATUSES.map((s) => ({ value: s, label: t(statusBadge(s).key) }))}
                placeholder={t("allStatuses")}
              />
            </>
          }
        />
      </Box>

      {collecting && (
        <PaymentDrawer
          invoiceId={collecting}
          onClose={() => setCollecting(null)}
          onPaid={({ payment }) => {
            setCollecting(null);
            setPaid(payment);
          }}
        />
      )}
      <PaymentDoneDialog payment={paid} onClose={() => setPaid(null)} />
    </div>
  );
}
