import React from "react";
import LoadingButton from "./LoadingButton";

type Props = {
  onClick: () => void;
  label: string;
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "emerald" | "gray" | "red";
    rounded?: "sm" | "md" | "lg" | "full";
  fullWidth?: boolean;
  className?: string;
};

const Button: React.FC<Props> = ({
  onClick,
  label,
  size = "md",
  color = "indigo",
  rounded = "md",
  fullWidth = true,
  className = "",
}) => {

  return (
    <LoadingButton
        onClick={onClick}
        label={label}
        loading={false}
        size={size}
        color={color}
        rounded={rounded}
        fullWidth={fullWidth}
        className={className}
    />
  );
};

export default Button;
