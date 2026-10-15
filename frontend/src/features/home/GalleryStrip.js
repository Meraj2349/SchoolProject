"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useImages } from "@/hooks/useImages";
import { isRemoteImage } from "@/lib/assetUrl";
import { useTranslations } from "@/store/languageStore";
import SectionHeading from "./SectionHeading";

const PHOTOS_SHOWN = 6;
const CAMPUS_TYPES = ["school", "event", "notice"]; // not portraits of students or teachers

/** The latest campus photos, linking to the full gallery. Left out when there are none. */
export default function GalleryStrip() {
  const t = useTranslations("home.gallery");
  const { data: images = [] } = useImages();
  const photos = images.filter((image) => CAMPUS_TYPES.includes(image.ImageType) && image.ImagePath).slice(0, PHOTOS_SHOWN);
  if (photos.length === 0) return null;

  return (
    <section aria-labelledby="gallery-title" className="bg-school-cream py-16 font-school-body">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading id="gallery-title" eyebrow={t("eyebrow")} title={t("title")} />
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.ImageID} className="relative aspect-[4/3] overflow-hidden rounded-sm bg-school-cream-deep">
              <Image
                src={photo.ImagePath}
                alt={photo.Description || t("title")}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                unoptimized={isRemoteImage(photo.ImagePath)}
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link href="/gallery" className="inline-flex items-center gap-2 font-semibold text-school-navy no-underline hover:text-school-gold">
            {t("all")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
