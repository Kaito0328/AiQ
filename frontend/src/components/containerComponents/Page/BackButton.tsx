import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BaseButton from "../../common/button/BaseButton";
import { SizeKey } from "../../../style/size";
import { RoundKey } from "../../../style/rounded";
import { CoreColorKey, ColorPropertyKey } from "../../../style/colorStyle";

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-20 left-3 z-20 transition">
        <BaseButton
            onClick={() => navigate(-1)}
            title="戻る"
            icon={<FaArrowLeft/>}
            style={{
                size: {
                    sizeKey: SizeKey.MD,
                },
                color: {
                    colorKey: CoreColorKey.Primary,
                    properties: [ColorPropertyKey.Bg, ColorPropertyKey.Label]
                },
                roundKey: RoundKey.Full,
            }}
            bg_color={true}
        />
    </div>

  );
};

export default BackButton;
