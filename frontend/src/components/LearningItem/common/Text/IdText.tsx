import React from "react";
import { SizeKey } from "../../../../style/size";
import Text from "../../../baseComponents/Text";
import { CoreColorKey } from "../../../../style/colorStyle";

const IdLabel: React.FC<{ id: number }> = ({ id }) => (
  <div className="text-right">
      <Text
        text={"ID: " + id}
        style={{
          sizeKey: SizeKey.SM,
          color: {
            colorKey: CoreColorKey.Secondary
          },
        }}
    />
  </div>

);

export default IdLabel;
