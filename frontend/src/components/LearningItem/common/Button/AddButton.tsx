import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { FaPlus } from "react-icons/fa";
import { ColorKey } from "../../../../style/colorStyle";

interface Props {
  onAdd: () => void;
}

const AddButton: React.FC<Props> = ({ onAdd}) => {
  return (
    <BaseButton
      icon={<FaPlus/>}
      label="追加"
      title="追加"
      onClick={onAdd}
      style={{
        color: {
          colorKey: ColorKey.Primary,
        }
      }}
      bg_color={false}
    />
  );
};

export default AddButton;
