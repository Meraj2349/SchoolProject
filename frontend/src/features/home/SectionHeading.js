/** A home-page section title: small gold eyebrow, serif heading, gold rule, optional subtitle. */
export default function SectionHeading({ id, eyebrow, title, subtitle, align = "center", tone = "light" }) {
  const centred = align === "center";
  const onDark = tone === "dark";
  return (
    <div className={`mb-8 ${centred ? "text-center" : ""}`}>
      {eyebrow && (
        <p className={`m-0 mb-1 text-xs font-bold uppercase tracking-[0.25em] ${onDark ? "text-school-gold-soft" : "text-school-gold"}`}>
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={`site-heading m-0 text-2xl md:text-3xl ${onDark ? "!text-white" : ""}`}>
        {title}
      </h2>
      <span className={`site-rule ${centred ? "mx-auto" : ""}`} aria-hidden="true" />
      {subtitle && (
        <p className={`m-0 mt-3 max-w-2xl text-sm md:text-base ${centred ? "mx-auto" : ""} ${onDark ? "text-white/75" : "text-school-muted"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
