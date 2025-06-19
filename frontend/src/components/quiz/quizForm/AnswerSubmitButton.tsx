import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { ColorKey } from "../../../style/colorStyle";
import { FontWeightKey } from "../../../style/fontWeight";

const AnswerSubmitButton: React.FC = () => (
    <BaseButton
      label="解答する"
      style={{
        color: { colorKey: ColorKey.Success },
        fontWeightKey: FontWeightKey.Semibold
      }}
      is_submit={true}
      bg_color={true}
    />
);

export default AnswerSubmitButton;