// components/OpenToggleButton.tsx
import React from "react";
import { SizeKey } from "../../../../../style/size";
import BaseButton from "../../../../common/button/BaseButton";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { ColorKey } from "../../../../../style/colorStyle";

interface Props {
  open: boolean;
  onToggle: () => void;
}

const OpenButton: React.FC<Props> = ({ open, onToggle }) => {
  return (
    <BaseButton  
      onClick={onToggle}
      title={open ? "公開中（クリックで非公開）" : "非公開（クリックで公開）"}
      icon={open ? <FaLockOpen/> : <FaLock/>}
      label={open ? "公開" : "非公開"}
      style={{
        size: {
          sizeKey: SizeKey.MD,
        },
        color: {
          colorKey: open ? ColorKey.Success : ColorKey.Secondary
        }
      }}
    />
  );
};

export default OpenButton;
