// components/common/form/TextInput.tsx
import React from "react";
import clsx from "clsx";
import { ColorKey, ColorPropertyKey, ColorVariantKey } from "../../style/colorStyle";
import { AllSizeProperties, SizeKey, SizeStyle } from "../../style/size";
import { RoundKey } from "../../style/rounded"
import { ComponentStyle, getClassByStyle, PartialComponentStyle, StyleMaps } from "../../style/style";
import { FontWeightKey } from "../../style/fontWeight";
import { inputColorMap } from "../../styleMap/colorMap";
import { textSizeMap } from "../../styleMap/sizeMap";

type BlockInputStyle = {
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
  placeholder?: string;
  onChange: (value: string) => void;
  style?: BlockInputStyle;
}

const BlockTextInput: React.FC<Props> = ({
  defaultValue,
  onChange,
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
    colorMap:  inputColorMap,
    sizeMap: textSizeMap,
  };

  return (
    <textarea
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        getClassByStyle(maps, defaultStyle, PartialStyle)
      )}
    />
  );
};

export default BlockTextInput;
