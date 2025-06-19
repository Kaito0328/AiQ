import React from "react";
import BaseButton from "../common/button/BaseButton";

const LogoutButton: React.FC<{ handleLogout: () => void }> = ({ handleLogout }) => {
  return (
    <BaseButton
      onClick={handleLogout}
      label="ログアウト"
    />
  );
};

export default LogoutButton;
