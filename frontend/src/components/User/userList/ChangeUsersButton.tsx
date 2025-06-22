import React from "react";
import { UsersFilterOption } from "../../../types/user";
import BaseButton from "../../common/button/BaseButton";
import { SizeKey } from "../../../style/size";
import { CoreColorKey, ColorPropertyKey, ColorVariantKey } from "../../../style/colorStyle";
import { FontWeightKey } from "../../../style/fontWeight";

interface UserListItemProps {
  option: UsersFilterOption;
  onClick: () => void;
  isSelected?: boolean;
}

const ChangeUsersButton: React.FC<UserListItemProps> = ({ option, onClick, isSelected}) => {
  return (
    <li>
      <BaseButton
        onClick={() => onClick()}
        label={option.label}
        style={{
          size: {
            sizeKey: SizeKey.MD
          },
          color: {
            colorKey: isSelected ? CoreColorKey.Primary: CoreColorKey.Secondary,
            properties: [ColorPropertyKey.Label, ColorPropertyKey.Bg],
            variants: [ColorVariantKey.Hover]
          },
          fontWeightKey: FontWeightKey.Semibold
        }}
      />
    </li>
  );
};

export default ChangeUsersButton;
