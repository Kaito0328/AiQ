import React from "react";
import BaseButton from "../../../common/button/BaseButton";
import { CoreColorKey } from "../../../../style/colorStyle";
import { FontWeightKey } from "../../../../style/fontWeight";

type Props = {
  onHint: () => void;
};

const HintButton: React.FC<Props> = ({ onHint }) => (
  <div className="flex flex-wrap justify-center gap-4">
    <BaseButton
      label="ヒントを見る"
      onClick={onHint}
      style={{
        color: { colorKey: CoreColorKey.Primary },
        fontWeightKey: FontWeightKey.Semibold,
      }}
      bg_color={true}
    />
  </div>
);

export default HintButton;