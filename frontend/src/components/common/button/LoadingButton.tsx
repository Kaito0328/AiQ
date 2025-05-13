import React from "react";
import clsx from "clsx";

type Props = {
  onClick: () => void;
  label: string;
  loading: boolean;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "emerald" | "gray" | "red" | "white";
  rounded?: "sm" | "md" | "lg" | "full";
  fullWidth?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "py-1 px-4 text-sm",
  md: "py-2 px-6 text-base",
  lg: "py-3 px-8 text-lg",
};

const roundedMap = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const colorMap = {
  indigo: {
    base: "bg-indigo-600 text-white hover:bg-indigo-700",
    loading: "bg-indigo-300 text-white cursor-not-allowed",
  },
  emerald: {
    base: "bg-emerald-600 text-white hover:bg-emerald-700",
    loading: "bg-emerald-300 text-white cursor-not-allowed",
  },
  gray: {
    base: "bg-gray-600 text-white hover:bg-gray-700",
    loading: "bg-gray-300 text-white cursor-not-allowed",
  },
  red: {
    base: "bg-red-600 text-white hover:bg-red-700",
    loading: "bg-red-300 text-white cursor-not-allowed",
  },
  white: {
    base: "bg-white text-purple-600 shadow-lg hover:bg-purple-100 hover:scale-105 transform duration-200",
    loading: "bg-gray-400 text-gray-200 cursor-not-allowed",
  },
};

const LoadingButton: React.FC<Props> = ({
  onClick,
  label,
  loading,
  loadingText,
  size = "md",
  color = "indigo",
  rounded = "md",
  fullWidth = true,
  className = "",
}) => {
  const styles = colorMap[color];
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={clsx(
        "font-semibold transition",
        sizeMap[size],
        roundedMap[rounded],
        fullWidth && "w-full",
        loading ? styles.loading : styles.base,
        className
      )}
    >
      {loading ? loadingText ?? `${label}中...` : label}
    </button>
  );
};

export default LoadingButton;
