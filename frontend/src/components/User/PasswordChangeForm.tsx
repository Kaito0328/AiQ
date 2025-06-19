import React, { useState } from "react";
import BaseButton from "../common/button/BaseButton";

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
    <div className="mt-8 w-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">パスワード変更</h2>
      
      {editMode ? (
        <>
          <input
            type="password"
            placeholder="現在のパスワード"
            className="border rounded-lg p-2 w-full mb-2"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="新しいパスワード"
            className="border rounded-lg p-2 w-full mb-4"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg w-full mb-2"
            onClick={handleSubmit}
          >
            パスワード変更
          </button>
          <BaseButton
            onClick={() => setEditMode(false)}
            label="キャンセル"

          />
        </>
      ) : (
        <BaseButton
            onClick={() => setEditMode(true)}
            label="パスワードを変更する"
        />
      )}
    </div>
  );
};

export default PasswordChangeForm;
