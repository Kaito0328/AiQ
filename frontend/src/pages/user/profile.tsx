import React from "react";
import { useLoginUser } from "../../hooks/useLoginUser";
import Page from "../../components/containerComponents/Page";
import UserProfile from "../../components/User/Profile/UserProfile";
import { deleteUser, updateUser } from "../../api/UserAPI";
import { logout } from "../../api/AuthAPI";
import { useNavigate } from "react-router-dom";
import Paths from "../../routes/Paths";

const UserProfilePage: React.FC = () => {
  const { loginUser, setLoginUser, loading, errorMessage } = useLoginUser();
const navigate = useNavigate();
  
  const handleUpdateUser = async (
    username: string,
    onSuccess?: () => void
  ) => { 
      await updateUser({ username });
      setLoginUser((loginUser ? {...loginUser, username }: null));
      onSuccess?.();
  };
  const handleDeleteAccount = async () => {
    if (confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) {
        await deleteUser();
        handleLogout();
    }
  };

  const handleLogout = () => {
      logout();
      navigate(Paths.LOGIN);
  };


  return (
    <Page
      title={"ユーザープロフィール"}
      loading={loading}
      errorMessage={errorMessage ?? undefined}
    >
      <div className="w-full flex justify-center">
        <div className="min-w-[90%]">
          <UserProfile
            loginUser={loginUser ?? undefined}
            handleDeleteAccount={handleDeleteAccount}
            handleUpdateUser={handleUpdateUser}
            handleLogout={handleLogout}
          />
        </div>
      </div>

    </Page>
  );
};

export default UserProfilePage;
