import React, { useState } from "react";
import BaseButton from "../../common/button/BaseButton";
import LabelWithInput from "../../common/input/labelWithInput";
import { ColorPropertyKey, CoreColorKey } from "../../../style/colorStyle";

const PasswordChangeForm: React.FC<{
  onChangePassword: (
    oldPassword: string,
    newPassword: string,
  ) => void;
  loading?: boolean;
}> = ({ onChangePassword, loading }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = () => {
    onChangePassword(oldPassword, newPassword);

  };

  const isDisabled = loading || !oldPassword || !newPassword;

  return (
    <div className="w-full">
        <div className="space-y-5">
          <LabelWithInput
              placeholder={"現在のパスワード"}
              value={oldPassword}
              onChange={(value) => setOldPassword(value)}
              label={"現在のパスワード"}
              password={true}
          />

          <LabelWithInput
              placeholder={"新しいパスワード"}
              value={newPassword}
              onChange={setNewPassword}
              label={"新しいパスワード"}
              password={true}
          />

          <div className="flex items-center justify-center mt-10">
              <BaseButton
                onClick={handleSubmit}
                label={"パスワードを変更"}
                style={{
                  color: {
                    colorKey: isDisabled ? CoreColorKey.Secondary : CoreColorKey.Primary,
                    properties: [ColorPropertyKey.Label, ColorPropertyKey.Bg],
                  },
                  size: {
                    full_width: true,
                    widthPercent: 30,
                  }
                }}
                bg_color={true}
                disabled={isDisabled}
              />
          </div>


          
          
        </div>
    </div>
  );
};

export default PasswordChangeForm;
