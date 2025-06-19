import React from "react";
import clsx from "clsx";
import BaseLabel, { LabelStyle } from "../../baseComponents/BaseLabel";
import { ColorKey, ColorPropertyKey, ColorVariantKey } from "../../../style/colorStyle";

const defaultStyle: LabelStyle = {
  color: {
    colorKey: ColorKey.Primary,
    properties: [ColorPropertyKey.Label, ColorPropertyKey.Bg],
    variants: [ColorVariantKey.Hover]
  }
}

type Props = {
  onClick?: () => void;
  label?: string;
  title?: string;
  icon?: React.ReactNode;
  iconRight?: boolean;
  disabled?: boolean
  style?: LabelStyle;
  bg_color?: boolean;
  is_submit?: boolean;
};

const BaseButton: React.FC<Props> = ({
  onClick,
  label,
  title,
  icon,
  iconRight = false,
  disabled,
  style,
  bg_color,
  is_submit = false,
}) => {

  const mergedStyle: LabelStyle = {
    ...style,
    color: {
      colorKey: style?.color?.colorKey ?? defaultStyle.color?.colorKey,
      properties: style?.color?.properties ?? defaultStyle.color?.properties,
      variants: style?.color?.variants ?? defaultStyle.color?.variants 
    }
  }

  return (
    <button
      onClick={is_submit ? undefined : onClick}
      title={title}
      className={clsx(
        disabled ? "cursor-not-allowed": "cursor-pointer",
        style?.size?.full_width && "w-full",
      )}
      disabled={disabled}
      type={is_submit ? "submit" : "button"}
    >
      <BaseLabel
        label={label}
        icon={icon}
        iconRight={iconRight}
        style={mergedStyle}
        bg_color={bg_color}
      />
    </button>
  );
};

export default BaseButton;