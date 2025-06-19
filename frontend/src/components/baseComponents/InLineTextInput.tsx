import React from "react";
import { AllSizeProperties, SizeKey, SizeStyle } from "../../style/size";
import { RoundKey } from "../../style/rounded";
import clsx from "clsx";
import { ColorKey, ColorPropertyKey, ColorVariantKey } from "../../style/colorStyle";
import { ComponentStyle, getClassByStyle, PartialComponentStyle, StyleMaps } from "../../style/style";
import { FontWeightKey } from "../../style/fontWeight";
import { textSizeMap } from "../../styleMap/sizeMap";
import { inputColorMap } from "../../styleMap/colorMap";

type InLineInputStyle = {
  colorKey?: ColorKey;
  size?: Partial<SizeStyle>;
  roundKey?: RoundKey;
}

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: ColorKey.Base,
    properties: [ColorPropertyKey.Bg, ColorPropertyKey.Label, ColorPropertyKey.Ring, ColorPropertyKey.Border],
    variants: [ColorVariantKey.Focus]
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: AllSizeProperties,
    full_width: true,
  },
  roundKey: RoundKey.Lg,
  fontWeightKey: FontWeightKey.Normal,
};

interface Props {
  defaultValue?: string;
  value?: string;
    placeholder?: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  style?: InLineInputStyle;
}

const InLineTextInput: React.FC<Props> = ({
  defaultValue,
  value,
  onChange,
  onKeyDown,
  inputRef,
  placeholder = "",
  style,
}) => {

    const PartialStyle: PartialComponentStyle = {
      size: style?.size,
      color: {
        colorKey: style?.colorKey
      },
      roundKey: style?.roundKey,
    }
  
    const maps: Partial<StyleMaps> = {
      colorMap: inputColorMap,
      sizeMap: textSizeMap,
    };
  
  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={defaultValue}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={clsx(
        getClassByStyle(maps, defaultStyle, PartialStyle)
      )}
    />
  );
};

export default InLineTextInput;
