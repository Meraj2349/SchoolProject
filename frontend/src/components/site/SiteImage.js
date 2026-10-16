import Image from "next/image";
import { assetUrl, isRemoteImage } from "@/lib/assetUrl";

/**
 * next/image for school photos. Files stored on the API server (/uploads/...)
 * and other full URLs load directly; the optimiser refuses private addresses.
 * Without a photo it shows `fallback` (e.g. initials).
 */
export default function SiteImage({ src, alt, fallback = null, ...props }) {
  const url = assetUrl(src);
  if (!url) return fallback;
  return <Image src={url} alt={alt} unoptimized={isRemoteImage(url)} {...props} />;
}
