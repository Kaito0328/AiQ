import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { CoreColorKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";
import { FontWeightKey } from "../../../style/fontWeight";

interface Props {
    fixSelect: () => void;
}
const FixSelectButton: React.FC<Props> = ({ fixSelect }) => {
    return (
        <BaseButton
            onClick={fixSelect}
            label={"決定"}
            style={{
                color: {
                    colorKey: CoreColorKey.Primary
                },
                size: {
                    sizeKey: SizeKey.LG,
                    full_width: false
                },
                fontWeightKey: FontWeightKey.Semibold
            }}
            bg_color={true}
        />
    );
};

export default FixSelectButton;