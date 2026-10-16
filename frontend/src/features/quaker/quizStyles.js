// Shared look of the student quiz pages, in the public site's navy and gold.
export const GOLD_STRIP =
  "linear-gradient(90deg, transparent 0%, var(--color-school-gold) 30%, var(--color-school-gold-soft) 50%, var(--color-school-gold) 70%, transparent 100%)";
/** Fill of primary buttons, the progress bar and chosen options. */
export const ACCENT = "var(--color-school-navy)";
export const CARD = "overflow-hidden rounded-sm border border-school-gold/25 bg-white shadow";
export const PRIMARY_BUTTON =
  "py-3.5 text-white font-bold text-base rounded-sm transition-colors hover:brightness-125 disabled:opacity-60 disabled:cursor-not-allowed";
export const SECONDARY_BUTTON =
  "py-3.5 text-school-muted font-semibold text-base rounded-sm border border-school-cream-deep bg-white hover:bg-school-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export const pill = (active) =>
  active
    ? { background: ACCENT, color: "var(--color-school-gold-soft)" }
    : { background: "var(--color-school-cream)", color: "var(--color-school-muted)", border: "1px solid var(--color-school-cream-deep)" };

export function GoldStrip({ className = "" }) {
  return <div className={`h-[3px] ${className}`} style={{ backgroundImage: GOLD_STRIP }} />;
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-5 rounded-sm border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
      {children}
    </div>
  );
}
