"use client";

import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ui";
import { fillTemplate } from "@/lib/template";
import { useTranslations } from "@/store/languageStore";

/** After a payment: show the receipt number and offer to print it. */
export default function PaymentDoneDialog({ payment, onClose }) {
  const t = useTranslations("admin.fees");
  const router = useRouter();
  return (
    <ConfirmDialog
      open={Boolean(payment)}
      tone="primary"
      title={payment ? fillTemplate(t("paymentRecorded"), { receipt: payment.receipt_no }) : ""}
      confirmLabel={t("printReceipt")}
      onConfirm={() => router.push(`/admin/fees/receipt/${payment.id}`)}
      onCancel={onClose}
    />
  );
}
