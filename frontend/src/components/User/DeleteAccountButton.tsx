import React from "react";
import BaseButton from "../common/button/BaseButton";
import { CoreColorKey } from "../../style/colorStyle";
const DeleteAccountButton: React.FC<{ handleDeleteAccount: () => void }> = ({ handleDeleteAccount }) => {
  return (
    <BaseButton
        onClick={handleDeleteAccount}
        label="アカウント削除"
        style={{
          color: {
            colorKey: CoreColorKey.Danger
          },
          size: {
            full_width: true
          }
        }}
    />
  );
};

export default DeleteAccountButton;
