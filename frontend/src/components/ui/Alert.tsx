// =========================================================================
// 1. Alert Component
// =========================================================================

import React, { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";

// =========================================================================
// Tipos e Props
// =========================================================================
interface AlertProps {
  children: ReactNode;
  type?: "error" | "warning" | "info" | "success";
  className?: string;
}

// =========================================================================
// Mapas de ícones e estilos por tipo
// =========================================================================
const iconMap = {
  error: <ErrorIcon className="text-red-700" />,
  warning: <WarningIcon className="text-amber-700" />,
  info: <InfoIcon className="text-blue-700" />,
  success: <CheckCircleIcon className="text-green-700" />,
};

const typeStyles = {
  error: "border-red-600 bg-red-50 text-red-800",
  warning: "border-amber-600 bg-amber-50 text-amber-800",
  info: "border-blue-600 bg-blue-50 text-blue-800",
  success: "border-green-600 bg-green-50 text-green-800",
};

// =========================================================================
// Componente
// =========================================================================
export const Alert: React.FC<AlertProps> = ({
  children,
  type = "info",
  className,
}) => {
  const styles = typeStyles[type];

  return (
    <div
      role="alert"
      className={twMerge(
        "flex items-start p-4 border-l-4 rounded-md shadow-md font-serif",
        styles,
        className
      )}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">{iconMap[type]}</div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
};
