import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { FaTrash } from "react-icons/fa";
import { CoreColorKey } from "../../../../style/colorStyle";

interface Props {
  onDelete: () => void;
  disabled: boolean;
}

const BatchDeleteButton: React.FC<Props> = ({ onDelete, disabled }) => {
  return (
    <BaseButton
      icon={<FaTrash/>}
      label="削除"
      title="削除"
      onClick={onDelete}
      disabled={disabled}
      style={{
        color: {
          colorKey: disabled? CoreColorKey.Secondary : CoreColorKey.Danger
        }
      }}
      bg_color={false}
    />
  );
};

export default BatchDeleteButton;
