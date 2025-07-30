import React, { PropsWithChildren } from "react";
import { AllSizeProperties, SizeKey, SizeStyle } from "../../style/size";
import { RoundKey } from "../../style/rounded";
import {
  CoreColorKey,
  ColorPropertyKey,
  ColorStyle,
  ColorVariantKey,
} from "../../style/colorStyle";
import {
  ShadowKey,
  ShadowStyle,
  ShadowVariantKey,
} from "../../style/shadow";
import {
  ComponentStyle,
  getClassByStyle,
  StyleMaps,
} from "../../style/style";
import { cardColorMap } from "../../styleMap/colorMap";
import { cardSizeMap } from "../../styleMap/sizeMap";
import LoadingIndicator from "../common/Loading/loadingIndicator";
import BaseLabel from "../baseComponents/BaseLabel";

type CardStyle = {
  color: Partial<ColorStyle>;
  size: Partial<SizeStyle>;
  roundKey: RoundKey;
  shadow: ShadowStyle;
};

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: CoreColorKey.Base,
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
  loading?: boolean;
  loadingText?: string;
  errorMessage?: string;
}

const BaseCard: React.FC<PropsWithChildren<Props>> = ({
  onClick,
  style,
  loading,
  loadingText = "読み込み中です…",
  errorMessage,
  children,
}) => {
  const maps: Partial<StyleMaps> = {
    colorMap: cardColorMap,
    sizeMap: cardSizeMap,
  };

  const classText = getClassByStyle(maps, defaultStyle, style);
  const colorKey = style?.color?.colorKey ?? defaultStyle.color.colorKey;

  return (
    <div onClick={onClick} className={classText}>
      {loading ? (
        <LoadingIndicator
          text={loadingText}
          colorKey={colorKey}
          sizeKey={style?.size?.sizeKey ?? SizeKey.MD}
        />
      ) : errorMessage ? (
        <BaseLabel
          label={errorMessage}
          style={{
            color: { colorKey: CoreColorKey.Danger },
            size: { sizeKey: SizeKey.MD },
          }}
        />
      ) : (
        children
      )}
    </div>
  );
};

export default BaseCard;
