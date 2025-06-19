import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { UsersSortOption } from "../../../types/user";
import { SizeKey } from "../../../style/size";
import { ColorKey } from "../../../style/colorStyle";
import { FontWeightKey } from "../../../style/fontWeight";


interface Props {
  sortOption: UsersSortOption;
  onClick: () => void;
  isSelected?: boolean;
}

const UserSortButton: React.FC<Props> = ({ sortOption, onClick, isSelected }) => {
  return (
    <BaseButton
        onClick={() => onClick()}
        label={sortOption.label}
        style={{
          color: {
            colorKey: isSelected ? ColorKey.Primary : ColorKey.Secondary
          },
          size: {
            sizeKey: SizeKey.SM
          },
          fontWeightKey: isSelected ? FontWeightKey.Semibold : FontWeightKey.Normal
        }}
    />
  );
};

export default UserSortButton;
