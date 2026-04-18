"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { quizService } from "@/services/quiz.service";
import { useQuizSessionStore } from "@/store/quizSessionStore";
import { branchService } from "@/services/branch.service";

export default function IdentityFormPage() {
  const router = useRouter();
  const setSession = useQuizSessionStore((s) => s.setSession);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    branchService
      .getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBranches(list.filter((b) => !b.is_proposed));
      })
      .catch(() => setBranches([]));
  }, []);

  /* Exact same input class as LoginPage / RegisterPage */
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40";
  const labelClass = "block text-sm font-medium text-white/80 mb-2";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !branchId ||
      !firstName ||
      !lastName ||
      !className ||
      !section ||
      !rollNumber
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { token, student } = await quizService.verifyStudent({
        branchId,
        firstName,
        lastName,
        className,
        section,
        rollNumber,
      });
      setSession(token, student);
      router.push("/quaker/quiz");
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || "Verification failed";
      setError(msg);
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
            {/* Header */}
            <div className="mb-6">
              <p className="text-center text-xs font-bold tracking-[0.14em] uppercase text-amber-300 mb-2">
                Verify Identity
              </p>
              <h2 className="text-center text-3xl font-bold text-white mb-1">
                Enter your details
              </h2>
              <p className="text-center text-sm text-white/60">
                We verify your identity against the student register. No account
                needed.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Branch */}
              <div>
                <label className={labelClass}>Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className={inputClass + " cursor-pointer appearance-none"}
                  style={{ colorScheme: "dark" }}
                  required
                >
                  <option value="">— Select your branch —</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name_en || b.name_bn || `Branch ${b.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* First / Last name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rifat"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Ahmed"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Class / Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Class</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Nursery"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Roll number */}
              <div>
                <label className={labelClass}>Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. B1-N-Be-01"
                  className={inputClass}
                  required
                />
              </div>

              {/* Primary button — exact LoginPage style */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl cursor-pointer transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30"
              >
                {loading ? "Verifying…" : "Verify & Start Quiz →"}
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
