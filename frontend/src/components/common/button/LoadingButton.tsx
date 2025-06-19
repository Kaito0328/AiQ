import React from "react";
import { SizeKey } from "../../../style/size";
import { RoundKey } from "../../../style/rounded";
import { ColorKey, ColorPropertyKey, ColorVariantKey } from "../../../style/colorStyle";
import BaseButton from "./BaseButton";
import { PartialComponentStyle } from "../../../style/style";

type LoadingButtonStyle = {
  colorKey: ColorKey;
  size: {
    sizeKey: SizeKey;
    full_width: boolean; 
  },
  roundKey: RoundKey;
};

const defaultStyle: LoadingButtonStyle = {
  colorKey: ColorKey.Primary,
  size: {
    sizeKey: SizeKey.MD,
    full_width: false,
  },
  roundKey: RoundKey.Md
}

type Props = {
  onClick: () => void;
  label: string;
  title?: string;
  icon?: React.ReactNode;
  loading: boolean;
  loadingText?: string;
  style?: Partial<LoadingButtonStyle>;
  bg_color: boolean;
};

const LoadingButton: React.FC<Props> = ({
  onClick,
  label,
  title,
  icon,
  loading,
  loadingText,
  style,
  bg_color = true
}) => {
  const mergedStyle = {...defaultStyle, ...style};
  const colorVariants = [ColorVariantKey.Hover];
  if (loading) colorVariants.push(ColorVariantKey.Loading);
  const colorProperties = [ColorPropertyKey.Bg, ColorPropertyKey.Label];

  const classStyle: PartialComponentStyle = {
    color: {
      colorKey: mergedStyle.colorKey,
      properties: colorProperties,
      variants: colorVariants,
    },
    size: mergedStyle.size,
    roundKey: mergedStyle.roundKey,
  }


  return (
    <BaseButton
      onClick={onClick}
      label={loading ? loadingText ?? `${label}中...` : label}
      title={title}
      icon={icon}
      style={classStyle}
      disabled={loading}
      bg_color={bg_color}
    />
  );
};

export default LoadingButton;
