import React from "react";

type InputVariant = "default" | "filled";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: InputVariant;
}

const variantClasses: Record<InputVariant, string> = {
  default:
    "border border-stone-300 bg-white focus:border-orange-500 focus:ring-orange-500/20",
  filled:
    "border border-transparent bg-stone-100 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      variant = "default",
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={`w-full rounded-lg px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              icon ? "pl-10" : ""
            } ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : variantClasses[variant]
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 text-xs text-red-500"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-stone-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
