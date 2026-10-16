"use client";

import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { PageHero, PublicPage } from "@/components/site";
import { useBranches } from "@/hooks/useBranches";
import { applicationService } from "@/services/application.service";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const EMPTY = {
  applicant_name: "",
  date_of_birth: "",
  gender: "",
  applying_for_class: "",
  previous_school: "",
  previous_class: "",
  parent_name: "",
  parent_contact: "",
  parent_email: "",
  address: "",
  additional_info: "",
  branch_id: "",
};

const REQUIRED = ["applicant_name", "date_of_birth", "gender", "applying_for_class", "parent_name", "parent_contact", "branch_id"];

// Each fieldset of the form; `wide` fields span both columns.
const SECTIONS = [
  {
    key: "studentDetails",
    fields: [
      { name: "applicant_name", label: "applicantName", wide: true },
      { name: "branch_id", label: "branch", kind: "branch", wide: true },
      { name: "date_of_birth", label: "dateOfBirth", type: "date" },
      { name: "gender", label: "gender", kind: "gender" },
      { name: "applying_for_class", label: "applyingForClass" },
      { name: "previous_school", label: "previousSchool" },
      { name: "previous_class", label: "previousClass" },
    ],
  },
  {
    key: "parentDetails",
    fields: [
      { name: "parent_name", label: "parentName" },
      { name: "parent_contact", label: "parentContact", type: "tel" },
      { name: "parent_email", label: "parentEmail", type: "email", wide: true },
      { name: "address", label: "address", kind: "textarea", wide: true },
      { name: "additional_info", label: "additionalInfo", kind: "textarea", wide: true },
    ],
  },
];

const branchName = (branch, language) => (language === "bn" ? branch.name_bn : branch.name_en) || branch.name_en || branch.name_bn;

function Field({ field, value, invalid, onChange, branches }) {
  const t = useTranslations("apply");
  const language = useLanguageStore((s) => s.language);
  const required = REQUIRED.includes(field.name);
  const common = {
    id: field.name,
    name: field.name,
    value,
    onChange,
    required,
    "aria-invalid": invalid ? true : undefined,
    className: "site-input",
  };

  let control;
  if (field.kind === "branch")
    control = (
      <select {...common}>
        <option value="">—</option>
        {branches.map((b) => (
          <option key={b.id} value={String(b.id)}>
            {branchName(b, language)}
          </option>
        ))}
      </select>
    );
  else if (field.kind === "gender")
    control = (
      <select {...common}>
        <option value="">—</option>
        {["male", "female", "other"].map((g) => (
          <option key={g} value={g}>
            {t(g)}
          </option>
        ))}
      </select>
    );
  else if (field.kind === "textarea") control = <textarea {...common} rows={3} className="site-input min-h-24 resize-y" />;
  else control = <input {...common} type={field.type ?? "text"} />;

  return (
    <div className={field.wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={field.name} className="site-label">
        {t(field.label)}
        {required && (
          <span className="ml-0.5 text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
    </div>
  );
}

export default function OnlineApplyPage() {
  const t = useTranslations("apply");
  const [chosen, setForm] = useState(EMPTY);
  // Until the family picks a branch, use the one chosen on the website (the
  // saved choice can load after the first render).
  const websiteBranchId = useBranchStore((s) => s.currentBranchId);
  const form = {
    ...chosen,
    branch_id: chosen.branch_id || (websiteBranchId == null ? "" : String(websiteBranchId)),
  };
  const { data: branches = [] } = useBranches();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const missing = Object.fromEntries(REQUIRED.filter((field) => !form[field]?.trim()).map((field) => [field, true]));
    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      setSubmitError(t("requiredFields"));
      return;
    }
    setSubmitting(true);
    try {
      await applicationService.submit({ ...form, branch_id: Number(form.branch_id) });
      setSuccess(true);
    } catch (err) {
      // The API's own message is already translated; anything else (network
      // errors, stack traces) is replaced by ours.
      setSubmitError(err?.response?.data?.message || t("submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitError("");
    setSuccess(false);
  };

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        {success ? (
          <div role="status" className="rounded-sm border-t-4 border-school-gold bg-white px-6 py-12 text-center shadow">
            <FiCheckCircle aria-hidden="true" className="mx-auto text-5xl text-school-gold" />
            <h2 className="site-heading m-0 mt-4 text-2xl">{t("successTitle")}</h2>
            <p className="mx-auto mb-6 mt-3 max-w-md leading-relaxed text-school-muted">{t("successMessage")}</p>
            <button type="button" onClick={handleReset} className="site-cta">
              {t("submitAnother")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-8 rounded-sm border-t-4 border-school-gold bg-white px-5 py-8 shadow sm:px-8">
            <p className="m-0 text-sm text-school-muted">{t("requiredNote")}</p>
            {SECTIONS.map((section) => (
              <fieldset key={section.key} className="m-0 grid gap-5 border-0 p-0 sm:grid-cols-2">
                <legend className="site-heading mb-1 p-0 text-xl">{t(section.key)}</legend>
                {section.fields.map((field) => (
                  <Field key={field.name} field={field} value={form[field.name]} invalid={errors[field.name]} onChange={handleChange} branches={branches} />
                ))}
              </fieldset>
            ))}
            {submitError && (
              <p role="alert" className="m-0 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {submitError}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={submitting} className="site-cta disabled:opacity-60">
                {submitting ? t("submitting") : t("submitBtn")}
              </button>
            </div>
          </form>
        )}
      </div>
    </PublicPage>
  );
}
