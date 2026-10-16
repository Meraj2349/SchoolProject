"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiCheck } from "react-icons/fi";
import { useBranches } from "@/hooks/useBranches";
import { useQuizClasses } from "@/hooks/useQuizClasses";
import { quizErrorMessage, quizService } from "@/services/quiz.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import { ErrorBox } from "./quizStyles";
import { classesOf, sectionsOf } from "./quizText";

const EMPTY = { branchId: "", firstName: "", lastName: "", className: "", section: "", rollNumber: "" };
const POINTS = ["account", "access", "secure"];

const branchLabel = (branch, language) => (language === "bn" ? branch.name_bn || branch.name_en : branch.name_en || branch.name_bn) || `#${branch.id}`;

/**
 * A student proves who they are (branch, class, section, name, roll) and gets
 * a quiz session. Class and section come from the branch's real classes, so
 * they always match the register. Afterwards it calls `onVerified`, or else
 * goes to `next`.
 */
export default function IdentityFormPage({ next = "/quaker/quiz", onVerified }) {
  const router = useRouter();
  const t = useTranslations("quiz");
  const tq = useTranslations("quaker.identity");
  const language = useLanguageStore((s) => s.language);
  const setSession = useQuizSessionStore((s) => s.setSession);
  const ids = { branch: useId(), first: useId(), last: useId(), class: useId(), section: useId(), roll: useId() };

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: allBranches = [] } = useBranches();
  const branches = allBranches.filter((b) => !b.is_proposed);
  const { data: classes = [] } = useQuizClasses(form.branchId);

  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  // A new branch has its own classes; a new class its own sections.
  const chooseBranch = (event) => setForm((previous) => ({ ...previous, branchId: event.target.value, className: "", section: "" }));
  const chooseClass = (event) => setForm((previous) => ({ ...previous, className: event.target.value, section: "" }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const identity = Object.fromEntries(Object.entries(form).map(([field, value]) => [field, value.trim()]));
    if (Object.values(identity).some((value) => !value)) {
      setError(t("fillAllFields"));
      return;
    }
    setLoading(true);
    try {
      const { token, student } = await quizService.verifyStudent(identity);
      setSession(token, student);
      if (onVerified) await onVerified(student);
      else router.push(next);
    } catch (failure) {
      setError(quizErrorMessage(failure, t("verifyFailed")));
    } finally {
      setLoading(false);
    }
  };

  const select = (id, label, value, onChange, placeholder, options, disabled = false) => (
    <div>
      <label htmlFor={id} className="site-label">
        {label}
      </label>
      <select id={id} value={value} onChange={onChange} disabled={disabled} className="site-input disabled:opacity-60">
        <option value="">{placeholder}</option>
        {options.map(({ value: optionValue, label: optionLabel }) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
  const input = (id, label, field, autoComplete) => (
    <div>
      <label htmlFor={id} className="site-label">
        {label}
      </label>
      <input id={id} type="text" value={form[field]} onChange={set(field)} autoComplete={autoComplete} className="site-input" />
    </div>
  );
  const plain = (values) => values.map((value) => ({ value, label: value }));

  return (
    <section className="mx-auto grid max-w-6xl gap-0 px-4 py-12 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-l-sm bg-school-navy-deep text-white lg:block">
        <Image src="/images/School Gate Picture.jpg" alt="" fill sizes="50vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-linear-to-br from-school-navy-deep via-school-navy/85 to-school-navy/40" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-end gap-6 p-10">
          <p className="m-0 font-school-heading text-4xl font-bold leading-tight">
            {tq("headline")} <span className="block text-school-gold-soft">{tq("headlineAccent")}</span>
          </p>
          <span className="site-rule" aria-hidden="true" />
          <p className="m-0 max-w-md text-white/80">{tq("body")}</p>
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm text-school-gold-soft">
            {POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-1.5">
                <FiCheck aria-hidden="true" />
                {tq(`points.${point}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-sm border-t-4 border-school-gold bg-white p-6 shadow sm:p-10 lg:rounded-l-none">
        <h1 className="site-heading m-0 text-3xl">{t("identityTitle")}</h1>
        <span className="site-rule" aria-hidden="true" />
        <p className="mb-6 mt-4 text-sm text-school-muted">{t("identityBody")}</p>

        <ErrorBox>{error}</ErrorBox>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {select(ids.branch, t("branch"), form.branchId, chooseBranch, t("selectBranch"), branches.map((b) => ({ value: String(b.id), label: branchLabel(b, language) })))}
          <div className="grid gap-4 sm:grid-cols-2">
            {select(ids.class, t("class"), form.className, chooseClass, t("selectClass"), plain(classesOf(classes)), !form.branchId)}
            {select(ids.section, t("section"), form.section, set("section"), t("selectSection"), plain(sectionsOf(classes, form.className)), !form.className)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {input(ids.first, t("firstName"), "firstName", "given-name")}
            {input(ids.last, t("lastName"), "lastName", "family-name")}
          </div>
          {input(ids.roll, t("rollNumber"), "rollNumber")}
          <button type="submit" disabled={loading} className="site-cta w-full disabled:opacity-60">
            {loading ? t("verifying") : t("verify")}
          </button>
        </form>

        <p className="m-0 mt-6 border-t border-school-cream-deep pt-5 text-center text-xs text-school-muted">{tq("privacy")}</p>
      </div>
    </section>
  );
}
