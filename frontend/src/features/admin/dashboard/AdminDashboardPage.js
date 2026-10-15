"use client";

import { FiCalendar, FiCheckSquare, FiDollarSign, FiUserCheck, FiUsers } from "react-icons/fi";
import { Badge, Box, Button, DataTable, MoneyText, PageHeader, StatBox } from "@/components/admin/ui";
import { useBranchStats } from "@/hooks/useBranchStats";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { formatTaka } from "@/lib/money";
import { fillTemplate } from "@/lib/template";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const percent = (value) => `${value}%`;

function FeesThisMonth({ fees, t }) {
  if (!fees.billed) return <p className="text-sm text-slate-500 m-0">{t("noInvoices")}</p>;
  const rows = [
    [t("billed"), <MoneyText key="b" amount={fees.billed} />],
    [t("collected"), <MoneyText key="c" amount={fees.collected} className="text-emerald-700" />],
    [t("outstanding"), <MoneyText key="o" amount={fees.outstanding} className="text-red-600" />],
    [t("overdueInvoices"), fees.overdue],
  ];
  return (
    <>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-4" aria-hidden="true">
        <div className="h-full bg-[var(--admin-success)]" style={{ width: `${Math.min(fees.collection_rate ?? 0, 100)}%` }} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 m-0">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="m-0 text-lg font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function UpcomingEvents({ events, t }) {
  if (!events.length) return <p className="text-sm text-slate-500 m-0">{t("noEvents")}</p>;
  return (
    <ul className="list-none m-0 p-0 divide-y divide-slate-100">
      {events.map((event) => (
        <li key={event.EventID} className="flex items-center gap-3 py-2.5">
          <FiCalendar className="text-[var(--admin-primary)] shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm text-slate-800">{event.EventName}</span>
          <span className="text-xs text-slate-500 whitespace-nowrap">{event.StartDate}</span>
        </li>
      ))}
    </ul>
  );
}

function BranchOverview({ t }) {
  const { data: branches = [], isLoading } = useBranchStats();
  const setBranch = useBranchStore((s) => s.setBranch);
  const columns = [
    { key: "name", header: t("branch"), sortable: true, sortValue: (b) => b.name_en || b.name_bn, render: (b) => b.name_en || b.name_bn },
    { key: "studentCount", header: t("students"), sortable: true, align: "right" },
    { key: "teacherCount", header: t("teachers"), sortable: true, align: "right" },
    { key: "classCount", header: t("classes"), sortable: true, align: "right" },
    {
      key: "status",
      header: "",
      render: (b) => <Badge tone={b.is_proposed ? "warning" : "success"}>{b.is_proposed ? t("proposed") : t("active")}</Badge>,
    },
    {
      key: "switch",
      header: "",
      align: "right",
      render: (b) => (
        <Button size="sm" onClick={() => setBranch(b.id, b.name_en || b.name_bn)}>
          {t("switchTo")}
        </Button>
      ),
    },
  ];
  return (
    <Box title={t("overview")} bodyClassName="">
      <DataTable columns={columns} rows={branches} loading={isLoading} emptyText={t("noData")} />
    </Box>
  );
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const language = useLanguageStore((s) => s.language);
  const role = useAuthStore((s) => s.role);
  const { data: summary, isLoading, isError } = useDashboardSummary();

  const paymentColumns = [
    { key: "receipt_no", header: t("receipt") },
    { key: "student_name", header: t("student") },
    { key: "amount", header: t("amount"), align: "right", render: (p) => <MoneyText amount={p.amount} /> },
    { key: "method", header: t("method"), render: (p) => <Badge tone="info">{p.method}</Badge> },
    { key: "paid_on", header: t("date") },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={summary?.date ? `${t("subtitle")} — ${summary.date}` : t("subtitle")} />

      {isError && (
        <div role="alert" className="error-message">
          {t("errorLoading")}
        </div>
      )}

      {isLoading && <p role="status" className="text-sm text-slate-500">{t("loading")}</p>}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatBox icon={FiUsers} tone="info" label={t("students")} value={summary.counts.students} />
            <StatBox icon={FiUserCheck} tone="primary" label={t("teachers")} value={summary.counts.teachers} />
            <StatBox
              icon={FiCheckSquare}
              tone="success"
              label={t("attendanceToday")}
              value={summary.attendance.rate == null ? "—" : percent(summary.attendance.rate)}
              hint={
                summary.attendance.recorded
                  ? fillTemplate(t("presentOf"), {
                      count: summary.attendance.present + summary.attendance.late,
                      total: summary.attendance.recorded,
                    })
                  : t("notTakenYet")
              }
            />
            <StatBox
              icon={FiDollarSign}
              tone="warning"
              label={t("feesCollected")}
              value={<MoneyText amount={summary.fees.collected} />}
              hint={
                summary.fees.collection_rate == null
                  ? undefined
                  : fillTemplate(t("collectedOfBilled"), {
                      rate: summary.fees.collection_rate,
                      billed: formatTaka(summary.fees.billed, language),
                    })
              }
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Box title={t("thisMonthFees")} tone="success">
              <FeesThisMonth fees={summary.fees} t={t} />
            </Box>
            <Box title={t("recentPayments")} tone="primary" className="lg:col-span-2" bodyClassName="">
              <DataTable columns={paymentColumns} rows={summary.recent_payments} pageSize={5} emptyText={t("noPayments")} />
            </Box>
          </div>

          <Box title={t("upcomingEvents")} tone="warning">
            <UpcomingEvents events={summary.upcoming_events} t={t} />
          </Box>
        </>
      )}

      {role === "super_admin" && <BranchOverview t={t} />}
    </div>
  );
}
