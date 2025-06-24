import React from "react";
import { SizeKey } from "../../../style/size";
import { RoundKey } from "../../../style/rounded";
import { ColorKey } from "../../../style/colorStyle";
import BaseButton from "../../common/button/BaseButton";
import { IoArrowRedo } from "react-icons/io5";

type Props = {
  title: string;
  navigatePage: () => void;
  colorKey: ColorKey;
};

const NavigatePageButton: React.FC<Props> = ({ title, navigatePage, colorKey }) => {
  return (
    <BaseButton
    icon={<IoArrowRedo/>}
    title={title}
    onClick={navigatePage}
      style={{
        color: {
          colorKey: colorKey,
        },
        size: { sizeKey: SizeKey.MD },
        roundKey: RoundKey.Full
      }}
    />
  );
};

export default NavigatePageButton;
