import React from "react";
import EyeToggleButton from "../Toggle/EyeToggleButton";

interface Props {
  isVisible: boolean;
  onToggle: () => void;
}

const AllDescriptionToggleButton: React.FC<Props> = ({ isVisible, onToggle }) => {
  return (
    <EyeToggleButton
      isVisible={isVisible}
      onToggle={onToggle}
      label="すべての詳細"
    />
  );
};

export default AllDescriptionToggleButton;
