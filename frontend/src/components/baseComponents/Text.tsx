import React from "react";
import clsx from "clsx";
import { AllSizeProperties, SizeKey } from "../../style/size";
import {  CoreColorKey, ColorPropertyKey } from "../../style/colorStyle";
import { RoundKey } from "../../style/rounded";
import { FontWeightKey} from "../../style/fontWeight";
import { ComponentStyle, getClassByStyle, StyleMaps } from "../../style/style";
import { textColorMap } from "../../styleMap/colorMap";
import { textSizeMap } from "../../styleMap/sizeMap";

type TextStyle = {
  color: {
    colorKey: CoreColorKey;
    colorProperties?: ColorPropertyKey[];
  }
  sizeKey: SizeKey;
  roundKey: RoundKey;
  fontWeightKey: FontWeightKey;
}

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: CoreColorKey.Base,
    properties: [ColorPropertyKey.Bg, ColorPropertyKey.Label],
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: AllSizeProperties,
    full_width: false,
  },
  roundKey: RoundKey.Lg,
  fontWeightKey: FontWeightKey.Normal,
};

interface Props {
  emptyText?: string;
  text?: string;
  style?: Partial<TextStyle>;
}

const Text: React.FC<Props> = ({
  emptyText,
  text,
  style,
}) => {
  text = text ?? emptyText;

  const maps: Partial<StyleMaps> = {
    colorMap: textColorMap,
    sizeMap: textSizeMap,
  };

  const classText = getClassByStyle(maps, defaultStyle, style);

  return (
    <div className={clsx("inline-flex items-center", classText)}>
      {text && (
        <span className="whitespace-pre-wrap">{text}</span>
      )}
    </div>
  );
};

export default Text;
