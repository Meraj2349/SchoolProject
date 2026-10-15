"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import { isRemoteImage } from "@/lib/assetUrl";
import { useTranslations } from "@/store/languageStore";

export const SLIDE_INTERVAL_MS = 6000;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const reducedMotionQuery = () =>
  typeof window === "undefined" ? null : window.matchMedia?.(REDUCED_MOTION);
const subscribeReducedMotion = (onChange) => {
  const query = reducedMotionQuery();
  query?.addEventListener?.("change", onChange);
  return () => query?.removeEventListener?.("change", onChange);
};
const prefersReducedMotion = () => Boolean(reducedMotionQuery()?.matches);

/**
 * The home page's opening: a photo slideshow with the school's name, motto
 * and the two main actions. It turns by itself, pauses while the visitor
 * hovers or focuses it, can be paused, and stays still for visitors who
 * prefer reduced motion.
 */
export default function HeroSlider({ slides }) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false,
  );
  const [playChoice, setPlayChoice] = useState(null); // null until the visitor presses play/pause
  const playing = playChoice ?? !reducedMotion;
  const [held, setHeld] = useState(false); // hovered or focused
  const count = slides.length;
  const current = count > 0 ? index % count : 0;
  const label = (n) =>
    t("home.hero.slide").replace("{n}", n).replace("{total}", count);

  useEffect(() => {
    if (!playing || held || count < 2) return undefined;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % count),
      SLIDE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [playing, held, count]);

  const go = (step) => setIndex((current + step + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("home.hero.slides")}
      className="relative isolate h-[70vh] min-h-[420px] max-h-[640px] overflow-hidden bg-school-navy font-school-body"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div aria-live={playing ? "off" : "polite"}>
        {slides.map((slide, i) => (
          <div
            key={`${i}-${slide.src}`}
            role="group"
            aria-roledescription="slide"
            aria-label={label(i + 1)}
            aria-hidden={i !== current}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              unoptimized={isRemoteImage(slide.src)}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-school-navy-deep/90 via-school-navy/70 to-school-navy/20"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 text-white">
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.3em] text-school-gold-soft">
          {t("home.hero.welcome")}
        </p>
        <h1 className="m-0 mt-2 max-w-3xl font-school-heading text-4xl font-bold leading-tight md:text-6xl">
          {t("schoolName")}
        </h1>
        <span className="site-rule !mt-4 !w-24" aria-hidden="true" />
        <p className="m-0 mt-4 text-base font-semibold tracking-wide text-white/90 md:text-lg">
          {t("site.motto")}
        </p>
        <p className="m-0 mt-1 text-sm text-white/75">{t("location")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/apply" className="site-cta">
            {t("home.hero.apply")}
          </Link>
          <Link href="/result" className="site-cta-outline">
            {t("home.hero.results")}
          </Link>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-4 z-20 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={`${i}-${slide.src}`}
                type="button"
                aria-label={label(i + 1)}
                aria-current={i === current ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={`h-2.5 cursor-pointer rounded-full border-none transition-all ${i === current ? "w-8 bg-school-gold" : "w-2.5 bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {[
              {
                label: playing ? t("home.hero.pause") : t("home.hero.play"),
                icon: playing ? FiPause : FiPlay,
                onClick: () => setPlayChoice(!playing),
              },
              {
                label: t("home.hero.previous"),
                icon: FiChevronLeft,
                onClick: () => go(-1),
              },
              {
                label: t("home.hero.next"),
                icon: FiChevronRight,
                onClick: () => go(1),
              },
            ].map(({ label: name, icon: Icon, onClick }) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                title={name}
                onClick={onClick}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/50 bg-school-navy-deep/50 text-white hover:bg-school-gold hover:text-school-navy"
              >
                <Icon aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
