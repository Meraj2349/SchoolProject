/** Page title with an optional subtitle and action buttons on the right. */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <h1 className="text-2xl font-normal text-slate-800 m-0">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1 mb-0">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
