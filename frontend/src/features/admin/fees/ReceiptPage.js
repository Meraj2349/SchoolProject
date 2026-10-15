"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiPrinter } from "react-icons/fi";
import { Button, MoneyText } from "@/components/admin/ui";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { periodLabel } from "./feeRules";
import { useReceipt } from "./useFees";

function Row({ label, children, strong }) {
  return (
    <tr className="border-b border-slate-100">
      <th scope="row" className={`py-1.5 pr-4 text-left font-normal text-slate-600 ${strong ? "font-semibold text-slate-800" : ""}`}>
        {label}
      </th>
      <td className={`py-1.5 text-right ${strong ? "font-bold" : ""}`}>{children}</td>
    </tr>
  );
}

/** A printable payment receipt. The admin shell is hidden when printing. */
export default function ReceiptPage({ paymentId }) {
  const t = useTranslations("admin.fees");
  const language = useLanguageStore((s) => s.language);
  const router = useRouter();
  const { data, isLoading, isError } = useReceipt(paymentId);

  if (isError) return <div role="alert" className="error-message">{t("loadFailed")}</div>;
  if (isLoading || !data) return <p role="status" className="text-sm text-slate-500">…</p>;

  const { payment, invoice } = data;
  const branchName = language === "bn" ? invoice.branch_name_bn || invoice.branch_name_en : invoice.branch_name_en || invoice.branch_name_bn;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="admin-no-print flex justify-between mb-4">
        <Button icon={FiArrowLeft} onClick={() => router.back()}>
          {t("back")}
        </Button>
        <Button variant="primary" icon={FiPrinter} onClick={() => window.print()}>
          {t("print")}
        </Button>
      </div>

      <article className="relative bg-white border border-slate-300 p-8 print:border-0 print:p-0">
        {payment.voided_at && (
          <div className="absolute top-6 right-6 rotate-[-12deg] border-4 border-red-600 text-red-600 font-extrabold text-2xl px-3 py-1 tracking-widest">
            {t("voidedReceipt")}
          </div>
        )}
        <header className="text-center border-b-2 border-slate-800 pb-3 mb-4">
          <h1 className="text-xl font-bold m-0">{branchName}</h1>
          <p className="text-sm uppercase tracking-widest text-slate-600 mt-1 mb-0">{t("receiptTitle")}</p>
        </header>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5">
          <div>
            <dt className="text-slate-500">{t("receiptNo")}</dt>
            <dd className="m-0 font-semibold">{payment.receipt_no}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("paidOn")}</dt>
            <dd className="m-0">{payment.paid_on}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("receivedFrom")}</dt>
            <dd className="m-0">
              {invoice.student_name} · {t("roll")} {invoice.roll_number}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("className")}</dt>
            <dd className="m-0">{`${invoice.class_name} ${invoice.section ?? ""}`.trim()}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("forPeriod")}</dt>
            <dd className="m-0">{periodLabel(invoice, language)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("paymentMethod")}</dt>
            <dd className="m-0">{t(`methods.${payment.method}`)}</dd>
          </div>
        </dl>

        <table className="w-full text-sm mb-5">
          <caption className="text-left font-semibold mb-1">{t("items")}</caption>
          <tbody>
            {invoice.items.map((item) => (
              <Row key={item.id ?? item.label} label={item.label}>
                <MoneyText amount={item.amount} />
              </Row>
            ))}
            <Row label={t("invoiceTotal")} strong>
              <MoneyText amount={invoice.total} />
            </Row>
          </tbody>
        </table>

        <table className="w-full text-sm">
          <tbody>
            <Row label={t("amountPaid")} strong>
              <MoneyText amount={payment.amount} />
            </Row>
            <Row label={t("paidToDate")}>
              <MoneyText amount={invoice.paid} />
            </Row>
            <Row label={t("balanceDue")} strong>
              <MoneyText amount={invoice.balance} />
            </Row>
          </tbody>
        </table>

        {payment.note && <p className="text-sm text-slate-600 mt-4 mb-0">{t("note")}: {payment.note}</p>}
        {payment.voided_at && (
          <p className="text-sm text-red-700 mt-2 mb-0">
            {t("voided")}: {payment.void_reason}
          </p>
        )}
      </article>
    </div>
  );
}
