import React from "react";
import { FaBook } from "react-icons/fa";
import { RoundKey } from "../../../../../style/rounded";
import { SizeKey } from "../../../../../style/size";
import BaseLabel from "../../../../baseComponents/BaseLabel";
import { CoreColorKey } from "../../../../../style/colorStyle";

const CollectionSetIcon: React.FC = () => {
  return (
    <BaseLabel
      icon={<FaBook/>}
      style={{
        color: {
          colorKey: CoreColorKey.Primary,
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