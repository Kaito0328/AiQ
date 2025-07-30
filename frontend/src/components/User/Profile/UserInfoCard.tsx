import React, { useState } from "react";
import { User } from "../../../types/user";
import { ColorPropertyKey } from "../../../style/colorStyle";
import BaseLabel from "../../baseComponents/BaseLabel";
import EditButton from "../../LearningItem/common/Button/EditButton";
import InLineTextInput from "../../baseComponents/InLineTextInput";
import SaveButton from "../../LearningItem/common/Button/SaveButton";
import CancelButton from "../../LearningItem/common/Button/CancelButton";
import { FontWeightKey } from "../../../style/fontWeight";
const UserInfoCard: React.FC<{
  loginUser?: User;
    onUpdateUser: (newUsername: string) => void;
    loading: boolean;
}> = ({ loginUser, onUpdateUser, loading }) => {
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(loginUser?.username || "");
  const handleUpdateUser = async () => {
    await onUpdateUser(username.trim());
    setEditMode(false);
  };

  return (
    <div className="space-y-4 w-full">
      {editMode ? (
        <>
          <InLineTextInput
            value={username}
            onChange={(value) => setUsername(value)}
          />

          <SaveButton
            onSave={handleUpdateUser}
            disabled={!username.trim() || username === loginUser?.username || loading}
          />

          <CancelButton
            onCancel={() => setEditMode(false)}
          />
        </>
      ) : (
        <div className="w-full flex flex-wrap justify-between ">
          <BaseLabel
            style={{
              color: {
                properties: [ColorPropertyKey.Label],
              },
              fontWeightKey: FontWeightKey.Bold,
            }}
            label={loginUser?.username || "ユーザー名"}
          />
          <EditButton
            onEdit={() => setEditMode(true)}
          />
        </div>
      )}
    </div>
  );
};

export default UserInfoCard;
