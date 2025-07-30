import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { FaTimes } from "react-icons/fa";
import { CoreColorKey } from "../../../../style/colorStyle";

interface Props {
  onCancel: () => void;
}

const CancelButton: React.FC<Props> = ({ onCancel}) => {
  return (
    <BaseButton
      icon={<FaTimes/>}
      label="キャンセル"
      title="キャンセル"
      onClick={onCancel}
      style={{
        color: {
          colorKey: CoreColorKey.Secondary
        }
      }}
    />
  );
};

export default CancelButton;
