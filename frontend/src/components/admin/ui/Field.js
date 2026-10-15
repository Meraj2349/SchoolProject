import { useId } from "react";

/** Label + control + error/help text, wired up for screen readers. */
export function Field({ label, error, help, required, children }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : help ? `${id}-help` : undefined;
  const control =
    typeof children === "function" ? children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy }) : children;
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600 mt-1 mb-0">
          {error}
        </p>
      ) : (
        help && (
          <p id={`${id}-help`} className="text-xs text-slate-500 mt-1 mb-0">
            {help}
          </p>
        )
      )}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`admin-input ${className}`} {...props} />;
}

export function Select({ options = [], placeholder, className = "", ...props }) {
  return (
    <select className={`admin-input ${className}`} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => {
        const { value, label } = typeof option === "object" ? option : { value: option, label: option };
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

export function Textarea({ className = "", rows = 3, ...props }) {
  return <textarea rows={rows} className={`admin-input ${className}`} {...props} />;
}
