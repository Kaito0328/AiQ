import React, { useState } from "react";
import { User } from "../../types/user";
import LoadingButton from "../common/button/LoadingButton";
import { CoreColorKey } from "../../style/colorStyle";

const UserInfoCard: React.FC<{
  loginUser: User | null;
    onUpdateUser: (newUsername: string, onSuccess?: () => void) => void;
}> = ({ loginUser, onUpdateUser }) => {
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(loginUser?.username || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    setLoading(true);
    await onUpdateUser(username, () => setEditMode(false));
    setLoading(false);
  };

  return (
    <div className="space-y-4 w-full">
      {editMode ? (
        <>
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <label className="text-lg font-medium text-gray-700">ユーザー名</label>
            <input
              className="border rounded-lg p-2 w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <LoadingButton 
            label="保存"
            onClick={handleUpdateUser}
            loading={loading}
            style={{
              colorKey: CoreColorKey.Primary
            }}
            bg_color={true}
          />
        </>
      ) : (
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-md">
          <span className="text-lg font-medium text-gray-700">ユーザー名</span>
          <span className="text-lg text-gray-900">{loginUser?.username}</span>
        </div>
      )}
      <button
        className="bg-gray-500 text-white px-4 py-2 rounded-lg w-full"
        onClick={() => setEditMode(!editMode)}
      >
        {editMode ? "キャンセル" : "編集"}
      </button>
    </div>
  );
};

export default UserInfoCard;
