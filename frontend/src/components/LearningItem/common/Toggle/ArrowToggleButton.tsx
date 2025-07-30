import React from "react";
import ToggleButton from "../../../common/Toggle/ToggleButton";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { CoreColorKey } from "../../../../style/colorStyle";
import { SizeKey } from "../../../../style/size";

interface Props {
  isVisible: boolean;
  onToggle: () => void;
  label?: string;
}

const ArrowToggleButton: React.FC<Props> = ({
  isVisible,
  onToggle,
  label,
}) => {
  return (
    <ToggleButton
        isVisible={isVisible}
        onToggle={onToggle}
        label={label}
        iconVisible={<FaChevronRight/>}
        iconHidden={<FaChevronDown/>}
        style={{
          colorKey: CoreColorKey.Base,
          sizeKey: SizeKey.SM
        }}
    />
  );
};

export default ArrowToggleButton;
