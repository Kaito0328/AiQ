import React from "react";
import BaseButton from "../common/button/BaseButton";
const DeleteAccountButton: React.FC<{ handleDeleteAccount: () => void }> = ({ handleDeleteAccount }) => {
  return (
    // <button className="bg-red-500 text-white px-4 py-2 rounded-lg w-full mt-8" onClick={handleDeleteAccount}>
    //   アカウント削除
    // </button>
    <BaseButton
        onClick={handleDeleteAccount}
        label="アカウント削除"
    />
  );
};

export default DeleteAccountButton;
