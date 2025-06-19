import React from "react";
import { SizeKey } from "../../../style/size";
import { RoundKey } from "../../../style/rounded";
import { ColorKey } from "../../../style/colorStyle";
import BaseButton from "../../common/button/BaseButton";
import { IoArrowRedo } from "react-icons/io5";

type Props = {
  title: string;
  navigatePage: () => void;
};

const NavigatePageButton: React.FC<Props> = ({ title, navigatePage }) => {
  return (
    <BaseButton
    icon={<IoArrowRedo/>}
    title={title}
    onClick={navigatePage}
      style={{
        color: {
          colorKey: ColorKey.Primary,
        },
        size: { sizeKey: SizeKey.LG },
        roundKey: RoundKey.Full
      }}
    />
  );
};

export default NavigatePageButton;
