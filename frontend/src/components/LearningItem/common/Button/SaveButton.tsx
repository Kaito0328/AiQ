import React from "react";
import { FaSave } from "react-icons/fa";
import BaseButton from "../../../common/button/BaseButton";
import { CoreColorKey } from "../../../../style/colorStyle";

interface Props {
  onSave: () => void;
  disabled:  boolean;
}

const SaveButton: React.FC<Props> = ({ onSave, disabled}) => {
  return (
    <BaseButton
      icon={<FaSave/>}
      label="保存"
      title="保存"
      onClick={onSave}
      disabled={disabled}
      style={{
        color: {
          colorKey: disabled ? CoreColorKey.Secondary : CoreColorKey.Primary
        }
      }}
    />
  );
};

export default SaveButton;
