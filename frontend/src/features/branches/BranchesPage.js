"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useBranches } from "@/hooks/useBranches";
import { useBranchStats } from "@/hooks/useBranchStats";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations, useLanguageStore } from "@/store/languageStore";
import "@/styles/BranchesPage.css";

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
    <div className="branch-stat-chip">
      <span className="branch-stat-icon">{icon}</span>
      <span className="branch-stat-value">{value}</span>
      <span className="branch-stat-label">{label}</span>
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
      className={`branch-card${isProposed ? " proposed" : ""}${isSelected ? " branch-card--selected" : ""}`}
      style={{ cursor: isProposed ? "default" : "pointer" }}
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
          className="branch-card-image"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = "flex";
            }
          }}
        />
      ) : null}
      <div
        className="branch-card-image-fallback"
        style={{ display: branch.image_url ? "none" : "flex" }}
      >
        🏫
      </div>

      <div className="branch-card-body">
        <div className="branch-card-header">
          <h3 className="branch-card-name">{name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isSelected && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 10px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                ✓ {t("selected")}
              </span>
            )}
            {isProposed && (
              <span className="proposed-badge">{t("proposed")}</span>
            )}
          </div>
        </div>

        {address && <p className="branch-card-address">📍 {address}</p>}

        {description && (
          <p className="branch-card-description">{description}</p>
        )}

        {branch.established_date && (
          <p className="branch-card-meta">
            <span>{t("established")}:</span> {fmtDate(branch.established_date)}
          </p>
        )}

        {stats && !isProposed && (
          <div className="branch-stats-row">
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
            className="branch-directions-link"
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
    <div className="branches-section">
      <h2 className="branches-section-title">{title}</h2>
      {branches.length === 0 ? (
        <div className="branches-empty">
          <div className="empty-icon">🏫</div>
          <p>{t(emptyKey)}</p>
        </div>
      ) : (
        <div className="branches-grid">
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

  // Build a quick lookup: branch id → stats
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
    // Toggle: clicking the already-selected branch deselects it (shows all)
    if (currentBranchId === branchId) {
      resetBranch();
    } else {
      setBranch(branchId, branchName);
    }
  };

  return (
    <div className="branches-page">
      <Navbar />
      <LatestUpdatesNotice />

      <div className="branches-header">
        <h1>{t("pageTitle")}</h1>
        <p>{t("pageSubtitle")}</p>
        {/* Active selection indicator */}
        {currentBranchId != null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
              padding: "8px 18px",
              background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)",
              border: "1.5px solid #10b981",
              borderRadius: 24,
              fontSize: 13,
              color: "#065f46",
              fontWeight: 600,
            }}
          >
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
              style={{
                background: "none",
                border: "none",
                color: "#059669",
                fontSize: 14,
                cursor: "pointer",
                padding: "0 2px",
                lineHeight: 1,
              }}
              aria-label={t("clearSelection")}
              title={t("clearSelection")}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="branches-container">
        {isLoading ? (
          <div className="branches-loading">
            <div className="spinner" />
            <p>{t("loading")}</p>
          </div>
        ) : isError ? (
          <div className="branches-error">
            <div className="error-icon">⚠️</div>
            <p>{t("failedToLoad")}</p>
            <button onClick={refetch} className="retry-btn">
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
