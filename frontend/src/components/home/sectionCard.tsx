import React, { ReactNode } from "react";
import { SizeKey } from "../../style/size";
import BaseCard from "../containerComponents/BaseCard";
import BaseLabel from "../baseComponents/BaseLabel";
import { FontWeightKey } from "../../style/fontWeight";
import { ColorKey, ColorPropertyKey } from "../../style/colorStyle";



type Props = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

const SectionCard: React.FC<Props> = ({
  icon,
  label,
  onClick,
}) => {
  return (
    <BaseCard
      onClick={onClick}
      style = {{
        color: {
          colorKey: ColorKey.Primary
        }
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
          <BaseLabel
            icon={icon}
            style={{
              size: {
                sizeKey: SizeKey.XL,
              },
              color: {
                colorKey: ColorKey.Primary,
                properties: [ColorPropertyKey.Label]
              }
            }}
            bg_color={true}
          />
        <BaseLabel
          label={label}
          style={{
            size: {
              sizeKey: SizeKey.LG,
            },
            color: {
              colorKey: ColorKey.Primary,
              properties: [ColorPropertyKey.Label]
            },
            fontWeightKey: FontWeightKey.Semibold
          }}
          bg_color={true}
        />
      </div>

    </BaseCard>

  );
};

export default SectionCard;
