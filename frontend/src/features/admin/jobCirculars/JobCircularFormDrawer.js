"use client";

import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, Drawer, Field, Input, Textarea } from "@/components/admin/ui";
import { fillTemplate } from "@/lib/template";
import { useTranslations } from "@/store/languageStore";
import { EMPTY_POST, MAX_POSTS, validateCircularForm } from "./jobCircularForm";

const POSTER_TYPES = "image/jpeg,image/png,image/webp,application/pdf";

/**
 * Add / edit a job circular in a side drawer, with one fieldset per post.
 * Validates before calling onSave(form, poster); a failed save shows the
 * server's message (onSave rejects with it).
 */
export default function JobCircularFormDrawer({ initialValues, isNew, onSave, onClose }) {
  const t = useTranslations("admin.jobCirculars");
  const [form, setForm] = useState(initialValues);
  const [poster, setPoster] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const errorFor = (key) => (errors[key] ? t(`errors.${errors[key]}`) : undefined);
  const onChange = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  const onToggle = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.checked }));
  const onPostChange = (index, field) => (event) =>
    setForm((previous) => ({ ...previous, posts: previous.posts.map((post, i) => (i === index ? { ...post, [field]: event.target.value } : post)) }));
  const addPost = () => setForm((previous) => ({ ...previous, posts: [...previous.posts, EMPTY_POST] }));
  const removePost = (index) => setForm((previous) => ({ ...previous, posts: previous.posts.filter((_, i) => i !== index) }));

  const submit = async (event) => {
    event.preventDefault();
    const found = validateCircularForm(form);
    setErrors(found);
    setSaveError(null);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSave(form, poster);
    } catch (message) {
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, { required, type, help, multiline, ...props } = {}) => (
    <Field label={t(label)} required={required} help={help} error={errorFor(name)}>
      {(a11y) =>
        multiline ? (
          <Textarea {...a11y} value={form[name]} onChange={onChange(name)} {...props} />
        ) : (
          <Input {...a11y} type={type} value={form[name]} onChange={onChange(name)} {...props} />
        )
      }
    </Field>
  );

  const postField = (index, name, label, { required, ...props } = {}) => (
    <Field label={t(label)} required={required} error={errorFor(`posts.${index}.${name}`)}>
      {(a11y) => <Input {...a11y} value={form.posts[index][name]} onChange={onPostChange(index, name)} {...props} />}
    </Field>
  );

  return (
    <Drawer
      open
      title={isNew ? t("add") : t("edit")}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="job-circular-form" disabled={saving}>
            {t("save")}
          </Button>
        </>
      }
    >
      <form id="job-circular-form" onSubmit={submit} noValidate>
        {saveError && (
          <div role="alert" className="error-message">
            {saveError}
          </div>
        )}
        {field("title_en", "titleEn", { required: true, maxLength: 255 })}
        {field("title_bn", "titleBn", { required: true, maxLength: 255 })}
        <div className="grid grid-cols-2 gap-3">
          {field("circular_date", "circularDate", { required: true, type: "date" })}
          {field("deadline", "deadline", { type: "date", help: t("deadlineHelp") })}
        </div>

        <h3 className="mb-2 mt-1 text-sm font-semibold text-slate-700">{t("posts")}</h3>
        {errors.posts && (
          <p role="alert" className="mt-0 text-sm text-red-600">
            {errorFor("posts")}
          </p>
        )}
        {form.posts.map((_, index) => {
          const n = String(index + 1);
          return (
            <fieldset key={index} className="mb-3 rounded-sm border border-slate-200 px-3 pt-2">
              <legend className="px-1 text-sm font-semibold text-slate-700">{fillTemplate(t("postN"), { n })}</legend>
              {postField(index, "title_en", "postTitleEn", { required: true, maxLength: 255 })}
              {postField(index, "title_bn", "postTitleBn", { required: true, maxLength: 255 })}
              <div className="grid grid-cols-3 gap-3">
                {postField(index, "vacancies", "vacancies", { required: true, type: "number", min: 1 })}
                {postField(index, "salary_min", "salaryMin", { type: "number", min: 0 })}
                {postField(index, "salary_max", "salaryMax", { type: "number", min: 0 })}
              </div>
              {postField(index, "qualification_en", "qualificationEn")}
              {postField(index, "qualification_bn", "qualificationBn")}
              {form.posts.length > 1 && (
                <div className="mb-2 text-right">
                  <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => removePost(index)}>
                    {fillTemplate(t("removePost"), { n })}
                  </Button>
                </div>
              )}
            </fieldset>
          );
        })}
        {form.posts.length < MAX_POSTS && (
          <div className="mb-3">
            <Button size="sm" icon={FiPlus} onClick={addPost}>
              {t("addPost")}
            </Button>
          </div>
        )}

        {field("how_to_apply_en", "howToApplyEn", { multiline: true, help: t("howToApplyHelp") })}
        {field("how_to_apply_bn", "howToApplyBn", { multiline: true })}
        <Field label={t("poster")} help={isNew ? t("posterHelp") : t("posterKeepHelp")}>
          {(a11y) => <Input {...a11y} type="file" accept={POSTER_TYPES} onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />}
        </Field>
        {[
          ["is_open", "isOpen", "isOpenHelp"],
          ["is_published", "published", "publishedHelp"],
        ].map(([name, label, help]) => (
          <label key={name} className="mb-2 flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" className="mt-1" checked={form[name]} onChange={onToggle(name)} />
            <span>
              <span className="font-semibold">{t(label)}</span>
              <span className="block text-xs text-slate-500">{t(help)}</span>
            </span>
          </label>
        ))}
      </form>
    </Drawer>
  );
}
