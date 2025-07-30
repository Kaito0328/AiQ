import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { CoreColorKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";
import { FontWeightKey } from "../../../style/fontWeight";

interface Props {
    fixSelect: () => void;
    disabled: boolean;
}
const FixSelectButton: React.FC<Props> = ({ fixSelect, disabled }) => {
    return (
        <BaseButton
            onClick={fixSelect}
            label={"決定"}
            style={{
                color: {
                    colorKey: disabled ?  CoreColorKey.Secondary : CoreColorKey.Primary
                },
                size: {
                    sizeKey: SizeKey.LG,
                    full_width: true
                },
                fontWeightKey: FontWeightKey.Semibold
            }}
            disabled={disabled}
            bg_color={true}
        />
    );
};

export default FixSelectButton;