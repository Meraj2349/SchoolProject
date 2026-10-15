import { useId } from "react";

/**
 * Classic admin "box": a card with a coloured top border, optional header
 * (title + tools) and footer. tone: primary | success | warning | danger
 * A titled box is a landmark region named by its title.
 */
export default function Box({ title, tools, footer, tone, bodyClassName = "admin-box-body", children, className = "" }) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={`admin-box ${tone ? `admin-box-${tone}` : ""} ${className}`}
    >
      {(title || tools) && (
        <header className="admin-box-header">
          {title && (
            <h2 id={titleId} className="admin-box-title">
              {title}
            </h2>
          )}
          {tools && <div className="flex flex-wrap items-center gap-2">{tools}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && <footer className="admin-box-footer">{footer}</footer>}
    </section>
  );
}
