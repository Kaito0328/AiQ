import React from "react";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { CoreColorKey } from "../../../../style/colorStyle";
import { SizeKey } from "../../../../style/size";

type Props = {
  hint: string;
};

const HintDisplay: React.FC<Props> = ({ hint }) => {
  return (
    <div className="min-h-[3]">
        <BaseLabel
          label={hint}
          style={{
            color: {colorKey: CoreColorKey.Primary},
            size: { sizeKey: SizeKey.MD}
          }}
        />
    </div>

  );
};

export default HintDisplay;
