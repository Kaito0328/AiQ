import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { FaTrash } from "react-icons/fa";
import { ColorKey, ColorPropertyKey } from "../../../../style/colorStyle";

interface Props {
  onDelete: () => void;
}

const DeleteButton: React.FC<Props> = ({ onDelete }) => {
  return (
    <BaseButton
      icon={<FaTrash/>}
      label="削除"
      title="削除"
      onClick={onDelete}
      style={{
        color: {
          colorKey: ColorKey.Danger,
          properties: [ColorPropertyKey.Label]
        }
      }}
    />
  );
};

export default DeleteButton;
