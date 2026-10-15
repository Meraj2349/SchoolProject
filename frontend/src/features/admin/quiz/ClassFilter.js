"use client";

import { Select } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";
import { useClassOptions } from "./useQuiz";

/** A labelled select for a toolbar. */
export function FilterSelect({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      <Select className="w-auto" {...props} />
    </label>
  );
}

/** Class filter: the school's classes in order; value is a class key. */
export default function ClassFilter({ value, onChange, placeholder }) {
  const t = useTranslations("admin.quiz");
  const classes = useClassOptions();
  return (
    <FilterSelect
      label={t("class")}
      value={value}
      onChange={onChange}
      options={classes.map((c) => ({ value: c.key, label: c.label }))}
      placeholder={placeholder ?? t("allClasses")}
    />
  );
}
