import React from "react";
import { SizeKey, SizeProperty } from "../../../style/size";
import BaseButton from "../button/BaseButton";
import { CoreColorKey, ColorPropertyKey } from "../../../style/colorStyle";
import { FontWeightKey } from "../../../style/fontWeight";

type ToggleButtonStyle = {
  colorKey: CoreColorKey;
  sizeKey: SizeKey;
  fontWeightKey: FontWeightKey,
};

const defaultStyle: ToggleButtonStyle = {
  colorKey: CoreColorKey.Primary,
  sizeKey: SizeKey.MD,
  fontWeightKey: FontWeightKey.Normal
};

interface Props {
  isVisible: boolean;
  onToggle: () => void;
  label?: string;
  visibleLabel?: string,
  iconVisible: React.ReactNode;
  iconHidden: React.ReactNode;
  iconRight?: boolean
  style?: Partial<ToggleButtonStyle>;
  bg_color?: boolean;
}

const ToggleButton: React.FC<Props> = ({
  isVisible,
  onToggle,
  label,
  visibleLabel,
  iconVisible,
  iconHidden,
  style,
  bg_color,
}) => {
  const mergedStyle = {...defaultStyle, ...style};
  const labelText = label ? ((visibleLabel ?? label) + (isVisible? "を非表示" : "を表示")): undefined;
  return (
    <BaseButton
      onClick={onToggle}
      label={labelText}
      icon={isVisible ? iconHidden: iconVisible}
      style={{
        size: {
          sizeKey: mergedStyle.sizeKey,
          full_width: false,
          properties: [SizeProperty.Text]
        },
        color: {
          colorKey: mergedStyle.colorKey,
          properties: [ColorPropertyKey.Label]
        },
        fontWeightKey: mergedStyle.fontWeightKey
      }}
      bg_color={bg_color}
    />
  );
};

export default ToggleButton;
