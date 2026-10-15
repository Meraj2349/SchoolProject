"use client";

import { useState } from "react";
import { Button, Drawer, Field, Input, Select, errorMessage } from "@/components/admin/ui";
import { feesService } from "@/services/fees.service";
import { useTranslations } from "@/store/languageStore";
import { useFeeMutation } from "./useFees";

const EMPTY = { kind: "percent", value: "", applies_to: "tuition", reason: "", valid_from: "", valid_to: "" };

/** Adds a percent or fixed discount for one student. */
export default function DiscountDrawer({ studentId, onClose, onSaved }) {
  const t = useTranslations("admin.fees");
  const [form, setForm] = useState(EMPTY);
  const [saveError, setSaveError] = useState(null);
  const create = useFeeMutation(feesService.createDiscount);
  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaveError(null);
    try {
      await create.mutateAsync({ student_id: Number(studentId), ...form });
      onSaved();
    } catch (error) {
      setSaveError(errorMessage(error, t("loadFailed")));
    }
  };

  return (
    <Drawer
      open
      title={t("addDiscount")}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={create.isPending}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="discount-form" disabled={create.isPending}>
            {t("save")}
          </Button>
        </>
      }
    >
      <form id="discount-form" onSubmit={submit} noValidate>
        {saveError && <div role="alert" className="error-message">{saveError}</div>}
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label={t("kind")} required>
            {(a11y) => (
              <Select {...a11y} value={form.kind} onChange={set("kind")} options={[{ value: "percent", label: t("percent") }, { value: "fixed", label: t("fixed") }]} />
            )}
          </Field>
          <Field label={t("value")} required help={form.kind === "percent" ? "1–100" : "৳"}>
            {(a11y) => <Input {...a11y} inputMode="decimal" value={form.value} onChange={set("value")} />}
          </Field>
          <Field label={t("appliesTo")} required>
            {(a11y) => (
              <Select {...a11y} value={form.applies_to} onChange={set("applies_to")} options={[{ value: "tuition", label: t("tuitionOnly") }, { value: "all", label: t("allFees") }]} />
            )}
          </Field>
          <Field label={t("reason")}>{(a11y) => <Input {...a11y} value={form.reason} onChange={set("reason")} />}</Field>
          <Field label={t("validFrom")}>{(a11y) => <Input {...a11y} type="date" value={form.valid_from} onChange={set("valid_from")} />}</Field>
          <Field label={t("validTo")}>{(a11y) => <Input {...a11y} type="date" value={form.valid_to} onChange={set("valid_to")} />}</Field>
        </div>
      </form>
    </Drawer>
  );
}
