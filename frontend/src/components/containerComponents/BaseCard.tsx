import React, { PropsWithChildren } from "react";
import { AllSizeProperties, SizeKey, SizeStyle } from "../../style/size";
import { RoundKey } from "../../style/rounded";
import { ColorKey, ColorPropertyKey, ColorStyle, ColorVariantKey} from "../../style/colorStyle";
import { ShadowKey, ShadowStyle, ShadowVariantKey } from "../../style/shadow";
import { ComponentStyle, getClassByStyle, StyleMaps } from "../../style/style";
import { cardColorMap } from "../../styleMap/colorMap";
import { cardSizeMap } from "../../styleMap/sizeMap";

type CardStyle = {
  color: Partial<ColorStyle>;
  size: Partial<SizeStyle>;
  roundKey: RoundKey;
  shadow: ShadowStyle; 
};

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: ColorKey.Base,
    properties: [ColorPropertyKey.Bg],
    variants: [ColorVariantKey.Hover],
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: AllSizeProperties,
    full_width: true,
  },
  roundKey: RoundKey.Lg,
  shadow: {
    shadowKey: ShadowKey.MD,
    variants: [ShadowVariantKey.Hover],
  },
};

interface Props {
  onClick?: () => void;
  width_full?: boolean;
  style?: Partial<CardStyle>;
}

const BaseCard: React.FC<PropsWithChildren<Props>> = ({
  onClick,
  style,
  children,
}) => {
  const maps: Partial<StyleMaps> = {
    colorMap: cardColorMap,
    sizeMap: cardSizeMap,
  };

  const classText = getClassByStyle(maps, defaultStyle, style);
  return (
  <div 
    onClick={onClick}
    className={classText}>
      {children}
  </div>
  );
};

export default BaseCard;