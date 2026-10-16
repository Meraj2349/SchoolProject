"use client";

import { useId, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { useSubmitJobApplication } from "@/hooks/useJobApplications";
import { localized } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { EMPTY_APPLICATION, cvProblem, toApplicationFormData, validateApplication } from "./applyForm";

const CV_TYPES = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

/** The online application for one open circular. */
export default function ApplyForm({ circular }) {
  const t = useTranslations("jobs.form");
  const language = useLanguageStore((s) => s.language);
  const id = useId();
  const submit = useSubmitJobApplication();
  const [form, setForm] = useState(() => ({ ...EMPTY_APPLICATION, post_index: circular.posts.length === 1 ? "0" : "" }));
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [sent, setSent] = useState(null);

  const change = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const send = async (event) => {
    event.preventDefault();
    const found = validateApplication(form);
    const cvError = cvProblem(cv);
    if (cvError) found.cv = cvError;
    setErrors(found);
    setFailure(Object.keys(found).length ? t("fillRequired") : "");
    if (Object.keys(found).length) return;
    try {
      const result = await submit.mutateAsync(toApplicationFormData(form, circular.id, cv));
      setSent(result?.message ?? "");
    } catch (error) {
      // The API's message is already in the visitor's language; anything else is ours.
      setFailure(error?.response?.data?.message || t("failed"));
    }
  };

  const again = () => {
    setForm({ ...EMPTY_APPLICATION, post_index: circular.posts.length === 1 ? "0" : "" });
    setCv(null);
    setSent(null);
  };

  if (sent !== null) {
    return (
      <div role="status" className="rounded-sm bg-school-cream px-5 py-8 text-center">
        <FiCheckCircle aria-hidden="true" className="mx-auto text-4xl text-school-gold" />
        <h3 className="site-heading m-0 mt-3 text-xl">{t("sent")}</h3>
        {sent && <p className="mx-auto mb-5 mt-2 max-w-md text-school-muted">{sent}</p>}
        <button type="button" onClick={again} className="site-cta-ghost">
          {t("another")}
        </button>
      </div>
    );
  }

  const field = (name, label, { help, required = true, as = "input", ...props } = {}) => {
    const fieldId = `${id}-${name}`;
    const Control = as;
    return (
      <div className={as === "textarea" ? "sm:col-span-2" : undefined}>
        <label htmlFor={fieldId} className="site-label">
          {t(label)}
          {required && (
            <span className="ml-0.5 text-red-700" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <Control
          id={fieldId}
          value={form[name]}
          onChange={change(name)}
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={errors[name] || help ? `${fieldId}-note` : undefined}
          className={`site-input ${as === "textarea" ? "min-h-20 resize-y" : ""}`}
          {...props}
        />
        {(errors[name] || help) && (
          <p id={`${fieldId}-note`} className={`m-0 mt-1 text-xs ${errors[name] ? "font-semibold text-red-700" : "text-school-muted"}`}>
            {errors[name] ? t(errors[name]) : t(help)}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={send} noValidate className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-post`} className="site-label">
          {t("post")}
          <span className="ml-0.5 text-red-700" aria-hidden="true">
            *
          </span>
        </label>
        <select id={`${id}-post`} value={form.post_index} onChange={change("post_index")} aria-invalid={errors.post_index ? true : undefined} className="site-input">
          <option value="">{t("choosePost")}</option>
          {circular.posts.map((post, index) => (
            <option key={index} value={String(index)}>
              {localized(post, "title", language)}
            </option>
          ))}
        </select>
      </div>
      {field("full_name", "fullName", { autoComplete: "name", maxLength: 150 })}
      {field("phone", "phone", { type: "tel", inputMode: "tel", autoComplete: "tel", help: "phoneHelp" })}
      {field("email", "email", { type: "email", autoComplete: "email", required: false, maxLength: 150 })}
      {field("education", "education", { help: "educationHelp", maxLength: 255 })}
      {field("address", "address", { as: "textarea", rows: 2, autoComplete: "street-address" })}
      {field("experience", "experience", { as: "textarea", rows: 3, required: false })}
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-cv`} className="site-label">
          {t("cv")}
        </label>
        <input
          id={`${id}-cv`}
          type="file"
          accept={CV_TYPES}
          onChange={(e) => setCv(e.target.files?.[0] ?? null)}
          aria-invalid={errors.cv ? true : undefined}
          aria-describedby={`${id}-cv-note`}
          className="site-input"
        />
        <p id={`${id}-cv-note`} className={`m-0 mt-1 text-xs ${errors.cv ? "font-semibold text-red-700" : "text-school-muted"}`}>
          {errors.cv ? t(errors.cv) : t("cvHelp")}
        </p>
      </div>
      {/* Hidden from people; bots fill it in and are ignored. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>{t("website")}</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={form.website} onChange={change("website")} />
      </div>
      {failure && (
        <p role="alert" className="m-0 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 sm:col-span-2">
          {failure}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={submit.isPending} className="site-cta disabled:opacity-60">
          {submit.isPending ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}
