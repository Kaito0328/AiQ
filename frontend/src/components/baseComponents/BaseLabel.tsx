
import React from "react";
import clsx from "clsx";
import { CoreColorKey, ColorPropertyKey, ColorStyle } from "../../style/colorStyle";
import { AllSizeProperties, getIconSizeClass, IconSizeProperty, IconSizeStyle, SizeKey, SizeStyle } from "../../style/size";
import { RoundKey } from "../../style/rounded";
import { FontWeightKey } from "../../style/fontWeight";
import { ShadowKey, ShadowStyle, ShadowVariantKey } from "../../style/shadow";
import { ComponentStyle, getClassByStyle, StyleMaps } from "../../style/style";
import { labelBgColorMap, labelTextColorMap } from "../../styleMap/colorMap";
import { labelSizeMap } from "../../styleMap/sizeMap";
import { labelIconSizeMap } from "../../styleMap/iconSizeMap";

export type LabelStyle = {
  color?: Partial<ColorStyle>;
  size?: Partial<SizeStyle>;
  roundKey?: RoundKey;
  fontWeightKey?: FontWeightKey;
  shadow?: Partial<ShadowStyle>;
};

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: CoreColorKey.Base,
    properties: [ColorPropertyKey.Label],
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: AllSizeProperties,
    full_width: false,
  },
  roundKey: RoundKey.Lg,
  fontWeightKey: FontWeightKey.Normal,
  shadow: {
    shadowKey: ShadowKey.None,
    variants: [ShadowVariantKey.Hover],
  },
};

interface Props {
  label?: string;
  icon?: React.ReactNode;
  iconRight?: boolean;
  style?: LabelStyle;
  bg_color?: boolean;
  center?: boolean;
};

const BaseLabel: React.FC<Props> = ({
  label,
  icon,
  iconRight = false,
  style,
  bg_color = false,
  center = false,
  }) => {

  const colorMap = bg_color ? labelBgColorMap : labelTextColorMap;
  const maps: Partial<StyleMaps> = {
    colorMap: colorMap,
    sizeMap: labelSizeMap,
  };
  const classText = getClassByStyle(maps, defaultStyle, style);
  
  const iconSizeStyle: IconSizeStyle = {
    sizeKey: style?.size?.sizeKey ?? defaultStyle.size.sizeKey,
    properties: [IconSizeProperty.Padding, IconSizeProperty.Text]
  }
  const iconClassText = getIconSizeClass(labelIconSizeMap, iconSizeStyle);

  return (
    <div className={clsx(
      "flex items-center",
      center && "justify-center",
      style?.size?.widthPercent && `w-max min-w-[${style.size.widthPercent}%]`,
      classText)
    }>
      {!iconRight &&icon && <span className={clsx(iconClassText, label&&"mr-2")}>{icon}</span>}
      {label && <span>{label}</span>}
      {iconRight &&icon && <span className={clsx(iconClassText, label&&"ml-2")}>{icon}</span>}
    </div>
  );
};

export default BaseLabel;
