import React from "react";
import { SizeKey } from "../../../../style/size";
import { useNavigate } from "react-router-dom";
import { FontWeightKey } from "../../../../style/fontWeight";
import { ColorKey, ColorPropertyKey } from "../../../../style/colorStyle";
import BaseButton from "../../../common/button/BaseButton";

const LinkedNameText: React.FC<{ name: string, url?: string }> = ({ name, url }) => {
    const navigate = useNavigate();
        const handleNavigate = () => {
        if (url) navigate(url);
    };
    return (
        <div className="min-w-[150px] max-w-[400px] hover:underline">
            <BaseButton
            onClick={handleNavigate}
            label={name}
            style={{
                size: {
                    sizeKey: SizeKey.LG
                },
                color: {
                    colorKey: ColorKey.Primary,
                    properties: [ColorPropertyKey.Label]
                },
                fontWeightKey: FontWeightKey.Bold
            }}
            />
        </div>
    );
};

export default LinkedNameText;