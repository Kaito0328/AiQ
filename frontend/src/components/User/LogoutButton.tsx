import React from "react";
import Button from "../common/button/Button";
import { ThemeColor } from "../../style/color";

const LogoutButton: React.FC<{ handleLogout: () => void }> = ({ handleLogout }) => {
  return (
    <Button
      onClick={handleLogout}
      label="ログアウト"
      color={ThemeColor.Gray}
      className="mt-4 w-full"
    />
  );
};

export default LogoutButton;
