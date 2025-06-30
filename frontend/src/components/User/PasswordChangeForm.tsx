import React, { useState } from "react";
import BaseButton from "../common/button/BaseButton";
import LabelWithInput from "../common/input/labelWithInput";
import { CoreColorKey } from "../../style/colorStyle";
import { SizeKey, SizeProperty } from "../../style/size";
import BaseLabel from "../baseComponents/BaseLabel";
import { FontWeightKey } from "../../style/fontWeight";

const PasswordChangeForm: React.FC<{
  onChangePassword: (
    oldPassword: string,
    newPassword: string,
    onSuccess?: () => void
  ) => void;
}> = ({ onChangePassword }) => {
  const [editMode, setEditMode] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = () => {
    onChangePassword(oldPassword, newPassword, () => {
      setOldPassword("");
      setNewPassword("");
      setEditMode(false);
    });
  };

  return (
    <div className="w-full">

      {editMode ? (
        <div>
            <BaseLabel
              label="パスワード変更"
              style={{
                size: {
                  sizeKey: SizeKey.LG,
                  properties: [SizeProperty.Text]
                },
                fontWeightKey: FontWeightKey.Bold
              }}
            />
          <LabelWithInput
              placeholder={"現在のパスワード"}
              value={oldPassword}
              onChange={(value) => setOldPassword(value)}
              label={"現在のパスワード"}
          />

          <LabelWithInput
              placeholder={"新しいパスワード"}
              value={newPassword}
              onChange={setNewPassword}
              label={"新しいパスワード"}
          />

          <div className="flex items-center justify-center">
            <div className="min-w-[30%]">
              <BaseButton
                onClick={handleSubmit}
                label={"パスワードを変更"}
                style={{
                  color: {
                    colorKey: CoreColorKey.Success
                  },
                  size: {
                    full_width: true
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="min-w-[30%]">
              <BaseButton
                onClick={() => setEditMode(false)}
                label="キャンセル"
                style={{
                  color: {
                    colorKey: CoreColorKey.Secondary,
                  },
                  size: {
                    sizeKey: SizeKey.SM,
                    full_width: true
                  }
                }}
              />
            </div>
          </div>


          
          
        </div>
      ) : (
          <div className="flex items-center justify-center">
            <div className="min-w-[30%]">
              <BaseButton
                  onClick={() => setEditMode(true)}
                  label="パスワードを変更する"
                  style={{
                    size: {
                      full_width: true
                    }
                  }}
              />
            </div>
          </div>
      )}
    </div>
  );
};

export default PasswordChangeForm;
