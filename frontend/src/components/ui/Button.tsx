// =========================================================================
// 1. Button Component
// =========================================================================

import React, { type ButtonHTMLAttributes } from "react";
import { CircularProgress } from "@mui/material";

// =========================================================================
// Tipos e Props
// =========================================================================
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "default" | "primary";
}

// =========================================================================
// Componente
// =========================================================================
export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  className,
  variant = "primary",
  ...props
}) => {
  const baseStyles =
    "w-full py-2 rounded-md font-serif font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wider text-lg";

  const variantStyles = {
    primary:
      "bg-red-700 text-yellow-100 shadow-md hover:bg-red-800 hover:shadow-xl border-2 border-yellow-500",
    default:
      "bg-yellow-100 text-gray-900 shadow-sm hover:bg-yellow-200 hover:shadow-lg border-2 border-gray-700",
  };

  const currentStyles = variantStyles[variant];

  return (
    <button
      disabled={isLoading || props.disabled}
      className={`${baseStyles} ${currentStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <CircularProgress
            size={20}
            color="inherit"
            sx={{ mr: 1, color: variant === "default" ? "gray" : "yellow" }}
          />
          Lançando Feitiço...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
