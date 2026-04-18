"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useBranches } from "@/hooks/useBranches";
import { useBranchStats } from "@/hooks/useBranchStats";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations, useLanguageStore } from "@/store/languageStore";

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatChip({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-[0.15rem] bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5 min-w-16 flex-1">
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-base font-bold text-gray-900 leading-none">{value}</span>
      <span className="text-[0.7rem] text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function BranchCard({ branch, stats, language, t, isSelected, onSelect }) {
  const isProposed = branch.is_proposed === true || branch.is_proposed === 1;
  const name =
    language === "bn"
      ? branch.name_bn || branch.name_en
      : branch.name_en || branch.name_bn;
  const address =
    language === "bn"
      ? branch.address_bn || branch.address_en
      : branch.address_en || branch.address_bn;
  const description =
    language === "bn"
      ? branch.description_bn || branch.description_en
      : branch.description_en || branch.description_bn;
  const hasCoords = branch.latitude != null && branch.longitude != null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`
    : null;

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-200 border ${
        isProposed
          ? "border-dashed border-2 border-gray-400 bg-gray-50"
          : isSelected
          ? "border-emerald-500 outline outline-[2.5px] outline-emerald-500 outline-offset-2 -translate-y-0.5"
          : "border border-gray-200 hover:-translate-y-1 hover:shadow-xl"
      }`}
      style={{
        cursor: isProposed ? "default" : "pointer",
        boxShadow: isSelected
          ? "0 0 0 4px rgba(16,185,129,0.12), 0 8px 32px rgba(16,185,129,0.18)"
          : "0 2px 12px rgba(0,0,0,0.07)",
      }}
      onClick={() => !isProposed && onSelect && onSelect(branch.id, name)}
      role={isProposed ? undefined : "button"}
      tabIndex={isProposed ? undefined : 0}
      onKeyDown={(e) => {
        if (!isProposed && onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(branch.id, name);
        }
      }}
      aria-pressed={isSelected}
      title={isProposed ? undefined : t("selectBranch")}
    >
      {branch.image_url ? (
        <img
          src={branch.image_url}
          alt={name}
          className="w-full h-[180px] object-cover block"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = "flex";
            }
          }}
        />
      ) : null}
      <div
        className="w-full h-[180px] items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-5xl text-blue-300"
        style={{ display: branch.image_url ? "none" : "flex" }}
      >
        🏫
      </div>

      <div className="p-5 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[1.05rem] font-bold text-gray-900 m-0 flex-1">{name}</h3>
          <div className="flex items-center gap-1.5">
            {isSelected && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white tracking-wide"
                style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)" }}>
                ✓ {t("selected")}
              </span>
            )}
            {isProposed && (
              <span className="text-[0.72rem] font-semibold bg-gray-100 text-gray-500 border border-gray-300 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                {t("proposed")}
              </span>
            )}
          </div>
        </div>

        {address && <p className="text-sm text-gray-600 leading-relaxed m-0">📍 {address}</p>}

        {description && (
          <p className="text-[0.85rem] text-gray-500 leading-snug m-0 line-clamp-3">{description}</p>
        )}

        {branch.established_date && (
          <p className="text-[0.8rem] text-gray-400 m-0">
            <span className="font-semibold text-gray-500">{t("established")}:</span> {fmtDate(branch.established_date)}
          </p>
        )}

        {stats && !isProposed && (
          <div className="flex gap-2 mt-1 flex-wrap">
            <StatChip icon="🎓" value={stats.studentCount ?? 0} label={t("students")} />
            <StatChip icon="👨‍🏫" value={stats.teacherCount ?? 0} label={t("teachers")} />
            <StatChip icon="🏫" value={stats.classCount ?? 0} label={t("classes")} />
          </div>
        )}

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-auto pt-3 text-sm font-semibold text-blue-600 no-underline hover:text-blue-800 hover:underline"
          >
            🗺️ {t("getDirections")}
          </a>
        )}
      </div>
    </div>
  );
}

function BranchSection({ title, branches, statsMap, emptyKey, language, t, selectedBranchId, onSelect }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 m-0 mb-6 pb-2 border-b-[3px] border-blue-600 inline-block">{title}</h2>
      {branches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🏫</div>
          <p className="m-0">{t(emptyKey)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch, idx) => (
            <BranchCard
              key={branch.id ?? branch.branch_id ?? idx}
              branch={branch}
              stats={statsMap[branch.id] ?? null}
              language={language}
              t={t}
              isSelected={selectedBranchId === branch.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BranchesPage() {
  const { data: allBranches = [], isLoading, isError, refetch } = useBranches();
  const { data: statsData = [] } = useBranchStats();
  const { currentBranchId, setBranch, resetBranch } = useBranchStore();
  const t = useTranslations("branches");
  const language = useLanguageStore((s) => s.language);

  const statsMap = Object.fromEntries(
    (Array.isArray(statsData) ? statsData : []).map((s) => [s.id, s])
  );

  const active = (Array.isArray(allBranches) ? allBranches : []).filter(
    (b) => !b.is_proposed || b.is_proposed === 0 || b.is_proposed === false,
  );
  const proposed = (Array.isArray(allBranches) ? allBranches : []).filter(
    (b) => b.is_proposed === true || b.is_proposed === 1,
  );

  const handleSelectBranch = (branchId, branchName) => {
    if (currentBranchId === branchId) {
      resetBranch();
    } else {
      setBranch(branchId, branchName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Header */}
      <div
        className="text-white text-center px-6 py-12"
        style={{ background: "linear-gradient(135deg, #1a3a6e 0%, #2563eb 100%)" }}
      >
        <h1 className="text-[2.25rem] font-extrabold m-0 mb-2 tracking-tight">{t("pageTitle")}</h1>
        <p className="text-[1.05rem] opacity-85 m-0">{t("pageSubtitle")}</p>
        {currentBranchId != null && (
          <div className="inline-flex items-center gap-2.5 mt-3 px-4 py-2 rounded-3xl text-sm font-semibold text-green-900"
            style={{ background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)", border: "1.5px solid #10b981" }}>
            <span>📍 {t("viewing")}:</span>
            <span>
              {allBranches.find((b) => b.id === currentBranchId)
                ? (language === "bn"
                    ? (allBranches.find((b) => b.id === currentBranchId).name_bn ||
                       allBranches.find((b) => b.id === currentBranchId).name_en)
                    : (allBranches.find((b) => b.id === currentBranchId).name_en ||
                       allBranches.find((b) => b.id === currentBranchId).name_bn))
                : `Branch ${currentBranchId}`}
            </span>
            <button
              onClick={resetBranch}
              className="bg-transparent border-none text-emerald-600 text-sm cursor-pointer p-0 leading-none"
              aria-label={t("clearSelection")}
              title={t("clearSelection")}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 pb-16">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="m-0">{t("loading")}</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="m-0 mb-4">{t("failedToLoad")}</p>
            <button
              onClick={refetch}
              className="mt-2 px-5 py-2 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : (
          <>
            <BranchSection
              title={t("activeBranches")}
              branches={active}
              statsMap={statsMap}
              emptyKey="noActiveBranches"
              language={language}
              t={t}
              selectedBranchId={currentBranchId}
              onSelect={handleSelectBranch}
            />
            <BranchSection
              title={t("proposedBranches")}
              branches={proposed}
              statsMap={statsMap}
              emptyKey="noProposedBranches"
              language={language}
              t={t}
              selectedBranchId={currentBranchId}
              onSelect={handleSelectBranch}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
