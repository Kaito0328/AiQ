import React from "react";
import clsx from "clsx";
import { SizeKey, SizeStyle, AllSizeProperties } from "../../style/size";
import { RoundKey } from "../../style/rounded";
import { FontWeightKey } from "../../style/fontWeight";
import { ColorKey, ColorPropertyKey } from "../../style/colorStyle";
import { ComponentStyle, getClassByStyle, PartialComponentStyle, StyleMaps } from "../../style/style";
import { inputColorMap } from "../../styleMap/colorMap";
import { textSizeMap } from "../../styleMap/sizeMap";

type BaseRangeInputStyle = {
  colorKey?: ColorKey;
  size?: Partial<SizeStyle>;
  roundKey?: RoundKey;
};

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: ColorKey.Base,
    properties: [ColorPropertyKey.Bg, ColorPropertyKey.Ring, ColorPropertyKey.Border],
    variants: [],
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: AllSizeProperties,
    full_width: true,
  },
  roundKey: RoundKey.Full,
  fontWeightKey: FontWeightKey.Normal,
};

interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  style?: BaseRangeInputStyle;
}

const BaseRangeInput: React.FC<Props> = ({
  value,
  min = 1,
  max = 100,
  step = 1,
  onChange,
  style,
}) => {
  const partialStyle: PartialComponentStyle = {
    size: style?.size,
    color: {
      colorKey: style?.colorKey,
    },
    roundKey: style?.roundKey,
  };

  const maps: Partial<StyleMaps> = {
    colorMap: inputColorMap,
    sizeMap: textSizeMap,
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={clsx(
        getClassByStyle(maps, defaultStyle, partialStyle),
      )}
    />
  );
};

export default BaseRangeInput;
