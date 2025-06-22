import React from "react";
import ToggleButton from "../../../common/Toggle/ToggleButton";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CoreColorKey } from "../../../../style/colorStyle";

interface Props {
  isVisible: boolean;
  onToggle: () => void;
  label?: string;
}

const EyeToggleButton: React.FC<Props> = ({
  isVisible,
  onToggle,
  label,
}) => {
  return (
    <ToggleButton
        isVisible={isVisible}
        onToggle={onToggle}
        label={label}
        iconVisible={<FaEye/>}
        iconHidden={<FaEyeSlash/>}
        style={{
          colorKey: CoreColorKey.Success
        }}
    />
  );
};

export default EyeToggleButton;
