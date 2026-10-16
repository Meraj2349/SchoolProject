"use client";

import { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiImage, FiX } from "react-icons/fi";
import { EmptyState, ErrorState, PageHero, PublicPage, SiteImage, SiteLoader } from "@/components/site";
import useDialogFocus from "@/hooks/useDialogFocus";
import useEscapeKey from "@/hooks/useEscapeKey";
import { useImages } from "@/hooks/useImages";
import { formatNumber } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

// Must match Images.ImageType in the database.
const CATEGORIES = ["all", "school", "event", "notice", "student", "teacher"];

function PhotoViewer({ photos, index, onMove, onClose }) {
  const t = useTranslations("gallery");
  const language = useLanguageStore((s) => s.language);
  const ref = useDialogFocus(true);
  useEscapeKey(true, onClose);
  const photo = photos[index];
  const label = photo.Description || t("photo");
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (step) onMove(step);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-school-navy-deep/90 p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full max-w-5xl flex-col gap-3 outline-none"
      >
        <div className="flex items-center justify-between text-white">
          <p className="m-0 text-sm">
            {formatNumber(index + 1, language)} {t("of")} {formatNumber(photos.length, language)}
          </p>
          <button type="button" onClick={onClose} aria-label={t("close")} className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-transparent text-white hover:bg-white/10">
            <FiX aria-hidden="true" />
          </button>
        </div>
        <div className="relative h-[70vh] w-full">
          <SiteImage src={photo.ImagePath} alt={label} fill sizes="100vw" className="object-contain" />
        </div>
        {photo.Description && <p className="m-0 text-center text-white/85">{photo.Description}</p>}
        {photos.length > 1 && (
          <div className="flex justify-center gap-3">
            {[
              { step: -1, name: t("previous"), Icon: FiChevronLeft },
              { step: 1, name: t("next"), Icon: FiChevronRight },
            ].map(({ step, name, Icon }) => (
              <button key={step} type="button" onClick={() => onMove(step)} aria-label={name} className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-school-gold text-school-navy hover:bg-school-gold-soft">
                <Icon aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const t = useTranslations("gallery");
  const language = useLanguageStore((s) => s.language);
  const { data: images = [], isLoading, isError, refetch } = useImages();
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(null); // index into `photos`, or null
  // Focus goes back to the photo that opened the viewer (a click does not focus a button in every browser).
  const openerRef = useRef(null);
  const close = () => {
    setOpen(null);
    openerRef.current?.focus();
  };

  const photos = images.filter((image) => image.ImagePath && (category === "all" || image.ImageType === category));
  const move = (step) => setOpen((i) => (i + step + photos.length) % photos.length);
  const chooseCategory = (value) => {
    setCategory(value);
    setOpen(null);
  };

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div role="group" aria-label={t("browseByCategory")} className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => chooseCategory(value)}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                category === value ? "border-school-navy bg-school-navy text-white" : "border-school-navy/25 bg-white text-school-navy hover:border-school-navy"
              }`}
            >
              {t(`categories.${value}`)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SiteLoader label={t("loading")} />
        ) : isError ? (
          <ErrorState message={t("failedToLoad")} onRetry={refetch} />
        ) : photos.length === 0 ? (
          <EmptyState title={t("noImages")} icon={FiImage} />
        ) : (
          <>
            <p className="m-0 mb-4 text-sm text-school-muted">
              {t("showing")} <strong>{formatNumber(photos.length, language)}</strong> {t("images")}
            </p>
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, index) => {
                const label = photo.Description || t("photo");
                return (
                  <li key={photo.ImageID ?? index}>
                    <button
                      type="button"
                      aria-label={label}
                      onClick={(event) => {
                        openerRef.current = event.currentTarget;
                        setOpen(index);
                      }}
                      className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-sm border-none bg-school-cream-deep p-0"
                    >
                      <SiteImage src={photo.ImagePath} alt={label} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-school-navy-deep/85 to-transparent px-3 py-2 text-left text-xs font-semibold text-white">
                        {t(`categories.${photo.ImageType}`)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
      {open != null && photos[open] && <PhotoViewer photos={photos} index={open} onMove={move} onClose={close} />}
    </PublicPage>
  );
}
