"use client";

import { useClasses } from "@/hooks/useClasses";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";

const NUM_TO_TEXT_EN = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  11: "Eleven",
  12: "Twelve",
};

const NUM_TO_TEXT_BN = {
  1: "এক",
  2: "দুই",
  3: "তিন",
  4: "চার",
  5: "পাঁচ",
  6: "ছয়",
  7: "সাত",
  8: "আট",
  9: "নয়",
  10: "দশ",
  11: "এগারো",
  12: "বারো",
};

function fmtClass(name, lang) {
  if (!name) return "Unknown";
  const n = parseInt(name);
  if (!isNaN(n)) {
    if (lang === "bn") return NUM_TO_TEXT_BN[n] ?? name;
    return NUM_TO_TEXT_EN[n] ?? `Class ${n}`;
  }
  return (
    String(name).charAt(0).toUpperCase() + String(name).slice(1).toLowerCase()
  );
}

function SectionHeader({ t }) {
  return (
    <div className="mb-[52px]">
      <div className="inline-flex items-center gap-[14px] mb-4">
        <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(16,185,129,0.6)]" />
        <span className="text-[0.75rem] text-[#10b981]">★</span>
        <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(16,185,129,0.6)]" />
      </div>
      <h2 className="text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold text-[#a7f3d0] mb-[10px] tracking-tight leading-[1.2]">
        {t("studentStatistics")}
      </h2>
    </div>
  );
}

export default function ClassStatistics() {
  const { data: classes = [], isLoading, isError } = useClasses();
  const { currentBranchId: branchId } = useBranchStore();
  const t = useTranslations("home");
  const lang =
    typeof window !== "undefined"
      ? (() => {
          try {
            const s = localStorage.getItem("language");
            return s ? (JSON.parse(s)?.state?.language ?? "bn") : "bn";
          } catch {
            return "bn";
          }
        })()
      : "bn";

  // Aggregate StudentCount (already returned per class+section row by /classes,
  // branch-scoped via the httpClient interceptor) into per-ClassName totals.
  const totals = new Map();
  for (const c of classes) {
    const name = c.ClassName || c.className || c.name;
    if (!name) continue;
    const n = Number(c.StudentCount ?? c.studentCount ?? 0) || 0;
    totals.set(name, (totals.get(name) || 0) + n);
  }

  const classData = [...totals.entries()]
    .map(([name, count]) => ({
      displayName: fmtClass(name, lang),
      rawName: name,
      count,
    }))
    .sort((a, b) => {
      const na = parseInt(a.rawName),
        nb = parseInt(b.rawName);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.displayName.localeCompare(b.displayName);
    });

  const totalStudents = classData.reduce((s, d) => s + (d.count || 0), 0);

  if (isLoading) {
    return (
      <div className="relative w-full box-border py-[72px] px-6 pb-20 bg-[#064e3b] text-center overflow-hidden">
        {/* Diagonal texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
          }}
        />
        {/* Top gold strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10b981] via-[#a7f3d0] via-[#10b981] to-transparent" />
        {/* Bottom gold strip */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10b981] via-[#a7f3d0] via-[#10b981] to-transparent" />
        <div className="relative z-[1]">
          <SectionHeader t={t} />
          <p className="text-[rgba(16,185,129,0.7)] text-[0.95rem]">
            {t("loadingClassStats")}
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative w-full box-border py-[72px] px-6 pb-20 bg-[#064e3b] text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10b981] via-[#a7f3d0] via-[#10b981] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10b981] via-[#a7f3d0] via-[#10b981] to-transparent" />
        <div className="relative z-[1]">
          <SectionHeader t={t} />
          <p className="text-[rgba(16,185,129,0.7)] text-[0.95rem]">
            {t("failedClassStats")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full box-border py-[72px] px-6 pb-20 bg-[#064e3b] text-center overflow-hidden">
      {/* Diagonal texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
        }}
      />
      {/* Top gold strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10b981] via-[#a7f3d0] via-[#10b981] to-transparent" />
      {/* Bottom gold strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10b981] via-[#a7f3d0] via-[#10b981] to-transparent" />

      <div className="relative z-[1]">
        {/* Header */}
        <div className="mb-[52px]">
          {/* Star rule */}
          <div className="inline-flex items-center gap-[14px] mb-4">
            <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(16,185,129,0.6)]" />
            <span className="text-[0.75rem] text-[#10b981]">★</span>
            <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(16,185,129,0.6)]" />
          </div>
          <h2 className="text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold text-[#a7f3d0] mb-[10px] tracking-tight leading-[1.2]">
            {t("studentStatistics")}
          </h2>
          <p className="text-[0.95rem] text-[rgba(167,243,208,0.7)] mx-auto mb-6 max-w-[440px] leading-[1.6]">
            {t("classWiseStudents")}
          </p>

          {/* Total summary — headline aggregate */}
          <div className="mt-4 inline-flex flex-col items-center gap-1 px-6 py-3 rounded-2xl bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.35)]">
            <span className="text-[2.4rem] font-extrabold text-[#a7f3d0] leading-none [text-shadow:0_2px_10px_rgba(0,0,0,0.35)]">
              {totalStudents}
            </span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[rgba(167,243,208,0.8)]">
              {t("totalStudentsLabel")}
            </span>
            {branchId == null && (
              <span className="text-[0.65rem] text-[rgba(167,243,208,0.6)]">
                {t("acrossAllBranches")}
              </span>
            )}
          </div>

          {/* Diamond divider */}
          <div className="inline-flex items-center gap-[10px] mt-3">
            <span className="block w-10 h-px bg-gradient-to-r from-transparent to-[rgba(16,185,129,0.5)]" />
            <span className="text-[0.5rem] text-[#10b981]">◆</span>
            <span className="block w-10 h-px bg-gradient-to-l from-transparent to-[rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="flex justify-center items-stretch gap-5 flex-wrap max-w-[1200px] mx-auto">
          {classData.length > 0 ? (
            classData.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="group relative w-[110px] h-[110px] rounded-full border-2 border-[rgba(16,185,129,0.45)] flex flex-col justify-center items-center bg-[rgba(255,255,255,0.05)] shadow-[0_0_0_6px_rgba(16,185,129,0.07),0_4px_18px_rgba(0,0,0,0.25)] transition-all duration-[280ms] hover:-translate-y-[7px] hover:scale-105 hover:shadow-[0_0_0_8px_rgba(16,185,129,0.12),0_12px_32px_rgba(0,0,0,0.35)] hover:border-[#10b981] hover:bg-[rgba(16,185,129,0.08)] cursor-default">
                  {/* Inner ring */}
                  <div className="absolute inset-[5px] rounded-full border border-[rgba(16,185,129,0.18)] pointer-events-none" />
                  <span className="text-[2rem] font-extrabold text-[#a7f3d0] leading-none mb-1 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                    {d.count}
                  </span>
                  <span className="text-[0.72rem] font-bold capitalize text-[rgba(253,248,240,0.7)] tracking-[0.04em]">
                    {d.displayName}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[rgba(16,185,129,0.7)] text-[0.95rem]">
              {t("noClasses")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
