"use client";

import { useState } from "react";
import { Box, Button, Drawer, Field, Input, Select, errorMessage } from "@/components/admin/ui";
import { localDateString } from "@/lib/dates";
import { feesService } from "@/services/fees.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { PAYMENT_METHODS, paymentDefaults, periodLabel, validatePayment } from "./feeRules";
import InvoiceItems from "./InvoiceItems";
import { useFeeMutation, useInvoice } from "./useFees";

function PaymentForm({ invoice, onPaid, onClose, t }) {
  const today = localDateString();
  const [form, setForm] = useState(() => paymentDefaults(invoice, today));
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const record = useFeeMutation((data) => feesService.recordPayment(invoice.id, data));

  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = validatePayment(form, { balance: invoice.balance, today });
    setErrors(found);
    setSaveError(null);
    if (Object.keys(found).length > 0) return;
    try {
      const response = await record.mutateAsync(form);
      onPaid(response.data);
    } catch (error) {
      setSaveError(errorMessage(error, t("loadFailed")));
    }
  };

  const errorFor = (field) => (errors[field] ? t(errors[field]) : undefined);

  return (
    <form id="payment-form" onSubmit={submit} noValidate>
      {saveError && (
        <div role="alert" className="error-message">
          {saveError}
        </div>
      )}
      <Field label={t("amount")} required error={errorFor("amount")}>
        {(a11y) => <Input {...a11y} inputMode="decimal" value={form.amount} onChange={set("amount")} />}
      </Field>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label={t("method")} required error={errorFor("method")}>
          {(a11y) => (
            <Select {...a11y} value={form.method} onChange={set("method")} options={PAYMENT_METHODS.map((m) => ({ value: m, label: t(`methods.${m}`) }))} />
          )}
        </Field>
        <Field label={t("paidOn")} required error={errorFor("paid_on")}>
          {(a11y) => <Input {...a11y} type="date" max={today} value={form.paid_on} onChange={set("paid_on")} />}
        </Field>
      </div>
      <Field label={t("note")}>{(a11y) => <Input {...a11y} value={form.note} onChange={set("note")} />}</Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onClose} disabled={record.isPending}>
          {t("cancel")}
        </Button>
        <Button variant="success" type="submit" disabled={record.isPending}>
          {t("recordPayment")}
        </Button>
      </div>
    </form>
  );
}

/** "Collect payment" drawer for one invoice. onPaid receives { payment, invoice }. */
export default function PaymentDrawer({ invoiceId, onPaid, onClose }) {
  const t = useTranslations("admin.fees");
  const language = useLanguageStore((s) => s.language);
  const { data: invoice, isError } = useInvoice(invoiceId);

  return (
    <Drawer open title={t("collectTitle")} onClose={onClose}>
      {isError && <div role="alert" className="error-message">{t("loadFailed")}</div>}
      {invoice && (
        <>
          <Box title={`${invoice.student_name} — ${invoice.class_name} ${invoice.section ?? ""}`} className="mb-4">
            <p className="text-sm text-slate-500 mt-0 mb-2">
              {periodLabel(invoice, language)} · {t("dueDate")}: {invoice.due_date}
            </p>
            <InvoiceItems invoice={invoice} />
          </Box>
          <PaymentForm key={invoice.id} invoice={invoice} onPaid={onPaid} onClose={onClose} t={t} />
        </>
      )}
    </Drawer>
  );
}
