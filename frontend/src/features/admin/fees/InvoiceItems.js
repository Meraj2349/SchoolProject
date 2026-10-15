"use client";

import { MoneyText } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";

/** An invoice's lines with total, paid and balance. */
export default function InvoiceItems({ invoice }) {
  const t = useTranslations("admin.fees");
  const rows = [
    [t("total"), invoice.total, "font-semibold"],
    [t("paid"), invoice.paid, "text-emerald-700"],
    [t("balance"), invoice.balance, "font-bold"],
  ];
  return (
    <table className="w-full text-sm">
      <tbody>
        {invoice.items.map((item) => (
          <tr key={item.id ?? `${item.kind}-${item.label}`} className="border-b border-slate-100">
            <td className="py-1.5 text-slate-700">{item.label}</td>
            <td className="py-1.5 text-right">
              <MoneyText amount={item.amount} />
            </td>
          </tr>
        ))}
        {rows.map(([label, amount, className]) => (
          <tr key={label}>
            <td className={`py-1.5 ${className}`}>{label}</td>
            <td className={`py-1.5 text-right ${className}`}>
              <MoneyText amount={amount} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
