import React from "react";
import { ComponentStyle, getClassByStyle, PartialComponentStyle, StyleMaps } from "../../style/style";
import { ColorKey, ColorPropertyKey } from "../../style/colorStyle";
import { AllSizeProperties, SizeKey, SizeStyle } from "../../style/size";
import { RoundKey } from "../../style/rounded";
import { FontWeightKey } from "../../style/fontWeight";
import clsx from "clsx";
import { inputColorMap } from "../../styleMap/colorMap";
import { textSizeMap } from "../../styleMap/sizeMap";

type BaseCheckboxInputStyle = {
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
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: Partial<BaseCheckboxInputStyle>
}

const BaseCheckboxInput: React.FC<Props> = ({
  checked,
  onChange,
  disabled = false,
  label,
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
    <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={clsx(
        getClassByStyle(maps, defaultStyle, partialStyle),
        "form-checkbox ease-in-out" // 追加したければカスタム
      )}
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default BaseCheckboxInput;
