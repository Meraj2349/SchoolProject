"use client";

import { useState } from "react";
import { ConfirmDialog, Field, Input, errorMessage, notify } from "@/components/admin/ui";
import { feesService } from "@/services/fees.service";
import { useTranslations } from "@/store/languageStore";
import { useFeeMutation } from "./useFees";

/** Voids a payment; a reason is required and kept with the payment. */
export default function VoidPaymentDialog({ payment, onClose }) {
  const t = useTranslations("admin.fees");
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const voidPayment = useFeeMutation(({ id, why }) => feesService.voidPayment(id, why));

  const confirm = async () => {
    if (!reason.trim()) {
      setError(t("voidReasonRequired"));
      return;
    }
    try {
      await voidPayment.mutateAsync({ id: payment.id, why: reason.trim() });
      notify.success(t("voided"));
      onClose();
    } catch (failure) {
      setError(errorMessage(failure, t("loadFailed")));
    }
  };

  return (
    <ConfirmDialog
      open
      title={t("voidTitle")}
      confirmLabel={t("void")}
      busy={voidPayment.isPending}
      onConfirm={confirm}
      onCancel={onClose}
    >
      <p className="mt-0">
        {payment.receipt_no} — {t("voidHelp")}
      </p>
      <Field label={t("voidReason")} required error={error}>
        {(a11y) => <Input {...a11y} value={reason} onChange={(e) => setReason(e.target.value)} />}
      </Field>
    </ConfirmDialog>
  );
}
