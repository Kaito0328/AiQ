import React from "react";
import Button from "../common/button/Button";
import { ThemeColor } from "../../style/color";

const DeleteAccountButton: React.FC<{ handleDeleteAccount: () => void }> = ({ handleDeleteAccount }) => {
  return (
    // <button className="bg-red-500 text-white px-4 py-2 rounded-lg w-full mt-8" onClick={handleDeleteAccount}>
    //   アカウント削除
    // </button>
    <Button
        onClick={handleDeleteAccount}
        label="アカウント削除"
        color={ThemeColor.Red}
    />
  );
};

export default DeleteAccountButton;
