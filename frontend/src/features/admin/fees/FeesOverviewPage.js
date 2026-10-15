"use client";

import { useState } from "react";
import { FiAlertTriangle, FiClock, FiDollarSign, FiFileText, FiPlusCircle } from "react-icons/fi";
import { Box, Button, ConfirmDialog, DataTable, MoneyText, PageHeader, StatBox, errorMessage, notify } from "@/components/admin/ui";
import { fillTemplate } from "@/lib/template";
import { feesService } from "@/services/fees.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import ChooseBranchNotice from "./ChooseBranchNotice";
import { currentPeriod } from "./currentPeriod";
import { collectionRate, periodLabel } from "./feeRules";
import GenerateInvoicesDrawer from "./GenerateInvoicesDrawer";
import PeriodPicker from "./PeriodPicker";
import { useFeeBranch, useFeeMutation, useFeeSummary } from "./useFees";

const percentText = (rate) => (rate == null ? "—" : `${rate}%`);

export default function FeesOverviewPage() {
  const t = useTranslations("admin.fees");
  const language = useLanguageStore((s) => s.language);
  const { needsBranch } = useFeeBranch();
  const [period, setPeriod] = useState(currentPeriod);
  const [generating, setGenerating] = useState(false);
  const [confirmFines, setConfirmFines] = useState(false);
  const { data: summary, isLoading, isError } = useFeeSummary(period);
  const lateFines = useFeeMutation(feesService.applyLateFines);
  const label = periodLabel(period, language);

  const applyLateFines = async () => {
    try {
      const { data } = await lateFines.mutateAsync(period);
      notify.success(fillTemplate(t("fined"), { count: data.fined }));
    } catch (error) {
      notify.error(errorMessage(error, t("loadFailed")));
    } finally {
      setConfirmFines(false);
    }
  };

  const classColumns = [
    { key: "class_name", header: t("className"), sortable: true },
    { key: "invoices", header: t("invoiceCount"), align: "right" },
    { key: "billed", header: t("billed"), align: "right", render: (r) => <MoneyText amount={r.billed} /> },
    { key: "collected", header: t("collected"), align: "right", render: (r) => <MoneyText amount={r.collected} /> },
    { key: "outstanding", header: t("outstanding"), align: "right", render: (r) => <MoneyText amount={r.outstanding} /> },
    { key: "rate", header: t("collectionRate"), align: "right", sortable: true, sortValue: collectionRate, render: (r) => percentText(collectionRate(r)) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("overviewTitle")}
        subtitle={`${t("overviewSubtitle")} — ${label}`}
        actions={
          <>
            <PeriodPicker period={period} onChange={setPeriod} />
            {!needsBranch && (
              <>
                <Button variant="primary" icon={FiPlusCircle} onClick={() => setGenerating(true)}>
                  {t("generate")}
                </Button>
                <Button icon={FiClock} onClick={() => setConfirmFines(true)}>
                  {t("applyLateFines")}
                </Button>
              </>
            )}
          </>
        }
      />
      {needsBranch && <ChooseBranchNotice />}
      {isError && <div role="alert" className="error-message">{t("loadFailed")}</div>}
      {isLoading && <p role="status" className="text-sm text-slate-500">…</p>}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatBox icon={FiFileText} tone="info" label={t("billed")} value={<MoneyText amount={summary.billed} />} hint={`${summary.invoices} ${t("invoiceCount")}`} />
            <StatBox icon={FiDollarSign} tone="success" label={t("collected")} value={<MoneyText amount={summary.collected} />} hint={percentText(collectionRate(summary))} />
            <StatBox icon={FiClock} tone="warning" label={t("outstanding")} value={<MoneyText amount={summary.outstanding} />} />
            <StatBox icon={FiAlertTriangle} tone="danger" label={t("overdue")} value={summary.overdue} />
          </div>
          <Box title={t("byClass")} tone="primary" bodyClassName="">
            <DataTable columns={classColumns} rows={summary.by_class} rowKey="class_name" emptyText={t("noInvoicesMonth")} />
          </Box>
        </>
      )}

      {generating && <GenerateInvoicesDrawer period={period} onClose={() => setGenerating(false)} />}
      <ConfirmDialog
        open={confirmFines}
        tone="primary"
        title={fillTemplate(t("applyLateFinesTitle"), { period: label })}
        confirmLabel={t("applyLateFines")}
        busy={lateFines.isPending}
        onConfirm={applyLateFines}
        onCancel={() => setConfirmFines(false)}
      >
        {t("applyLateFinesHelp")}
      </ConfirmDialog>
    </div>
  );
}
