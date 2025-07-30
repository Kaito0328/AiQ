import React from "react";
import { CoreColorKey } from "../../../style/colorStyle";
import BaseButton from "../../common/button/BaseButton";
import { FontWeightKey } from "../../../style/fontWeight";

interface ButtonProps {
    onClick: () => void;
    loading: boolean;
    disabled?: boolean;
}

const ResumeButton: React.FC<ButtonProps> = ({onClick, loading, disabled}) => (
    <BaseButton
      label= {loading ? "ロード中..." : "再開"}
      style={{
        color: {
          colorKey: loading ? CoreColorKey.Secondary : CoreColorKey.Primary
        },
        fontWeightKey: FontWeightKey.Semibold
      }}
      disabled={loading || disabled}
      bg_color={true}
      onClick={onClick}
    />
);
export default ResumeButton;