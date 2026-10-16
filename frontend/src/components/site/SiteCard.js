/** A white card with the gold rule under its title, as on the home page. */
export default function SiteCard({ id, title, action, children, className = "" }) {
  return (
    <section aria-labelledby={title ? id : undefined} className={`min-w-0 rounded-sm bg-white p-6 shadow ${className}`}>
      {title && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id={id} className="site-heading m-0 text-xl">
              {title}
            </h2>
            <span className="site-rule" aria-hidden="true" />
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
