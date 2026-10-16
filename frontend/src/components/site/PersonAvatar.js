import { fullName, initialsOf } from "@/lib/people";
import SiteImage from "./SiteImage";

/** A round photo of a student or teacher, or their initials when there is none. */
export default function PersonAvatar({ person, photo, size = 88 }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-[3px] border-school-gold bg-school-navy shadow-md"
      style={{ width: size, height: size }}
    >
      <SiteImage
        src={photo}
        alt={fullName(person)}
        fill
        sizes={`${size}px`}
        className="object-cover"
        fallback={
          <span className="flex h-full w-full items-center justify-center font-school-heading text-2xl font-bold text-school-gold-soft" aria-hidden="true">
            {initialsOf(person)}
          </span>
        }
      />
    </div>
  );
}
