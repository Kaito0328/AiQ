import React from "react";
import clsx from "clsx";
import BaseLabel, { LabelStyle } from "../../baseComponents/BaseLabel";
import { CoreColorKey, ColorPropertyKey, ColorVariantKey } from "../../../style/colorStyle";

const defaultStyle: LabelStyle = {
  color: {
    colorKey: CoreColorKey.Primary,
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
  center?: boolean;
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
  center = true,
}) => {

  const mergedStyle: LabelStyle = {
    ...style,
    color: {
      colorKey: style?.color?.colorKey ?? defaultStyle.color?.colorKey,
      properties: style?.color?.properties ?? defaultStyle.color?.properties,
      variants: style?.color?.variants ?? defaultStyle.color?.variants 
    },
    size: {
      sizeKey: style?.size?.sizeKey ?? defaultStyle.size?.sizeKey,
      properties: style?.size?.properties ?? defaultStyle.size?.properties,
      full_width: style?.size?.full_width ?? defaultStyle.size?.full_width,
    }
  }

  return (
    <button
      onClick={is_submit ? undefined : onClick}
      title={title}
      className={clsx(
        disabled ? "cursor-not-allowed": "cursor-pointer",
        style?.size?.full_width && "w-full",
        style?.size?.widthPercent && `w-max min-w-[${style.size.widthPercent}%]`,
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
          center={center}
      />
    </button>
  );
};

export default BaseButton;