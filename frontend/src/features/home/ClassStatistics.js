"use client";

import { useClasses } from "@/hooks/useClasses";
import { useQueries } from "@tanstack/react-query";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import "@/styles/ClassStatistics.css";

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

export default function ClassStatistics() {
  const { data: classes = [], isLoading, isError } = useClasses();
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

  const uniqueNames = [
    ...new Set(classes.map((c) => c.className || c.ClassName || c.name || c)),
  ];

  const countQueries = useQueries({
    queries: uniqueNames.map((name) => ({
      queryKey: queryKeys.classes.studentCount(name),
      queryFn: () => classesService.getStudentCount(name),
      enabled: uniqueNames.length > 0,
    })),
  });

  if (isLoading) {
    return (
      <div className="class-statistics-container">
        <div className="cs-topbar" />
        <div className="cs-header">
          <h2>{t("studentStatistics")}</h2>
          <p className="loading">{t("loadingClassStats")}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="class-statistics-container">
        <div className="cs-topbar" />
        <div className="cs-header">
          <h2>{t("studentStatistics")}</h2>
          <p className="error">{t("failedClassStats")}</p>
        </div>
      </div>
    );
  }

  const classData = uniqueNames
    .map((name, i) => {
      const res = countQueries[i];
      const count =
        res?.data?.totalStudents ??
        res?.data?.data?.totalStudents ??
        res?.data?.count ??
        0;
      return {
        displayName: fmtClass(name, lang),
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

  return (
    <div className="class-statistics-container">
      {/* Top gold strip */}
      <div className="cs-topbar" />

      {/* Header */}
      <div className="cs-header">
        <div className="cs-rule">
          <span className="cs-rule-line" />
          <span className="cs-rule-icon">★</span>
          <span className="cs-rule-line" />
        </div>
        <h2>{t("studentStatistics")}</h2>
        <p className="subtitle">{t("classWiseStudents")}</p>
        <div className="cs-divider">
          <span className="cs-div-line" />
          <span className="cs-div-diamond">◆</span>
          <span className="cs-div-line" />
        </div>
      </div>

      {/* Stats */}
      <div className="class-statistics">
        {classData.length > 0 ? (
          classData.map((d, i) => (
            <div key={i} className="class-statistics-item">
              <div className="circle">
                <span className="count">{d.count}</span>
                <span className="class-name">{d.displayName}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">{t("noClasses")}</p>
        )}
      </div>
    </div>
  );
}
