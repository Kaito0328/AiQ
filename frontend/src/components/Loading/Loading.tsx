import React from "react";
import { clsx } from "clsx";

type LoadingProps = {
  text?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "emerald" | "rose" | "gray";
  variant?: "spinner" | "dots";
  className?: string;
};

const colorMap = {
  blue: "border-blue-500 text-blue-500",
  emerald: "border-emerald-500 text-emerald-500",
  rose: "border-rose-500 text-rose-500",
  gray: "border-gray-500 text-gray-500",
};

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const Loading: React.FC<LoadingProps> = ({
  text = "Loading...",
  size = "md",
  color = "blue",
  variant = "spinner",
  className = "",
}) => {
  const colorClass = colorMap[color];
  const sizeClass = sizeMap[size];

  return (
    <div className={clsx("flex flex-col items-center gap-2", className)}>
      {variant === "spinner" ? (
        <div
          className={clsx(
            "animate-spin rounded-full border-t-4 border-b-4",
            sizeClass,
            colorClass
          )}
        ></div>
      ) : (
        <div className="flex space-x-1">
          <span className={clsx("animate-bounce", colorClass)}>•</span>
          <span className={clsx("animate-bounce delay-150", colorClass)}>•</span>
          <span className={clsx("animate-bounce delay-300", colorClass)}>•</span>
        </div>
      )}
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
};

export default Loading;
