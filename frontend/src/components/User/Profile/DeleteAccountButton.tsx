import React from "react";
import BaseButton from "../../common/button/BaseButton";
import { ColorPropertyKey, CoreColorKey } from "../../../style/colorStyle";
const DeleteAccountButton: React.FC<{ handleDeleteAccount: () => void, widthPercent?: number }> = ({ handleDeleteAccount, widthPercent }) => {
  return (
    <BaseButton
        onClick={handleDeleteAccount}
        label="アカウント削除"
        style={{
          color: {
            colorKey: CoreColorKey.Danger,
            properties: [ColorPropertyKey.Label],
          },
          size: {
            full_width: true,
            widthPercent: widthPercent
          }
        }}
    />
  );
};

export default DeleteAccountButton;
