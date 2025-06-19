import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { FaEdit } from "react-icons/fa";
import { ColorKey, ColorPropertyKey } from "../../../../style/colorStyle";

interface Props {
  onEdit: () => void;
}

const EditButton: React.FC<Props> = ({ onEdit }) => {
  return (
    <BaseButton
      icon={<FaEdit/>}
      label="編集"
      title="編集"
      onClick={onEdit}
      style={{
        color: {
          colorKey: ColorKey.Primary,
          properties: [ColorPropertyKey.Label]
        }
      }}
    />
  );
};

export default EditButton;
