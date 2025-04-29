import React, { useState } from "react";
import { updateUser, changePassword, deleteUser } from "../../api/UserAPI"; // API関数をインポート
import { logout } from "../../api/AuthAPI";
import { useNavigate } from "react-router-dom"; 
import { useLoginUser } from "../../hooks/useLoginUser";
import { handleError } from "../../api/handleAPIError";

const UserProfile: React.FC = () => {
  const {loginUser, loading, errorMessage} = useLoginUser();
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(loginUser?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">{errorMessage}</p>
      </div>
    );
  }

  // ユーザー情報更新処理
  const handleUpdateUser = async () => {
    try {
      await updateUser({ username: username });
      setFeedback("ユーザー情報を更新しました！");
      setEditMode(false);
    } catch (error: unknown) {
      setFeedback(handleError(error));
    }
  };

  // パスワード変更処理
  const handleChangePassword = async () => {
    try {
      await changePassword(oldPassword, newPassword);
      setFeedback("パスワードを変更しました！");
      setOldPassword("");
      setNewPassword("");
    } catch (error: unknown) {
      setFeedback(handleError(error));
    }
  };

  // アカウント削除処理
  const handleDeleteAccount = async () => {
    if (confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) {
      try {
        await deleteUser();
        setFeedback("アカウントを削除しました");
        logout();
        navigate("/login");
        // ログアウト処理をここで追加
      } catch (error) {
        setFeedback(handleError(error));
      }
    }
  };

  const handleLogout = () => {
    try {
      logout();
      setFeedback("ログアウトしました！");
      navigate("/login"); // ✅ ログアウト後、ログインページへリダイレクト
    } catch (error) {
      setFeedback(handleError(error));
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg max-w-xl mx-auto mt-16">
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">ユーザー情報</h1>

      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
        <span className="text-2xl text-white">{loginUser?.username[0]}</span>
      </div>

      {/* フィードバックメッセージ */}
      {feedback && <p className="text-center text-green-600 mb-4">{feedback}</p>}

      {/* ユーザー情報編集フォーム */}
      <div className="space-y-4 w-full">
        {editMode ? (
          <>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-md">
              <label className="text-lg font-medium text-gray-700">ユーザー名</label>
              <input
                className="border rounded-lg p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
              onClick={handleUpdateUser}
            >
              保存
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-md">
            <p className="text-lg font-medium text-gray-700">ユーザー名</p>
            <p className="text-lg text-gray-900">{loginUser?.username}</p>
          </div>
        )}

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-lg w-full"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "キャンセル" : "編集"}
        </button>
      </div>

      {/* パスワード変更フォーム */}
      <div className="mt-8 w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">パスワード変更</h2>
        <input
          className="border rounded-lg p-2 w-full mb-2"
          type="password"
          placeholder="現在のパスワード"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          className="border rounded-lg p-2 w-full mb-4"
          type="password"
          placeholder="新しいパスワード"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
          onClick={handleChangePassword}
        >
          パスワード変更
        </button>

        <button
        className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full mt-4"
        onClick={handleLogout}
      >
        ログアウト
      </button>
      </div>

      {/* アカウント削除ボタン */}
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-lg w-full mt-8"
        onClick={handleDeleteAccount}
      >
        アカウント削除
      </button>
    </div>
  );
};

export default UserProfile;
