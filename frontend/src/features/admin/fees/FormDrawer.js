"use client";

import { useState } from "react";
import { Button, Drawer, Field, Input, Select, errorMessage } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";

/**
 * A small form in a drawer, described by `fields`:
 * [{ name, label, type?: "text"|"number"|"select"|"checkbox", options?, required?, help? }]
 * onSubmit(values) may reject with an API error; its message is shown.
 */
export default function FormDrawer({ title, fields, initialValues, onSubmit, onClose }) {
  const t = useTranslations("admin.fees");
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const set = (name, value) => setValues((previous) => ({ ...previous, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setSaveError(errorMessage(error, t("loadFailed")));
    } finally {
      setSaving(false);
    }
  };

  const control = (field, a11y) => {
    if (field.type === "select") {
      return <Select {...a11y} value={values[field.name]} onChange={(e) => set(field.name, e.target.value)} options={field.options} placeholder="" />;
    }
    if (field.type === "checkbox") {
      return (
        <input {...a11y} type="checkbox" checked={Boolean(values[field.name])} onChange={(e) => set(field.name, e.target.checked)} />
      );
    }
    return (
      <Input
        {...a11y}
        inputMode={field.type === "number" ? "decimal" : undefined}
        value={values[field.name]}
        onChange={(e) => set(field.name, e.target.value)}
      />
    );
  };

  return (
    <Drawer
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="fee-form-drawer" disabled={saving}>
            {t("save")}
          </Button>
        </>
      }
    >
      <form id="fee-form-drawer" onSubmit={submit} noValidate>
        {saveError && <div role="alert" className="error-message">{saveError}</div>}
        {fields.map((field) => (
          <Field key={field.name} label={field.label} required={field.required} help={field.help}>
            {(a11y) => control(field, a11y)}
          </Field>
        ))}
      </form>
    </Drawer>
  );
}
