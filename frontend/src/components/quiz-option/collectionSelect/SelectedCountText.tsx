import React from "react";
import Text from "../../baseComponents/Text";
import { CoreColorKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";
import { RoundKey } from "../../../style/rounded";
import { FontWeightKey } from "../../../style/fontWeight";

type Props = {
  count: number;
};

const SelectedCountText: React.FC<Props> = ({ count }) => {
  return (
    <Text
      text={`選択中: ${count}件`}
      style={{
        color: { colorKey: CoreColorKey.Base },
        sizeKey: SizeKey.LG,
        roundKey: RoundKey.Lg,
        fontWeightKey: FontWeightKey.Semibold,
      }}
    />
  );
};

export default SelectedCountText;
