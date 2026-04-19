"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/store/languageStore";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const SUPER_ADMIN_VALUE = "super";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedBranchName, setSelectedBranchName] = useState("");

  const [form, setForm] = useState({
    Username: "",
    Email: "",
    Password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const t = useTranslations("admin.register");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/branches`)
      .then((r) => {
        const list = Array.isArray(r.data?.data)
          ? r.data.data
          : Array.isArray(r.data)
            ? r.data
            : [];
        setBranches(list.filter((b) => !b.is_proposed || b.is_proposed === 0));
      })
      .catch(() => setBranches([]))
      .finally(() => setBranchesLoading(false));
  }, []);

  const isSuperAdmin = selectedBranchId === SUPER_ADMIN_VALUE;

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setSelectedBranchId(val);
    if (val === SUPER_ADMIN_VALUE) {
      setSelectedBranchName(t("superAdmin"));
    } else if (val) {
      const found = branches.find((b) => String(b.id) === val);
      setSelectedBranchName(
        found?.name_en || found?.name_bn || `Branch ${val}`,
      );
    } else {
      setSelectedBranchName("");
    }
  };

  const handleBranchContinue = (e) => {
    e.preventDefault();
    if (!selectedBranchId) return;
    setError("");
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
    setForm({ Username: "", Email: "", Password: "", confirmPassword: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.Password !== form.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        Username: form.Username,
        Email: form.Email,
        Password: form.Password,
        role: isSuperAdmin ? "super_admin" : "branch_admin",
        branch_id: isSuperAdmin ? null : parseInt(selectedBranchId, 10),
      };
      await authService.register(payload);
      alert(t("registrationSuccess"));
      router.replace("/admin/login");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          t("registrationFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:outline-none focus:border-emerald-300 focus:bg-white/15 focus:ring-2 focus:ring-emerald-300/40";

  const stepSubtitle = () => {
    if (step === 1) return t("selectBranch");
    if (isSuperAdmin) return t("superAdminRegister");
    return `${t("registeringAs")}: ${selectedBranchName}`;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#022c22]">
      <div className="relative hidden lg:block overflow-hidden">
        <Image
          src="/images/School Gate Picture.jpg"
          alt="School gate"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#022c22]/90 via-[#022c22]/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-400 flex items-center justify-center font-bold text-[#022c22] text-lg shadow-lg">
              S
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Star Shikkha Poribar
            </span>
          </div>
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Join the
              <br />
              <span className="text-emerald-300">mission.</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Create your admin account to start managing a branch or the entire
              network.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <span>◆ Fast setup</span>
            <span>◆ Role-based</span>
            <span>◆ Audited</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        <div className="lg:hidden absolute inset-0">
          <Image
            src="/images/School Gate Picture.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#022c22]/85" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? "bg-emerald-400 text-[#022c22]" : "bg-white/10 text-white/50"}`}
              >
                1
              </div>
              <div
                className={`h-0.5 w-12 transition-all ${step >= 2 ? "bg-emerald-400" : "bg-white/10"}`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? "bg-emerald-400 text-[#022c22]" : "bg-white/10 text-white/50"}`}
              >
                2
              </div>
            </div>

            <h2 className="text-center text-3xl font-bold text-white mb-1">
              {t("title")}
            </h2>
            <p className="text-center text-sm text-white/60 mb-6">
              {stepSubtitle()}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleBranchContinue}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t("selectBranch")}
                  </label>
                  {branchesLoading ? (
                    <div className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/40 text-sm">
                      Loading branches…
                    </div>
                  ) : (
                    <select
                      value={selectedBranchId}
                      onChange={handleBranchChange}
                      required
                      className={inputClass + " cursor-pointer appearance-none"}
                      style={{ colorScheme: "dark" }}
                    >
                      <option
                        value=""
                        disabled
                        style={{ background: "#022c22", color: "#ffffff" }}
                      >
                        {t("branchPlaceholder")}
                      </option>
                      {branches.map((b) => (
                        <option
                          key={b.id}
                          value={String(b.id)}
                          style={{ background: "#022c22", color: "#ffffff" }}
                        >
                          {b.name_en || b.name_bn}
                        </option>
                      ))}
                      <option
                        value={SUPER_ADMIN_VALUE}
                        style={{ background: "#022c22", color: "#ffffff" }}
                      >
                        ⚡ {t("superAdmin")}
                      </option>
                    </select>
                  )}
                </div>

                {selectedBranchId &&
                  !isSuperAdmin &&
                  (() => {
                    const b = branches.find(
                      (br) => String(br.id) === selectedBranchId,
                    );
                    return b ? (
                      <div className="mb-5 p-3 bg-emerald-400/10 border border-emerald-300/30 rounded-lg text-sm">
                        <p className="font-semibold text-emerald-200">
                          {b.name_en}
                        </p>
                        {b.name_bn && (
                          <p className="text-emerald-200/80 mt-0.5">{b.name_bn}</p>
                        )}
                        {(b.address_en || b.address_bn) && (
                          <p className="text-emerald-200/60 mt-1 text-xs">
                            {b.address_en || b.address_bn}
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}

                {isSuperAdmin && (
                  <div className="mb-5 p-3 bg-emerald-400/10 border border-emerald-300/30 rounded-lg text-sm">
                    <p className="font-semibold text-emerald-200">
                      ⚡ {t("superAdmin")}
                    </p>
                    <p className="text-emerald-200/70 mt-0.5 text-xs">
                      Full access to all branches — no branch required
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedBranchId || branchesLoading}
                  className="w-full py-3.5 bg-emerald-400 text-[#022c22] font-bold text-base rounded-xl cursor-pointer transition-all mt-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-400/30"
                >
                  {t("continueBtn")} →
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit}>
                {isSuperAdmin && (
                  <div className="mb-5 px-3 py-2 bg-emerald-400/10 border border-emerald-300/30 rounded-lg text-xs text-emerald-200 font-medium">
                    ⚡ Registering as Super Admin — no branch required
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t("username")}
                  </label>
                  <input
                    type="text"
                    name="Username"
                    value={form.Username}
                    onChange={handleChange}
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    name="Email"
                    value={form.Email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t("password")}
                  </label>
                  <input
                    type="password"
                    name="Password"
                    value={form.Password}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t("confirmPassword")}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3.5 text-white/80 font-semibold text-base rounded-xl border border-white/20 cursor-pointer transition-all hover:bg-white/5 bg-transparent"
                  >
                    ← {t("backBtn")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="grow py-3.5 bg-emerald-400 text-[#022c22] font-bold text-base rounded-xl cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-400/30"
                  >
                    {loading ? t("registering") : t("registerBtn")}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-6 pt-5 border-t border-white/10">
              <p className="text-white/60 text-sm m-0">
                {t("haveAccount")}{" "}
                <Link
                  href="/admin/login"
                  className="text-emerald-300 no-underline font-semibold hover:text-emerald-200 hover:underline transition-colors"
                >
                  {t("signIn")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
