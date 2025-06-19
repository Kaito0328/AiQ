import React from "react";
import ArrowToggleButton from "../Toggle/ArrowToggleButton";

interface Props {
  isVisible: boolean;
  onToggle: () => void;
}

const DescriptionToggleButton: React.FC<Props> = ({ isVisible, onToggle }) => {
  return (
    <ArrowToggleButton
      isVisible={isVisible}
      onToggle={onToggle}
      label="詳細"
    />
  );
};

export default DescriptionToggleButton;
