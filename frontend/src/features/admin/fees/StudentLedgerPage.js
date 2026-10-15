"use client";

import Link from "next/link";
import { useState } from "react";
import { FiDollarSign, FiPlus, FiSlash, FiTrash2 } from "react-icons/fi";
import { Badge, Box, Button, ConfirmDialog, DataTable, MoneyText, PageHeader, StatBox, errorMessage, notify } from "@/components/admin/ui";
import { localDateString } from "@/lib/dates";
import { feesService } from "@/services/fees.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import ChooseBranchNotice from "./ChooseBranchNotice";
import DiscountDrawer from "./DiscountDrawer";
import { discountText, periodLabel, statusBadge } from "./feeRules";
import PaymentDoneDialog from "./PaymentDoneDialog";
import PaymentDrawer from "./PaymentDrawer";
import VoidPaymentDialog from "./VoidPaymentDialog";
import { useFeeBranch, useFeeMutation, useLedger } from "./useFees";

export default function StudentLedgerPage({ studentId }) {
  const t = useTranslations("admin.fees");
  const language = useLanguageStore((s) => s.language);
  const { needsBranch } = useFeeBranch();
  const { data: ledger, isLoading, isError } = useLedger(studentId);
  const [collecting, setCollecting] = useState(null);
  const [paid, setPaid] = useState(null);
  const [voiding, setVoiding] = useState(null);
  const [addingDiscount, setAddingDiscount] = useState(false);
  const [removingDiscount, setRemovingDiscount] = useState(null);
  const removeDiscount = useFeeMutation(feesService.deleteDiscount);
  const today = localDateString();
  const canChange = !needsBranch;

  const confirmRemoveDiscount = async () => {
    try {
      await removeDiscount.mutateAsync(removingDiscount.id);
      notify.success(t("deleted"));
    } catch (error) {
      notify.error(errorMessage(error, t("loadFailed")));
    } finally {
      setRemovingDiscount(null);
    }
  };

  if (isError) return <div role="alert" className="error-message">{t("loadFailed")}</div>;
  if (isLoading || !ledger) return <p role="status" className="text-sm text-slate-500">…</p>;

  const { student, totals } = ledger;

  const invoiceColumns = [
    { key: "period", header: t("period"), sortable: true, sortValue: (i) => i.year * 100 + i.month, render: (i) => periodLabel(i, language) },
    { key: "total", header: t("total"), align: "right", render: (i) => <MoneyText amount={i.total} /> },
    { key: "paid", header: t("paid"), align: "right", render: (i) => <MoneyText amount={i.paid} /> },
    { key: "balance", header: t("balance"), align: "right", render: (i) => <MoneyText amount={i.balance} className="font-semibold" /> },
    {
      key: "status",
      header: t("status"),
      render: (i) => {
        const badge = statusBadge(i.status, { dueDate: i.due_date, today });
        return <Badge tone={badge.tone}>{t(badge.key)}</Badge>;
      },
    },
    { key: "due_date", header: t("dueDate") },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (i) =>
        canChange && i.balance > 0 ? (
          <Button size="sm" variant="success" icon={FiDollarSign} onClick={() => setCollecting(i.id)}>
            {t("collect")}
          </Button>
        ) : null,
    },
  ];

  const paymentColumns = [
    {
      key: "receipt_no",
      header: t("receipt"),
      render: (p) => (
        <Link href={`/admin/fees/receipt/${p.id}`} prefetch={false} className="text-[var(--admin-primary)] no-underline hover:underline">
          {p.receipt_no}
        </Link>
      ),
    },
    { key: "period", header: t("period"), render: (p) => periodLabel(p, language) },
    { key: "paid_on", header: t("paidOn"), sortable: true },
    { key: "method", header: t("method"), render: (p) => t(`methods.${p.method}`) },
    {
      key: "amount",
      header: t("amount"),
      align: "right",
      render: (p) => <MoneyText amount={p.amount} className={p.voided_at ? "line-through text-slate-400" : ""} />,
    },
    {
      key: "actions",
      header: t("actions"),
      align: "right",
      render: (p) =>
        p.voided_at ? (
          <span title={p.void_reason ?? ""}>
            <Badge>{t("voided")}</Badge>
          </span>
        ) : canChange ? (
          <Button size="sm" variant="danger" icon={FiSlash} onClick={() => setVoiding(p)}>
            {t("void")}
          </Button>
        ) : null,
    },
  ];

  const discountColumns = [
    { key: "amount", header: t("value"), render: (d) => { const { amount } = discountText(d); return typeof amount === "number" ? <MoneyText amount={amount} /> : amount; } },
    { key: "scope", header: t("appliesTo"), render: (d) => (d.applies_to === "all" ? t("allFees") : t("tuitionOnly")) },
    { key: "reason", header: t("reason"), render: (d) => d.reason ?? "—" },
    { key: "valid", header: `${t("validFrom")} – ${t("validTo")}`, render: (d) => `${d.valid_from ?? "…"} – ${d.valid_to ?? "…"}` },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (d) =>
        canChange ? (
          <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => setRemovingDiscount(d)}>
            {t("removeDiscount")}
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={student.name} subtitle={`${t("ledgerTitle")} — ${student.class_name} ${student.section ?? ""} · ${t("roll")} ${student.roll_number}`} />
      {needsBranch && <ChooseBranchNotice />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatBox icon={FiDollarSign} tone="info" label={t("billed")} value={<MoneyText amount={totals.total} />} />
        <StatBox icon={FiDollarSign} tone="success" label={t("paid")} value={<MoneyText amount={totals.paid} />} />
        <StatBox icon={FiDollarSign} tone={totals.balance > 0 ? "danger" : "success"} label={t("balance")} value={<MoneyText amount={totals.balance} />} />
      </div>

      <Box title={t("invoicesTitle")} tone="primary" bodyClassName="">
        <DataTable columns={invoiceColumns} rows={ledger.invoices} emptyText={t("noInvoicesStudent")} />
      </Box>

      <Box title={t("payments")} tone="success" bodyClassName="">
        <DataTable columns={paymentColumns} rows={ledger.payments} emptyText={t("noPayments")} />
      </Box>

      <Box
        title={t("discounts")}
        tone="warning"
        bodyClassName=""
        tools={
          canChange && (
            <Button size="sm" icon={FiPlus} onClick={() => setAddingDiscount(true)}>
              {t("addDiscount")}
            </Button>
          )
        }
      >
        <DataTable columns={discountColumns} rows={ledger.discounts} emptyText={t("noDiscounts")} />
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
      {voiding && <VoidPaymentDialog payment={voiding} onClose={() => setVoiding(null)} />}
      {addingDiscount && (
        <DiscountDrawer
          studentId={student.id}
          onClose={() => setAddingDiscount(false)}
          onSaved={() => {
            setAddingDiscount(false);
            notify.success(t("saved"));
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(removingDiscount)}
        title={t("removeDiscountTitle")}
        confirmLabel={t("removeDiscount")}
        busy={removeDiscount.isPending}
        onConfirm={confirmRemoveDiscount}
        onCancel={() => setRemovingDiscount(null)}
      >
        {t("removeDiscountHelp")}
      </ConfirmDialog>
    </div>
  );
}
