import React from "react";
import BaseCard from "../containerComponents/BaseCard";
import BaseLabel from "../baseComponents/BaseLabel";
import { CoreColorKey } from "../../style/colorStyle";
import { RoundKey } from "../../style/rounded";
import { SizeKey } from "../../style/size";
import { ShadowKey } from "../../style/shadow";
import { FontWeightKey } from "../../style/fontWeight";

type Props = {
  username?: string;
};

const WelcomeBanner: React.FC<Props> = ({ username }) => {
  const welcomeMessage = username ? `${username} さん、ようこそ！` : "ゲストさん、ようこそ！";

  return (
    <div className="relative w-full z-50">
      <BaseCard
        style={{
          color: {
            colorKey: CoreColorKey.Base,
          },
          size: {
            sizeKey: SizeKey.SM,
            full_width: true,
          },
          roundKey: RoundKey.Sm,
          shadow: {
            shadowKey: ShadowKey.SM,
          },
        }}
      >
        
        {/* コンテンツ */}
        <div className="relative z-10">
          <div>
            <BaseLabel
              label={welcomeMessage}
              style={{
                color: {
                  colorKey: CoreColorKey.Primary,
                },
                size: {
                  sizeKey: SizeKey.MD,
                },
                fontWeightKey: FontWeightKey.Semibold,
              }}
            />
          </div>
        </div>
      </BaseCard>
    </div>
  );
};

export default WelcomeBanner;
