const TONES = {
  primary: "var(--admin-primary)",
  success: "var(--admin-success)",
  warning: "var(--admin-warning)",
  danger: "var(--admin-danger)",
  info: "var(--admin-info)",
};

/** Classic "info box": coloured icon square, label and a big number. */
export default function StatBox({ icon: Icon, label, value, hint, tone = "primary" }) {
  return (
    <div className="flex items-stretch bg-white rounded-sm shadow-sm min-h-[90px]">
      <div
        className="flex items-center justify-center w-[90px] shrink-0 rounded-l-sm text-white text-4xl"
        style={{ background: TONES[tone] ?? TONES.primary }}
        aria-hidden="true"
      >
        {Icon && <Icon />}
      </div>
      <div className="flex flex-col justify-center px-4 py-2 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 truncate">{label}</span>
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    </div>
  );
}
