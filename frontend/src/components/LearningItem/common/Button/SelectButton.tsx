import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { FaCheckSquare, FaTimes } from "react-icons/fa";
import { CoreColorKey } from "../../../../style/colorStyle";

interface Props {
  onSelect: () => void;
  isSelecting: boolean;

}

const SelectButton: React.FC<Props> = ({ onSelect, isSelecting}) => {
  return (
    <BaseButton
      icon={isSelecting ? <FaTimes/> : <FaCheckSquare/>}
      label={isSelecting ? "選択解除" : "選択"}
      title={isSelecting ? "選択解除" : "選択"}
      onClick={onSelect}
      style={{
        color: {
          colorKey: isSelecting ? CoreColorKey.Secondary : CoreColorKey.Primary
        }
      }}
    />
  );
};

export default SelectButton;
