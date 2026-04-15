"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/store/languageStore";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Sentinel value — means super admin (no branch)
const SUPER_ADMIN_VALUE = "super";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1 = branch/role select, 2 = form
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(""); // "" | "super" | "1" | "2"…
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

  // Fetch active branches (public)
  useEffect(() => {
    axios
      .get(`${BASE_URL}/branches`)
      .then((r) => {
        const list = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
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
      setSelectedBranchName(found?.name_en || found?.name_bn || `Branch ${val}`);
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
        err.response?.data?.error || err.response?.data?.message || err.message || t("registrationFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 transition-all focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]";

  const stepSubtitle = () => {
    if (step === 1) return t("selectBranch");
    if (isSuperAdmin) return t("superAdminRegister");
    return `${t("registeringAs")}: ${selectedBranchName}`;
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-5"
      style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }}
    >
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm border border-white/20">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
          <div className={`h-0.5 w-10 transition-all ${step >= 2 ? "bg-indigo-600" : "bg-gray-200"}`} />
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
        </div>

        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2 tracking-tight">
          {t("title")}
        </h2>

        <p className="text-center text-sm text-gray-500 mb-6">
          {stepSubtitle()}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ── STEP 1: Branch / role selection ── */}
        {step === 1 && (
          <form onSubmit={handleBranchContinue}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                {t("selectBranch")}
              </label>
              {branchesLoading ? (
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                  Loading branches…
                </div>
              ) : (
                <select
                  value={selectedBranchId}
                  onChange={handleBranchChange}
                  required
                  className={inputClass + " cursor-pointer appearance-none"}
                >
                  <option value="" disabled>{t("branchPlaceholder")}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name_en || b.name_bn}
                    </option>
                  ))}
                  <option value={SUPER_ADMIN_VALUE}>
                    ⚡ {t("superAdmin")}
                  </option>
                </select>
              )}
            </div>

            {/* Branch info card */}
            {selectedBranchId && !isSuperAdmin && (() => {
              const b = branches.find((br) => String(br.id) === selectedBranchId);
              return b ? (
                <div className="mb-5 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm">
                  <p className="font-semibold text-indigo-800">{b.name_en}</p>
                  {b.name_bn && <p className="text-indigo-600 mt-0.5">{b.name_bn}</p>}
                  {(b.address_en || b.address_bn) && (
                    <p className="text-indigo-500 mt-1 text-xs">{b.address_en || b.address_bn}</p>
                  )}
                </div>
              ) : null;
            })()}

            {isSuperAdmin && (
              <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <p className="font-semibold text-amber-800">⚡ {t("superAdmin")}</p>
                <p className="text-amber-600 mt-0.5 text-xs">Full access to all branches — no branch required</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedBranchId || branchesLoading}
              className="w-full py-3.5 text-white font-semibold text-base rounded-lg border-none cursor-pointer transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }}
            >
              {t("continueBtn")} →
            </button>
          </form>
        )}

        {/* ── STEP 2: Registration form ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            {/* Super admin badge */}
            {isSuperAdmin && (
              <div className="mb-5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                ⚡ Registering as Super Admin — no branch required
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-600 mb-2">
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
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-600 mb-2">
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
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-600 mb-2">
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
              <label className="block text-sm font-medium text-gray-600 mb-2">
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
                className="flex-1 py-3.5 text-gray-600 font-semibold text-base rounded-lg border-2 border-gray-200 cursor-pointer transition-all hover:bg-gray-50 bg-white"
              >
                ← {t("backBtn")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 flex-grow py-3.5 text-white font-semibold text-base rounded-lg border-none cursor-pointer transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }}
              >
                {loading ? t("registering") : t("registerBtn")}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6 pt-5 border-t border-gray-200">
          <p className="text-gray-600 text-sm m-0">
            {t("haveAccount")}{" "}
            <Link href="/admin/login" className="text-indigo-500 no-underline font-semibold hover:text-purple-700 hover:underline transition-colors">
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
