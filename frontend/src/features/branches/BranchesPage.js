"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useBranches } from "@/hooks/useBranches";
import { useBranchStats } from "@/hooks/useBranchStats";
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

function BranchCard({ branch, stats, language, t }) {
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
    <div className={`branch-card${isProposed ? " proposed" : ""}`}>
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
          {isProposed && (
            <span className="proposed-badge">{t("proposed")}</span>
          )}
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

function BranchSection({ title, branches, statsMap, emptyKey, language, t }) {
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

  return (
    <div className="branches-page">
      <Navbar />
      <LatestUpdatesNotice />

      <div className="branches-header">
        <h1>{t("pageTitle")}</h1>
        <p>{t("pageSubtitle")}</p>
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
            />
            <BranchSection
              title={t("proposedBranches")}
              branches={proposed}
              statsMap={statsMap}
              emptyKey="noProposedBranches"
              language={language}
              t={t}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
