import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { FaCheck } from "react-icons/fa";
import { ColorKey, ColorPropertyKey } from "../../../../style/colorStyle";

interface Props {
  onComplete: () => void;
  disabled?: boolean;
}

const EditCompleteButton: React.FC<Props> = ({ onComplete, disabled }) => {
  return (
    <BaseButton
      icon={<FaCheck/>}
      label="完了"
      title="完了"
      onClick={onComplete}
      disabled={disabled}
      style={{
        color: {
          colorKey: ColorKey.Primary,
          properties: [ColorPropertyKey.Label]
        }
      }}
      
    />
  );
};

export default EditCompleteButton;