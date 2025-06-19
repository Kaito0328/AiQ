import React from "react";
import { FaBook } from "react-icons/fa";
import { RoundKey } from "../../../../../style/rounded";
import { SizeKey } from "../../../../../style/size";
import BaseLabel from "../../../../baseComponents/BaseLabel";
import { ColorKey } from "../../../../../style/colorStyle";

const CollectionSetIcon: React.FC = () => {
  return (
    <BaseLabel
      icon={<FaBook/>}
      style={{
        color: {
          colorKey: ColorKey.Primary,
        },
        size: {
          sizeKey: SizeKey.MD
        },
        roundKey: RoundKey.Full
      }}

    />
  );
};

export default CollectionSetIcon;