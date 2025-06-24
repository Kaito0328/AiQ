import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { CoreColorKey, ColorPropertyKey, ColorKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";
import { FontWeightKey } from "../../../style/fontWeight";

type Props = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  activeColorKey : ColorKey;
};

const CollectionSelectTabButton: React.FC<Props> = ({ label, isActive, onClick, activeColorKey }) => {
  return (
    <BaseButton
      label={label}
      onClick={onClick}
      style={{
        color: {
          colorKey: isActive ? activeColorKey : CoreColorKey.Secondary,
          properties: [ ColorPropertyKey.Label]
        },
        size: {
          sizeKey: SizeKey.LG
        },
        fontWeightKey: FontWeightKey.Bold
      }}
    />
  );
};

export default CollectionSelectTabButton;
