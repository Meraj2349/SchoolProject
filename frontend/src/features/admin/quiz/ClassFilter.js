"use client";

import { useId } from "react";
import { Select } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";
import { useClassOptions } from "./useQuiz";

/** A labelled select for a toolbar (label linked by id, so its name is just the label). */
export function FilterSelect({ label, ...props }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id} className="font-semibold text-slate-600">
        {label}
      </label>
      <Select id={id} className="w-auto" {...props} />
    </div>
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
