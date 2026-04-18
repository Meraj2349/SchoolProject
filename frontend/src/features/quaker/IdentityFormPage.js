"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 transition-all focus:outline-none focus:border-amber-300 focus:bg-white/15 focus:ring-2 focus:ring-amber-300/40";
  const labelClass = "block text-sm font-medium text-white/80 mb-2";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!branchId || !firstName || !lastName || !className || !section || !rollNumber) {
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
      const msg = err.response?.data?.error || err.message || "Verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-amber-300 text-sm font-medium mb-2">Verify Identity</p>
        <h1 className="text-4xl font-bold mb-2">Enter your details</h1>
        <p className="text-white/60">
          We verify your identity against the student register. No account needed.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelClass}>Branch</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className={inputClass}
            style={{ colorScheme: "dark" }}
            required
          >
            <option value="">-- Select your branch --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name_en || b.name_bn || `Branch ${b.id}`}
              </option>
            ))}
          </select>
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-amber-400 text-[#0a1628] font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30"
        >
          {loading ? "Verifying…" : "Verify & Start Quiz →"}
        </button>
      </form>

      <p className="text-white/30 text-xs text-center mt-6">
        Your details are verified against the student register but never stored separately.
      </p>
    </div>
  );
}
