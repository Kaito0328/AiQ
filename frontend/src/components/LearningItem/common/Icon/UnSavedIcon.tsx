import React from "react";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { SizeKey } from "../../../../style/size";
import { ColorKey } from "../../../../style/colorStyle";

const UnsavedIcon: React.FC = () => {
  return (
    <BaseLabel
      icon={<div className="w-full round-full"/>}
      style={{
        size: {
          sizeKey: SizeKey.SM
        },
        color: {
          colorKey: ColorKey.Danger
        }
      }}
    />
  );
};

export default UnsavedIcon;
