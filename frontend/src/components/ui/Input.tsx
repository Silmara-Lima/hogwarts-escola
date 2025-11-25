// =========================================================================
// 1. Input Component
// =========================================================================

import { type InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

// =========================================================================
// Tipos e Props
// =========================================================================
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// =========================================================================
// Componente
// =========================================================================
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    const baseInputStyles = twMerge(
      "px-3 py-2 border rounded-md",
      "bg-amber-50 text-gray-800 border-gray-600 shadow-inner",
      "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-700",
      error ? "border-red-600 focus:ring-red-400" : "border-gray-600",
      className
    );

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            className={twMerge(
              "text-sm font-bold tracking-wider",
              error ? "text-red-600" : "text-gray-900"
            )}
          >
            {label}
          </label>
        )}
        <input ref={ref} className={baseInputStyles} {...props} />
        {error && (
          <span className="text-xs text-red-600 font-semibold">{error}</span>
        )}
      </div>
    );
  }
);
