"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/store/languageStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const t = useTranslations("admin.login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authService.login({
        Email: email,
        Password: password,
      });
      if (data.token) {
        setToken(data.token);
        router.replace("/admin/notices");
      } else {
        setError(data.message || t("loginFailed"));
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.message || err.message || t("somethingWrong"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-5"
      style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }}
    >
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm border border-white/20">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8 tracking-tight">
          {t("title")}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              {t("email")}
            </label>
            <input
              type="email"
              id="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 transition-all focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              {t("password")}
            </label>
            <input
              type="password"
              id="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 transition-all focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-white font-semibold text-base rounded-lg border-none cursor-pointer transition-all duration-300 mt-2.5 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
            }}
          >
            {loading ? t("loggingIn") : t("loginBtn")}
          </button>
        </form>

        <div className="text-center mt-6 pt-5 border-t border-gray-200">
          <p className="text-gray-600 text-sm m-0">
            {t("noAccount")}{" "}
            <Link
              href="/admin/register"
              className="text-indigo-500 no-underline font-semibold hover:text-purple-700 hover:underline transition-colors"
            >
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
