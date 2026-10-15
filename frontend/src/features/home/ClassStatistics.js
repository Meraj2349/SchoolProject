"use client";

import { useClasses } from "@/hooks/useClasses";
import { useQueries } from "@tanstack/react-query";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

// Bangla names of numbered classes ("Class 10" → দশম শ্রেণি).
const CLASS_NAMES_BN = {
  1: "প্রথম শ্রেণি",
  2: "দ্বিতীয় শ্রেণি",
  3: "তৃতীয় শ্রেণি",
  4: "চতুর্থ শ্রেণি",
  5: "পঞ্চম শ্রেণি",
  6: "ষষ্ঠ শ্রেণি",
  7: "সপ্তম শ্রেণি",
  8: "অষ্টম শ্রেণি",
  9: "নবম শ্রেণি",
  10: "দশম শ্রেণি",
  11: "একাদশ শ্রেণি",
  12: "দ্বাদশ শ্রেণি",
};

/** "Class 10" or "10" → the class's name in the reader's language; other names as they are. */
export function className(name, lang) {
  if (!name) return "Unknown";
  const n = parseInt(String(name).replace(/^class\s*/i, ""), 10);
  if (!isNaN(n)) {
    if (lang === "bn") return CLASS_NAMES_BN[n] ?? name;
    return `Class ${n}`;
  }
  return (
    String(name).charAt(0).toUpperCase() + String(name).slice(1).toLowerCase()
  );
}

function SectionHeader({ t }) {
  return (
    <div className="mb-[52px]">
      <div className="inline-flex items-center gap-[14px] mb-4">
        <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
        <span className="text-[0.75rem] text-[#c9a84c]">★</span>
        <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
      </div>
      <h2 className="text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold text-[#e2c07a] mb-[10px] tracking-tight leading-[1.2]">
        {t("studentStatistics")}
      </h2>
    </div>
  );
}

export default function ClassStatistics() {
  const { data: classes = [], isLoading, isError } = useClasses();
  const { currentBranchId: branchId, currentBranchName } = useBranchStore();
  const t = useTranslations("home");
  const lang = useLanguageStore((s) => s.language);

  const uniqueNames = [
    ...new Set(classes.map((c) => c.className || c.ClassName || c.name || c)),
  ];

  // Pass branchId in the query key so switching branches invalidates these counts
  const countQueries = useQueries({
    queries: uniqueNames.map((name) => ({
      queryKey: queryKeys.classes.studentCount(name, branchId),
      queryFn: () => classesService.getStudentCount(name),
      enabled: uniqueNames.length > 0,
    })),
  });

  const classData = uniqueNames
    .map((name, i) => {
      const res = countQueries[i];
      const count =
        res?.data?.totalStudents ??
        res?.data?.data?.totalStudents ??
        res?.data?.count ??
        0;
      return {
        displayName: className(name, lang),
        rawName: name,
        count: Number(count) || 0,
      };
    })
    .sort((a, b) => {
      const na = parseInt(a.rawName),
        nb = parseInt(b.rawName);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.displayName.localeCompare(b.displayName);
    });

  if (isLoading) {
    return (
      <div className="relative w-full box-border py-[72px] px-6 pb-20 bg-[#0d1f3c] text-center overflow-hidden">
        {/* Diagonal texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
          }}
        />
        {/* Top gold strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />
        {/* Bottom gold strip */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />
        <div className="relative z-[1]">
          <SectionHeader t={t} />
          <p className="text-[rgba(201,168,76,0.7)] text-[0.95rem]">
            {t("loadingClassStats")}
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative w-full box-border py-[72px] px-6 pb-20 bg-[#0d1f3c] text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />
        <div className="relative z-[1]">
          <SectionHeader t={t} />
          <p className="text-[rgba(201,168,76,0.7)] text-[0.95rem]">
            {t("failedClassStats")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full box-border py-[72px] px-6 pb-20 bg-[#0d1f3c] text-center overflow-hidden">
      {/* Diagonal texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
        }}
      />
      {/* Top gold strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />
      {/* Bottom gold strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />

      <div className="relative z-[1]">
        {/* Header */}
        <div className="mb-[52px]">
          {/* Star rule */}
          <div className="inline-flex items-center gap-[14px] mb-4">
            <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
            <span className="text-[0.75rem] text-[#c9a84c]">★</span>
            <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
          </div>
          <h2 className="text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold text-[#e2c07a] mb-[10px] tracking-tight leading-[1.2]">
            {t("studentStatistics")}
          </h2>
          <p className="text-[0.95rem] text-[rgba(226,192,122,0.7)] mx-auto mb-6 max-w-[440px] leading-[1.6]">
            {t("classWiseStudents")}
          </p>

          {/* Branch badge */}
          {branchId != null && (
            <div className="inline-flex items-center gap-[6px] mx-auto mt-2 px-[14px] py-[4px] bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.55)] rounded-[20px] text-xs text-[#e2c07a] font-semibold tracking-[0.04em]">
              <span>🏫</span>
              <span>{currentBranchName}</span>
            </div>
          )}

          {/* Diamond divider */}
          <div className="inline-flex items-center gap-[10px] mt-3">
            <span className="block w-10 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.5)]" />
            <span className="text-[0.5rem] text-[#c9a84c]">◆</span>
            <span className="block w-10 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.5)]" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="flex justify-center items-stretch gap-5 flex-wrap max-w-[1200px] mx-auto">
          {classData.length > 0 ? (
            classData.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="group relative w-[110px] h-[110px] rounded-full border-2 border-[rgba(201,168,76,0.45)] flex flex-col justify-center items-center bg-[rgba(255,255,255,0.05)] shadow-[0_0_0_6px_rgba(201,168,76,0.07),0_4px_18px_rgba(0,0,0,0.25)] transition-all duration-[280ms] hover:-translate-y-[7px] hover:scale-105 hover:shadow-[0_0_0_8px_rgba(201,168,76,0.12),0_12px_32px_rgba(0,0,0,0.35)] hover:border-[#c9a84c] hover:bg-[rgba(201,168,76,0.08)] cursor-default">
                  {/* Inner ring */}
                  <div className="absolute inset-[5px] rounded-full border border-[rgba(201,168,76,0.18)] pointer-events-none" />
                  <span className="text-[2rem] font-extrabold text-[#e2c07a] leading-none mb-1 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                    {d.count}
                  </span>
                  <span className="text-[0.72rem] font-bold capitalize text-[rgba(253,248,240,0.7)] tracking-[0.04em]">
                    {d.displayName}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[rgba(201,168,76,0.7)] text-[0.95rem]">
              {t("noClasses")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
