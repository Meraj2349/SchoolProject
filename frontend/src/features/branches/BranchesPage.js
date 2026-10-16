"use client";

import { FiBookOpen, FiCheck, FiGitBranch, FiMapPin, FiNavigation, FiUserCheck, FiUsers, FiX } from "react-icons/fi";
import { EmptyState, ErrorState, PageHero, PublicPage, SiteImage, SiteLoader } from "@/components/site";
import { useBranches } from "@/hooks/useBranches";
import { useBranchStats } from "@/hooks/useBranchStats";
import { formatDate, formatNumber, localized } from "@/lib/homePage";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const isProposed = (branch) => branch.is_proposed === true || branch.is_proposed === 1;
const STATS = [
  { key: "studentCount", label: "students", icon: FiUsers },
  { key: "teacherCount", label: "teachers", icon: FiUserCheck },
  { key: "classCount", label: "classes", icon: FiBookOpen },
];

function BranchCard({ branch, stats, isSelected, onSelect }) {
  const t = useTranslations("branches");
  const language = useLanguageStore((s) => s.language);
  const proposed = isProposed(branch);
  const name = localized(branch, "name", language) || `${t("branch")} ${branch.id}`;
  const address = localized(branch, "address", language);
  const description = localized(branch, "description", language);
  const hasCoords = branch.latitude != null && branch.longitude != null;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-sm bg-white shadow ${
        proposed ? "border-2 border-dashed border-school-muted/40" : isSelected ? "ring-2 ring-school-gold" : ""
      }`}
    >
      <div className="relative h-44 bg-school-navy">
        <SiteImage
          src={branch.image_url}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
          fallback={
            <div className="flex h-full items-center justify-center" aria-hidden="true">
              <FiGitBranch className="text-5xl text-school-gold" />
            </div>
          }
        />
        {proposed && <span className="absolute left-3 top-3 rounded-sm bg-white px-2 py-0.5 text-xs font-bold text-school-muted">{t("proposed")}</span>}
        {isSelected && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-sm bg-school-gold px-2 py-0.5 text-xs font-bold text-school-navy">
            <FiCheck aria-hidden="true" />
            {t("selected")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="site-heading m-0 text-lg">{name}</h3>
        {address && (
          <p className="m-0 flex items-start gap-1.5 text-sm text-school-muted">
            <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-school-gold" />
            {address}
          </p>
        )}
        {description && <p className="m-0 line-clamp-3 text-sm text-school-ink">{description}</p>}
        {branch.established_date && (
          <p className="m-0 text-xs text-school-muted">
            {t("established")}: {formatDate(branch.established_date, language)}
          </p>
        )}
        {stats && !proposed && (
          <dl className="m-0 mt-2 grid grid-cols-3 gap-2 text-center">
            {STATS.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex flex-col rounded-sm bg-school-cream px-1 py-2">
                <dt className="order-last text-[0.7rem] uppercase tracking-wide text-school-muted">{t(label)}</dt>
                <dd className="m-0 font-school-heading text-lg font-bold text-school-navy">
                  <Icon aria-hidden="true" className="mx-auto block text-base text-school-gold" />
                  {formatNumber(stats[key] ?? 0, language)}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          {!proposed && (
            <button type="button" onClick={() => onSelect(branch, name)} aria-pressed={isSelected} className="site-cta !px-3 !py-1.5 text-sm">
              {t("chooseBranch")}
            </button>
          )}
          {hasCoords && (
            <a
              href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-school-navy/30 px-3 py-1.5 text-sm font-semibold text-school-navy no-underline hover:bg-school-cream"
            >
              <FiNavigation aria-hidden="true" />
              {t("getDirections")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function BranchGroup({ id, title, branches, statsById, selectedId, onSelect, emptyText }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="site-heading m-0 text-2xl">
        {title}
      </h2>
      <span className="site-rule mb-6" aria-hidden="true" />
      {branches.length === 0 ? (
        <EmptyState title={emptyText} icon={FiGitBranch} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} stats={statsById[branch.id]} isSelected={selectedId === branch.id} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function BranchesPage() {
  const t = useTranslations("branches");
  const language = useLanguageStore((s) => s.language);
  const { data: branches = [], isLoading, isError, refetch } = useBranches();
  const { data: stats = [] } = useBranchStats();
  const { currentBranchId, setBranch, resetBranch } = useBranchStore();

  const statsById = Object.fromEntries((Array.isArray(stats) ? stats : []).map((s) => [s.id, s]));
  const active = branches.filter((b) => !isProposed(b));
  const proposed = branches.filter(isProposed);
  const current = branches.find((b) => b.id === currentBranchId);
  const select = (branch, name) => (branch.id === currentBranchId ? resetBranch() : setBranch(branch.id, name));

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")}>
        {currentBranchId != null && (
          <div role="status" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm">
            <FiMapPin aria-hidden="true" className="text-school-gold-soft" />
            {t("viewing")}: <strong>{current ? localized(current, "name", language) : `${t("branch")} ${currentBranchId}`}</strong>
            <button type="button" onClick={resetBranch} aria-label={t("clearSelection")} title={t("clearSelection")} className="ml-1 inline-flex cursor-pointer items-center rounded-full border-none bg-transparent p-1 text-white hover:bg-white/15">
              <FiX aria-hidden="true" />
            </button>
          </div>
        )}
      </PageHero>
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        {isLoading ? (
          <SiteLoader label={t("loading")} />
        ) : isError ? (
          <ErrorState message={t("failedToLoad")} onRetry={refetch} />
        ) : (
          <>
            <BranchGroup id="active-branches" title={t("activeBranches")} branches={active} statsById={statsById} selectedId={currentBranchId} onSelect={select} emptyText={t("noActiveBranches")} />
            {proposed.length > 0 && (
              <BranchGroup id="proposed-branches" title={t("proposedBranches")} branches={proposed} statsById={statsById} selectedId={currentBranchId} onSelect={select} emptyText={t("noProposedBranches")} />
            )}
          </>
        )}
      </div>
    </PublicPage>
  );
}
