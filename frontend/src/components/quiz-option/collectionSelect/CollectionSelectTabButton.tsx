import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { CoreColorKey, ColorPropertyKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";
import { FontWeightKey } from "../../../style/fontWeight";

type Props = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const CollectionSelectTabButton: React.FC<Props> = ({ label, isActive, onClick }) => {
  return (
    <BaseButton
      label={label}
      onClick={onClick}
      style={{
        color: {
          colorKey: isActive ? CoreColorKey.Primary : CoreColorKey.Secondary,
          properties: [ColorPropertyKey.Bg, ColorPropertyKey.Label]
        },
        size: {
          sizeKey: SizeKey.LG
        },
        fontWeightKey: isActive ? FontWeightKey.Bold : FontWeightKey.Normal
      }}
      bg_color={isActive}
    />
  );
};

export default CollectionSelectTabButton;
