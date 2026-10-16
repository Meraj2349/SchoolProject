"use client";

import { useState } from "react";
import { Button, Drawer, Field, Input, Select, Textarea } from "@/components/admin/ui";
import { ACHIEVEMENT_CATEGORIES, passRate } from "@/lib/achievements";
import { useTranslations } from "@/store/languageStore";
import { validateAchievementForm } from "./achievementForm";

/**
 * Add / edit an achievement in a side drawer. A board result also asks for
 * the exam and its numbers. Validates before calling onSave(form, photo); a
 * failed save shows the server's message (onSave rejects with it).
 */
export default function AchievementFormDrawer({ initialValues, isNew, onSave, onClose }) {
  const t = useTranslations("admin.achievements");
  const tShared = useTranslations("achievements");
  const [form, setForm] = useState(initialValues);
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const onChange = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  const onToggle = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.checked }));
  const errorFor = (field) => (errors[field] ? t(errors[field]) : undefined);
  const isBoardResult = form.category === "board_result";
  const rate = passRate(form);

  const submit = async (event) => {
    event.preventDefault();
    const found = validateAchievementForm(form);
    setErrors(found);
    setSaveError(null);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSave(form, photo);
    } catch (message) {
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const textField = (field, { required, ...props } = {}) => (
    <Field label={t(field)} required={required} error={errorFor(field)}>
      {(a11y) => <Input {...a11y} value={form[field]} onChange={onChange(field)} {...props} />}
    </Field>
  );

  return (
    <Drawer
      open
      title={isNew ? t("addAchievement") : t("editAchievement")}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="achievement-form" disabled={saving}>
            {t("save")}
          </Button>
        </>
      }
    >
      <form id="achievement-form" onSubmit={submit} noValidate>
        {saveError && (
          <div role="alert" className="error-message">
            {saveError}
          </div>
        )}
        {textField("title_en", { required: true, maxLength: 255 })}
        {textField("title_bn", { required: true, maxLength: 255 })}
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("category")} required error={errorFor("category")}>
            {(a11y) => (
              <Select
                {...a11y}
                value={form.category}
                onChange={onChange("category")}
                placeholder={t("chooseCategory")}
                options={ACHIEVEMENT_CATEGORIES.map((c) => ({ value: c, label: tShared(`categories.${c}`) }))}
              />
            )}
          </Field>
          {textField("year", { required: true, type: "number", min: 1950 })}
        </div>

        {isBoardResult && (
          <fieldset className="border border-slate-200 rounded-sm px-3 pt-2 mb-3">
            <legend className="text-sm font-semibold text-slate-700 px-1">{t("boardResult")}</legend>
            <Field label={t("examName")} required help={t("examNameHelp")} error={errorFor("exam_name")}>
              {(a11y) => <Input {...a11y} value={form.exam_name} onChange={onChange("exam_name")} maxLength={30} />}
            </Field>
            <div className="grid grid-cols-3 gap-3">
              {["examinees", "passed", "gpa5"].map((field) => (
                <Field key={field} label={t(field)} required error={errorFor(field)}>
                  {(a11y) => <Input {...a11y} type="number" min={0} value={form[field]} onChange={onChange(field)} />}
                </Field>
              ))}
            </div>
            {rate != null && <p className="text-sm text-slate-600 mt-0">{t("passRatePreview").replace("{rate}", rate)}</p>}
          </fieldset>
        )}

        <Field label={t("descriptionEn")}>
          {(a11y) => <Textarea {...a11y} value={form.description_en} onChange={onChange("description_en")} />}
        </Field>
        <Field label={t("descriptionBn")}>
          {(a11y) => <Textarea {...a11y} value={form.description_bn} onChange={onChange("description_bn")} />}
        </Field>
        <Field label={t("photo")} help={isNew ? t("photoHelp") : t("photoKeepHelp")}>
          {(a11y) => (
            <Input {...a11y} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          )}
        </Field>
        {["is_featured", "is_published"].map((field) => (
          <label key={field} className="flex items-start gap-2 mb-2 text-sm text-slate-700">
            <input type="checkbox" className="mt-1" checked={form[field]} onChange={onToggle(field)} />
            <span>
              <span className="font-semibold">{t(field === "is_featured" ? "featured" : "published")}</span>
              <span className="block text-xs text-slate-500">{t(field === "is_featured" ? "featuredHelp" : "publishedHelp")}</span>
            </span>
          </label>
        ))}
      </form>
    </Drawer>
  );
}
