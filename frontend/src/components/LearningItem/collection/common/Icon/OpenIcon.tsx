import React from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { RoundKey } from "../../../../../style/rounded";
import { SizeKey } from "../../../../../style/size";
import BaseLabel from "../../../../baseComponents/BaseLabel";
import { ColorKey } from "../../../../../style/colorStyle";

interface Props {
  open: boolean;
}

const OpenIcon: React.FC<Props> = ({ open}) => {
  return (
    <BaseLabel
      icon={open? <FaLockOpen /> : <FaLock/>}
      style={{
        color: {
          colorKey: open? ColorKey.Success : ColorKey.Secondary,
        },
        size: {
          sizeKey: SizeKey.MD
        },
        roundKey: RoundKey.Full
      }}

    />
  );
};

export default OpenIcon;
