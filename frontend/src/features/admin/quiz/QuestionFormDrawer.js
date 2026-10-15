"use client";

import { useId, useState } from "react";
import { Button, Drawer, Field, Input, Select, Textarea } from "@/components/admin/ui";
import MathText from "@/features/quaker/MathText";
import { useTranslations } from "@/store/languageStore";
import { LETTERS, toQuestionPayload, validateQuestionForm } from "./questionForm";

const ERROR_KEYS = { required: "required", tooLong: "subjectTooLong" };

function Preview({ form }) {
  const t = useTranslations("admin.quiz");
  const titleId = useId();
  const lines = [form.prompt, ...LETTERS.map((letter) => form[letter] && `${letter}. ${form[letter]}`)].filter(Boolean);
  const linesBn = [form.promptBn, ...LETTERS.map((letter) => form[`bn${letter}`] && `${letter}. ${form[`bn${letter}`]}`)].filter(Boolean);
  return (
    <section aria-labelledby={titleId} className="mt-2 mb-4 rounded-sm border border-slate-200 bg-slate-50 p-3 text-sm">
      <h3 id={titleId} className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {t("preview")}
      </h3>
      {lines.length === 0 && <p className="text-slate-400 m-0">{t("previewEmpty")}</p>}
      {[lines, linesBn].map((group, index) =>
        group.length > 0 ? (
          <div key={index} className={index ? "mt-3 pt-3 border-t border-slate-200" : ""}>
            {group.map((line, i) => (
              <MathText key={i} as="p" className={`m-0 ${i === 0 ? "font-semibold mb-1" : ""}`}>
                {line}
              </MathText>
            ))}
          </div>
        ) : null,
      )}
    </section>
  );
}

/**
 * Add / edit a quiz question: class, subject, English (required) and Bangla
 * (optional) text and options, correct answer, with a live LaTeX preview.
 */
export default function QuestionFormDrawer({ initialValues, isNew, classes, subjects, onSave, onClose }) {
  const t = useTranslations("admin.quiz");
  const subjectListId = useId();
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const onChange = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  const errorFor = (field) => (errors[field] ? t(ERROR_KEYS[errors[field]]) : undefined);

  const submit = async (event) => {
    event.preventDefault();
    const found = validateQuestionForm(form);
    setErrors(found);
    setSaveError(null);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSave(toQuestionPayload(form));
    } catch (message) {
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const textArea = (field, labelKey, required) => (
    <Field label={t(labelKey)} required={required} error={errorFor(field)}>
      {(a11y) => <Textarea {...a11y} rows={3} value={form[field]} onChange={onChange(field)} />}
    </Field>
  );
  const optionInputs = (prefix, labelKey, required) => (
    <div className="grid gap-x-3 sm:grid-cols-2">
      {LETTERS.map((letter) => (
        <Field key={letter} label={`${t(labelKey)} ${letter}`} required={required} error={errorFor(`${prefix}${letter}`)}>
          {(a11y) => <Input {...a11y} value={form[`${prefix}${letter}`]} onChange={onChange(`${prefix}${letter}`)} />}
        </Field>
      ))}
    </div>
  );

  return (
    <Drawer
      open
      title={isNew ? t("addQuestion") : t("editQuestion")}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="quiz-question-form" disabled={saving}>
            {t("save")}
          </Button>
        </>
      }
    >
      <form id="quiz-question-form" onSubmit={submit} noValidate>
        {saveError && (
          <div role="alert" className="error-message">
            {saveError}
          </div>
        )}
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Field label={t("class")} required error={errorFor("classKey")}>
            {(a11y) => (
              <Select
                {...a11y}
                value={form.classKey}
                onChange={onChange("classKey")}
                options={classes.map((c) => ({ value: c.key, label: c.label }))}
                placeholder={t("selectClass")}
              />
            )}
          </Field>
          <Field label={t("subject")} required error={errorFor("subject")} help={t("subjectHelp")}>
            {(a11y) => (
              <>
                <Input {...a11y} list={subjectListId} value={form.subject} onChange={onChange("subject")} maxLength={100} />
                <datalist id={subjectListId}>
                  {subjects.map((s) => (
                    <option key={s.subject} value={s.subject} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
        </div>

        {textArea("prompt", "promptEn", true)}
        {optionInputs("", "option", true)}

        <Field label={t("correctAnswer")} required>
          {(a11y) => <Select {...a11y} value={form.answer} onChange={onChange("answer")} options={LETTERS} />}
        </Field>

        <p className="text-sm font-semibold text-slate-700 mt-4 mb-1">{t("banglaSection")}</p>
        <p className="text-xs text-slate-500 mb-2">{t("banglaHelp")}</p>
        {textArea("promptBn", "promptBn", false)}
        {optionInputs("bn", "optionBn", false)}

        <p className="text-xs text-slate-500 mb-1">{t("latexHelp")}</p>
        <Preview form={form} />
      </form>
    </Drawer>
  );
}
