import React, { useState } from "react";
import { updateUser, changePassword, deleteUser } from "../../api/UserAPI";
import { logout } from "../../api/AuthAPI";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "../../hooks/useLoginUser";
import { handleError } from "../../api/handleAPIError";
import PasswordChangeForm from "./../../components/User/PasswordChangeForm"; // 🔄 新規作成したフォームをインポート
import LogoutButton from "../../components/User/LogoutButton";
import DeleteAccountButton from "../../components/User/DeleteAccountButton";
import UserInfoCard from "../../components/User/UserInfoCard";
import Page from "../../components/containerComponents/Page";

const UserProfile: React.FC = () => {
  const { loginUser, setLoginUser, loading, errorMessage } = useLoginUser();
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  if (errorMessage) {
    return <div className="flex justify-center items-center min-h-screen"><p>{errorMessage}</p></div>;
  }

  const handleUpdateUser = async (
    username: string,
    onSuccess?: () => void
  ) => {
    try {
      await updateUser({ username });
      setFeedback("ユーザー情報を更新しました！");
      setLoginUser((loginUser ? {...loginUser, username }: null));
      onSuccess?.();

    } catch (error) {
      setFeedback(handleError(error));
    }
  };

  const handleChangePassword = async (
    oldPassword: string,
    newPassword: string,
    onSuccess?: () => void
  ) => {
    try {
      await changePassword(oldPassword, newPassword);
      setFeedback("パスワードを変更しました！");
      onSuccess?.();
    } catch (error) {
      setFeedback(handleError(error));
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) {
      try {
        await deleteUser();
        setFeedback("アカウントを削除しました");
        logout();
        navigate("/login");
      } catch (error) {
        setFeedback(handleError(error));
      }
    }
  };

  const handleLogout = () => {
    try {
      logout();
      setFeedback("ログアウトしました！");
      navigate("/login");
    } catch (error) {
      setFeedback(handleError(error));
    }
  };

  return (
    <Page>
            <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg max-w-xl mx-auto mt-16">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">ユーザー情報</h1>

        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
          <span className="text-2xl text-white">{loginUser?.username[0]}</span>
        </div>

        {feedback && <p className="text-center text-green-600 mb-4">{feedback}</p>}

      <UserInfoCard onUpdateUser={handleUpdateUser} loginUser={loginUser} />
        <div className="w-full mt-10">
                  <PasswordChangeForm onChangePassword={handleChangePassword} />
        </div>

      <div className="mt-10 flex justify-center">
          <div className="min-w-[30%]">
            <LogoutButton handleLogout={handleLogout} />
            <DeleteAccountButton handleDeleteAccount={handleDeleteAccount} />
          </div>
      </div>

      </div>
    </Page>
  );
};

export default UserProfile;
