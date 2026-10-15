"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { FiAward, FiBookOpen, FiMusic, FiStar, FiTarget, FiTrendingUp } from "react-icons/fi";
import { usePublishedAchievements } from "@/hooks/useAchievements";
import { passRate, resultSummary } from "@/lib/achievements";
import { assetUrl, isRemoteImage } from "@/lib/assetUrl";
import { boardResultHighlights, categoriesPresent, formatNumber, formatYear, inCategory, localized, spotlightOf } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import SectionHeading from "./SectionHeading";

const CATEGORY_ICONS = {
  board_result: FiTrendingUp,
  academic: FiBookOpen,
  sports: FiTarget,
  cultural: FiMusic,
  competition: FiStar,
  award: FiAward,
};

function useText() {
  const t = useTranslations();
  const language = useLanguageStore((s) => s.language);
  return {
    t,
    language,
    title: (a) => localized(a, "title", language),
    year: (year) => formatYear(year, language),
    number: (n) => formatNumber(n, language),
    category: (a) => t(`achievements.categories.${a.category}`),
  };
}

function Spotlight({ achievement }) {
  const text = useText();
  const titleId = useId();
  const Icon = CATEGORY_ICONS[achievement.category] ?? FiAward;
  const image = assetUrl(achievement.image_url);
  return (
    <article aria-labelledby={titleId} className="grid overflow-hidden rounded-sm border border-school-gold/40 bg-white shadow-lg md:grid-cols-2">
      <div className="relative min-h-56 bg-school-navy">
        {image ? (
          <Image src={image} alt={text.title(achievement)} fill sizes="(min-width: 768px) 50vw, 100vw" unoptimized={isRemoteImage(image)} className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center" aria-hidden="true">
            <Icon className="text-7xl text-school-gold" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <span className="rounded-sm bg-school-gold px-2 py-0.5 text-school-navy">{text.t("home.honours.featured")}</span>
          <span className="text-school-muted">
            {text.category(achievement)} · {text.year(achievement.year)}
          </span>
        </div>
        <h3 id={titleId} className="site-heading m-0 text-2xl">
          {text.title(achievement)}
        </h3>
        {localized(achievement, "description", text.language) && (
          <p className="m-0 text-school-muted">{localized(achievement, "description", text.language)}</p>
        )}
        {achievement.category === "board_result" && (
          <p className="m-0 font-semibold text-school-navy">{resultSummary(achievement, (key) => text.t(`achievements.${key}`), text.number)}</p>
        )}
      </div>
    </article>
  );
}

function BoardResults({ results }) {
  const text = useText();
  return (
    <section aria-labelledby="board-results-title" className="mt-10">
      <h3 id="board-results-title" className="site-heading m-0 mb-4 text-center text-xl">
        {text.t("home.honours.resultsTitle")}
      </h3>
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <li key={result.id} className="rounded-sm border-t-4 border-school-gold bg-school-navy p-5 text-center text-white shadow">
            <p className="m-0 font-school-heading text-lg text-school-gold-soft">{`${result.exam_name} ${text.year(result.year)}`}</p>
            <div className="mt-3 flex justify-center gap-8">
              <div>
                <p className="m-0 font-school-heading text-4xl font-bold">{`${text.number(passRate(result) ?? 0)}%`}</p>
                <p className="m-0 text-xs uppercase tracking-wider text-white/70">{text.t("home.honours.passRate")}</p>
              </div>
              <div>
                <p className="m-0 font-school-heading text-4xl font-bold">{text.number(result.gpa5)}</p>
                <p className="m-0 text-xs uppercase tracking-wider text-white/70">{text.t("home.honours.gpa5")}</p>
              </div>
            </div>
            <p className="m-0 mt-3 text-sm text-white/70">{text.t("home.honours.examinees").replace("{count}", text.number(result.examinees))}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AchievementCard({ achievement }) {
  const text = useText();
  const Icon = CATEGORY_ICONS[achievement.category] ?? FiAward;
  const image = assetUrl(achievement.image_url);
  return (
    <li className="flex overflow-hidden rounded-sm border border-school-cream-deep bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative w-24 shrink-0 bg-school-cream-deep sm:w-28">
        {image ? (
          <Image src={image} alt="" fill sizes="112px" unoptimized={isRemoteImage(image)} className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center" aria-hidden="true">
            <Icon className="text-3xl text-school-gold" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1 p-4">
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-school-gold">
          {text.category(achievement)} · {text.year(achievement.year)}
        </p>
        <p className="m-0 font-school-heading font-bold leading-snug text-school-navy">{text.title(achievement)}</p>
        {achievement.category === "board_result" && (
          <p className="m-0 text-sm text-school-muted">{resultSummary(achievement, (key) => text.t(`achievements.${key}`), text.number)}</p>
        )}
      </div>
    </li>
  );
}

function CategoryTabs({ categories, selected, onSelect, panelId }) {
  const { t } = useText();
  const options = ["all", ...categories];
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = options[(options.indexOf(selected) + step + options.length) % options.length];
    onSelect(next);
    event.currentTarget.parentElement.querySelector(`[data-tab="${next}"]`)?.focus();
  };
  return (
    <div role="tablist" aria-label={t("home.honours.filter")} className="mb-6 flex flex-wrap justify-center gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          id={`${panelId}-${option}`}
          data-tab={option}
          aria-selected={selected === option}
          aria-controls={panelId}
          tabIndex={selected === option ? 0 : -1}
          onClick={() => onSelect(option)}
          onKeyDown={onKeyDown}
          className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
            selected === option
              ? "border-school-navy bg-school-navy text-white"
              : "border-school-navy/25 bg-white text-school-navy hover:border-school-navy"
          }`}
        >
          {option === "all" ? t("home.honours.all") : t(`home.honours.tabs.${option}`)}
        </button>
      ))}
    </div>
  );
}

/** The school's achievements: a featured spotlight, board results and a filterable honours list. */
export default function HonoursBoard() {
  const { t } = useText();
  const panelId = useId();
  const { data: achievements = [] } = usePublishedAchievements();
  const [category, setCategory] = useState("all");
  if (achievements.length === 0) return null;

  const spotlight = spotlightOf(achievements);
  const results = boardResultHighlights(achievements);
  const categories = categoriesPresent(achievements);
  const shown = inCategory(achievements, category).filter((a) => category !== "all" || a.id !== spotlight?.id);

  return (
    <section aria-labelledby="honours-title" className="bg-school-cream py-16 font-school-body">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading id="honours-title" eyebrow={t("home.honours.eyebrow")} title={t("home.honours.title")} subtitle={t("home.honours.subtitle")} />
        {spotlight && <Spotlight achievement={spotlight} />}
        {results.length > 0 && <BoardResults results={results} />}
        {shown.length + categories.length > 1 && (
          <div className="mt-12">
            <CategoryTabs categories={categories} selected={category} onSelect={setCategory} panelId={panelId} />
            <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-${category}`}>
              <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
