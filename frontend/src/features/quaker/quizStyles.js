// Shared look of the student quiz pages (gold and navy, like the public site).
export const GOLD_STRIP =
  "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)";
export const GREEN = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
export const CARD =
  "bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07),0_8px_24px_rgba(13,31,60,0.06)] overflow-hidden";
export const PRIMARY_BUTTON =
  "py-3.5 text-white font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed";
export const SECONDARY_BUTTON =
  "py-3.5 text-[#5a6072] font-semibold text-base rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed";

export const pill = (active) =>
  active
    ? { background: GREEN, color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }
    : { background: "#f5f5f5", color: "#5a6072", border: "1px solid rgba(201,168,76,0.2)" };

export function GoldStrip({ className = "" }) {
  return <div className={`h-[3px] ${className}`} style={{ backgroundImage: GOLD_STRIP }} />;
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="bg-red-500/10 border border-red-400/30 text-red-700 px-4 py-2.5 rounded-lg mb-5 text-sm">
      {children}
    </div>
  );
}
