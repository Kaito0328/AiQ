import React from "react";
import { FaFolder } from "react-icons/fa";
import { RoundKey } from "../../../../../style/rounded";
import { SizeKey } from "../../../../../style/size";
import BaseLabel from "../../../../baseComponents/BaseLabel";
import { CoreColorKey } from "../../../../../style/colorStyle";

const CollectionIcon: React.FC = () => {
  return (
    <BaseLabel
      icon={<FaFolder/>}
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

export default CollectionIcon;