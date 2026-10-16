"use client";

import { useImages } from "@/hooks/useImages";
import { heroSlides } from "@/lib/homePage";
import { useTranslations } from "@/store/languageStore";
import HeroSlider from "./HeroSlider";

const SCHOOL_PHOTO = "/images/School Gate Picture.jpg";

/** The slideshow: the school gate photo, then school and event photos from the gallery. */
export default function HeroSection() {
  const t = useTranslations("home.hero");
  const { data: images = [] } = useImages();
  return <HeroSlider slides={heroSlides(images, { src: SCHOOL_PHOTO, alt: t("gateAlt") })} />;
}
