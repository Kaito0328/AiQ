import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { ColorPropertyKey, CoreColorKey } from "../../../style/colorStyle";

const LogoutButton: React.FC<{ handleLogout: () => void, widthPercent?: number }> = ({ handleLogout, widthPercent }) => {
  return (
    <BaseButton
      onClick={handleLogout}
      label="ログアウト"
      style={{
        color: {
          colorKey: CoreColorKey.Danger,
          properties: [ColorPropertyKey.Label],
        },
        size: {
          full_width:  true,
          widthPercent: widthPercent
        }
      }}
    />
  );
};

export default LogoutButton;
