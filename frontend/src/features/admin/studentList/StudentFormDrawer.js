"use client";

import { useState } from "react";
import { Button, Drawer, Field, Input, Select, Textarea } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";
import { GENDERS, sectionsFor, validateStudentForm } from "./studentForm";

const ERROR_KEYS = { required: "required", invalid: "invalidGender", rollTaken: "rollTaken" };

/**
 * Add / edit student form in a side drawer. Validates before calling onSave;
 * a failed save shows the server's message (onSave rejects with it).
 */
export default function StudentFormDrawer({ open, initialValues, editId, students, classes, onSave, onClose }) {
  const t = useTranslations("admin.students");
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const classNames = [...new Set(classes.map((c) => c.ClassName).filter(Boolean))].sort();
  const sections = sectionsFor(classes, form.ClassName);

  const set = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));
  const onChange = (field) => (event) => set(field, event.target.value);

  // A new class resets the section, or picks it when the class has only one.
  const onClassChange = (event) => {
    const className = event.target.value;
    const options = sectionsFor(classes, className);
    setForm((previous) => ({ ...previous, ClassName: className, Section: options.length === 1 ? options[0] : "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validateStudentForm(form, { students, editId });
    setErrors(found);
    setSaveError(null);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSave(form);
    } catch (message) {
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const errorFor = (field) => (errors[field] ? t(ERROR_KEYS[errors[field]]) : undefined);
  const textField = (field, labelKey, { required, type = "text" } = {}) => (
    <Field label={t(labelKey)} required={required} error={errorFor(field)}>
      {(a11y) => <Input {...a11y} type={type} value={form[field]} onChange={onChange(field)} />}
    </Field>
  );

  return (
    <Drawer
      open={open}
      title={editId ? t("editStudent") : t("addStudent")}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="student-form" disabled={saving}>
            {t("save")}
          </Button>
        </>
      }
    >
      <form id="student-form" onSubmit={submit} noValidate>
        {saveError && (
          <div role="alert" className="error-message">
            {saveError}
          </div>
        )}
        <div className="grid gap-x-4 sm:grid-cols-2">
          {textField("FirstName", "firstName", { required: true })}
          {textField("LastName", "lastName", { required: true })}
          <Field label={t("class")} required error={errorFor("ClassName")}>
            {(a11y) => (
              <Select {...a11y} value={form.ClassName} onChange={onClassChange} options={classNames} placeholder={t("selectClass")} />
            )}
          </Field>
          <Field label={t("section")} required error={errorFor("Section")}>
            {(a11y) => (
              <Select
                {...a11y}
                value={form.Section}
                onChange={onChange("Section")}
                options={sections}
                placeholder={t("selectSection")}
                disabled={!form.ClassName}
              />
            )}
          </Field>
          {textField("RollNumber", "rollNumber", { required: true })}
          <Field label={t("gender")} required error={errorFor("Gender")}>
            {(a11y) => (
              <Select
                {...a11y}
                value={form.Gender}
                onChange={onChange("Gender")}
                options={GENDERS.map((g) => ({ value: g, label: t(g.toLowerCase()) }))}
              />
            )}
          </Field>
          {textField("DateOfBirth", "dateOfBirth", { required: true, type: "date" })}
          {textField("AdmissionDate", "admissionDate", { type: "date" })}
          {textField("ParentContact", "parentContact", { type: "tel" })}
        </div>
        <Field label={t("address")}>
          {(a11y) => <Textarea {...a11y} value={form.Address} onChange={onChange("Address")} />}
        </Field>
      </form>
    </Drawer>
  );
}
