"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button, Select } from "@/components/admin/ui";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { monthName, shiftPeriod, yearOptions } from "./feeRules";

/** Month + year picker with previous/next buttons. period: { year, month } */
export default function PeriodPicker({ period, onChange }) {
  const t = useTranslations("admin.fees");
  const language = useLanguageStore((s) => s.language);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: monthName(i + 1, language) }));
  const years = [...new Set([...yearOptions(new Date().getFullYear()), period.year])].sort();

  return (
    <div className="flex items-center gap-1">
      <Button size="sm" icon={FiChevronLeft} aria-label={t("previousMonth")} onClick={() => onChange(shiftPeriod(period, -1))} />
      <label>
        <span className="sr-only">{t("month")}</span>
        <Select className="w-auto" value={period.month} onChange={(e) => onChange({ ...period, month: Number(e.target.value) })} options={months} />
      </label>
      <label>
        <span className="sr-only">{t("year")}</span>
        <Select className="w-auto" value={period.year} onChange={(e) => onChange({ ...period, year: Number(e.target.value) })} options={years} />
      </label>
      <Button size="sm" icon={FiChevronRight} aria-label={t("nextMonth")} onClick={() => onChange(shiftPeriod(period, 1))} />
    </div>
  );
}
