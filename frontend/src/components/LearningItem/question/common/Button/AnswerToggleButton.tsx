import React from "react";
import EyeToggleButton from "../../../common/Toggle/EyeToggleButton";

interface Props {
  isVisible: boolean;
  onToggle: () => void;
}

const AnswerToggleButton: React.FC<Props> = ({ isVisible, onToggle }) => {
  return (
    <EyeToggleButton
      isVisible={isVisible}
      onToggle={onToggle}
      label="解答"
    />
  );
};

export default AnswerToggleButton;
