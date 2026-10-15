const VARIANTS = ["default", "primary", "success", "danger", "link"];

/** Classic admin button. variant: default | primary | success | danger | link */
export default function Button({ variant = "default", size, icon: Icon, children, className = "", type = "button", ...props }) {
  const variantClass = `admin-btn-${VARIANTS.includes(variant) ? variant : "default"}`;
  return (
    <button
      type={type}
      className={`admin-btn ${variantClass} ${size === "sm" ? "admin-btn-sm" : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </button>
  );
}
