"use client";

import { useState } from "react";
import { Button, Drawer, Input, errorMessage, notify } from "@/components/admin/ui";
import { fillTemplate } from "@/lib/template";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { classesService } from "@/services/classes.service";
import { feesService } from "@/services/fees.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { periodLabel } from "./feeRules";
import { useFeeMutation, useHeads } from "./useFees";

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

const toggle = (list, value, on) => (on ? [...list, value] : list.filter((v) => v !== value));

/** Generates a month's invoices: all or some classes, plus optional extra fee heads. */
export default function GenerateInvoicesDrawer({ period, onClose }) {
  const t = useTranslations("admin.fees");
  const language = useLanguageStore((s) => s.language);
  // Every class name, not only those with tuition: a class can be billed extra fees alone.
  const { data: allClassNames = [] } = useQuery({
    queryKey: queryKeys.classes.names(),
    queryFn: classesService.getNames,
    select: (d) => (Array.isArray(d) ? d : (d?.data ?? [])),
  });
  const { data: heads = [] } = useHeads();
  const [allClasses, setAllClasses] = useState(true);
  const [classNames, setClassNames] = useState([]);
  const [extras, setExtras] = useState({}); // head_id → amount (string) for chosen heads
  const [saveError, setSaveError] = useState(null);
  const generate = useFeeMutation(feesService.generateInvoices);

  const activeHeads = heads.filter((h) => Number(h.active) === 1 || h.active === true);
  const headName = (head) => (language === "bn" ? head.name_bn || head.name_en : head.name_en || head.name_bn);

  const submit = async () => {
    setSaveError(null);
    const request = {
      ...period,
      ...(allClasses ? {} : { class_names: classNames }),
      extras: Object.entries(extras).map(([headId, amount]) => ({ head_id: Number(headId), amount })),
    };
    try {
      const { data } = await generate.mutateAsync(request);
      notify.success(fillTemplate(t("generated"), { created: data.created, already: data.already_invoiced, none: data.without_fees }));
      onClose();
    } catch (error) {
      setSaveError(errorMessage(error, t("loadFailed")));
    }
  };

  return (
    <Drawer
      open
      title={fillTemplate(t("generateTitle"), { period: periodLabel(period, language) })}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={generate.isPending}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={submit} disabled={generate.isPending || (!allClasses && classNames.length === 0)}>
            {t("generate")}
          </Button>
        </>
      }
    >
      {saveError && <div role="alert" className="error-message">{saveError}</div>}
      <p className="text-sm text-slate-600 mt-0">{t("generateHelp")}</p>

      <fieldset className="border border-slate-200 rounded-sm px-3 py-2 mb-4">
        <legend className="text-sm font-semibold px-1">{t("classesToBill")}</legend>
        <Checkbox label={t("allClassesOption")} checked={allClasses} onChange={setAllClasses} />
        {!allClasses && (
          <div className="pl-5">
            {allClassNames.map((name) => (
              <Checkbox key={name} label={name} checked={classNames.includes(name)} onChange={(on) => setClassNames((list) => toggle(list, name, on))} />
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="border border-slate-200 rounded-sm px-3 py-2">
        <legend className="text-sm font-semibold px-1">{t("extraFees")}</legend>
        {activeHeads.length === 0 && <p className="text-sm text-slate-500 my-1">{t("noHeads")}</p>}
        {activeHeads.map((head) => {
          const chosen = head.id in extras;
          return (
            <div key={head.id} className="flex items-center justify-between gap-3">
              <Checkbox
                label={headName(head)}
                checked={chosen}
                onChange={(on) =>
                  setExtras((current) => {
                    const next = { ...current };
                    if (on) next[head.id] = String(Number(head.default_amount));
                    else delete next[head.id];
                    return next;
                  })
                }
              />
              {chosen && (
                <Input
                  className="w-32"
                  inputMode="decimal"
                  aria-label={`${headName(head)} ${t("amountOverride")}`}
                  value={extras[head.id]}
                  onChange={(e) => setExtras((current) => ({ ...current, [head.id]: e.target.value }))}
                />
              )}
            </div>
          );
        })}
      </fieldset>
    </Drawer>
  );
}
