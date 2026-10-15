"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { quizErrorMessage, quizService } from "@/services/quiz.service";
import { branchService } from "@/services/branch.service";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import { classesOf, sectionsOf } from "./quizText";

const EMPTY = { branchId: "", firstName: "", lastName: "", className: "", section: "", rollNumber: "" };

/* Same input look as LoginPage / RegisterPage */
const inputClass =
  "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40 disabled:opacity-50";
const selectClass = `${inputClass} cursor-pointer appearance-none`;
const labelClass = "block text-sm font-medium text-white/80 mb-2";

/**
 * A student proves who they are (branch, class, section, name, roll) and gets
 * a quiz session. Class and section come from the branch's real classes, so
 * they always match the register. Afterwards it calls `onVerified`, or else
 * goes to `next`.
 */
export default function IdentityFormPage({ next = "/quaker/quiz", onVerified }) {
  const router = useRouter();
  const t = useTranslations("quiz");
  const language = useLanguageStore((s) => s.language);
  const setSession = useQuizSessionStore((s) => s.setSession);
  const ids = { branch: useId(), first: useId(), last: useId(), class: useId(), section: useId(), roll: useId() };

  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    branchService
      .getAll()
      .then((data) => setBranches((Array.isArray(data) ? data : []).filter((b) => !b.is_proposed)))
      .catch(() => setBranches([]));
  }, []);

  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  // A new branch has its own classes; a new class its own sections.
  const chooseBranch = (event) => {
    const branchId = event.target.value;
    setForm((previous) => ({ ...previous, branchId, className: "", section: "" }));
    setClasses([]);
    if (!branchId) return;
    quizService
      .classesOf(branchId)
      .then((rows) => setClasses(Array.isArray(rows) ? rows : []))
      .catch(() => setClasses([]));
  };
  const chooseClass = (event) => setForm((previous) => ({ ...previous, className: event.target.value, section: "" }));

  const branchName = (b) => (language === "bn" ? b.name_bn || b.name_en : b.name_en || b.name_bn) || `#${b.id}`;

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

  return (
    /* Full-page dark grid — same structure as LoginPage */
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a1628]">
      {/* ── LEFT HERO PANEL ── */}
      <div className="relative hidden lg:block overflow-hidden">
        <Image
          src="/images/School Gate Picture.jpg"
          alt="School gate"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#0a1628]/90 via-[#0a1628]/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center font-bold text-[#0a1628] text-lg shadow-lg">
              🧠
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Star Shikkha Poribar
            </span>
          </div>
          {/* Headline */}
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Prove who you are.
              <br />
              <span className="text-amber-300">Start learning.</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              No account, no password. Your identity is verified directly
              against the student register — instant access to every quiz.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <span>◆ No account</span>
            <span>◆ Instant access</span>
            <span>◆ Secure verify</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile background image */}
        <div className="lg:hidden absolute inset-0">
          <Image
            src="/images/School Gate Picture.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0a1628]/85" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Card — exact same as LoginPage card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-center text-3xl font-bold text-white mb-1">{t("identityTitle")}</h2>
              <p className="text-center text-sm text-white/60">{t("identityBody")}</p>
            </div>

            {error && (
              <div role="alert" className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor={ids.branch} className={labelClass}>
                  {t("branch")}
                </label>
                <select id={ids.branch} value={form.branchId} onChange={chooseBranch} className={selectClass} style={{ colorScheme: "dark" }}>
                  <option value="">{t("selectBranch")}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {branchName(b)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={ids.class} className={labelClass}>
                    {t("class")}
                  </label>
                  <select
                    id={ids.class}
                    value={form.className}
                    onChange={chooseClass}
                    disabled={!form.branchId}
                    className={selectClass}
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="">{t("selectClass")}</option>
                    {classesOf(classes).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={ids.section} className={labelClass}>
                    {t("section")}
                  </label>
                  <select
                    id={ids.section}
                    value={form.section}
                    onChange={set("section")}
                    disabled={!form.className}
                    className={selectClass}
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="">{t("selectSection")}</option>
                    {sectionsOf(classes, form.className).map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={ids.first} className={labelClass}>
                    {t("firstName")}
                  </label>
                  <input id={ids.first} type="text" value={form.firstName} onChange={set("firstName")} className={inputClass} autoComplete="given-name" />
                </div>
                <div>
                  <label htmlFor={ids.last} className={labelClass}>
                    {t("lastName")}
                  </label>
                  <input id={ids.last} type="text" value={form.lastName} onChange={set("lastName")} className={inputClass} autoComplete="family-name" />
                </div>
              </div>

              <div>
                <label htmlFor={ids.roll} className={labelClass}>
                  {t("rollNumber")}
                </label>
                <input id={ids.roll} type="text" value={form.rollNumber} onChange={set("rollNumber")} className={inputClass} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl cursor-pointer transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30"
              >
                {loading ? t("verifying") : t("verify")}
              </button>
            </form>

            {/* Footer note */}
            <div className="text-center mt-6 pt-5 border-t border-white/10">
              <p className="text-white/40 text-xs m-0">
                Your details are verified against the student register but never
                stored separately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
