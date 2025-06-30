import React from "react";
import BaseButton from "../common/button/BaseButton";
import { CoreColorKey } from "../../style/colorStyle";

const LogoutButton: React.FC<{ handleLogout: () => void }> = ({ handleLogout }) => {
  return (
    <BaseButton
      onClick={handleLogout}
      label="ログアウト"
      style={{
        color: {
          colorKey: CoreColorKey.Danger,
        },
        size: {
          full_width:  true
        }
      }}
    />
  );
};

export default LogoutButton;
