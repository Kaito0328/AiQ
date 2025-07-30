import React from "react";
import Page from "../../../components/containerComponents/Page";
import PasswordChange from "../../../components/User/PasswordChange/PasswordChange";
import { changePassword } from "../../../api/UserAPI";

const PassWordChangePage: React.FC = () => {

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
    ) => {
        await changePassword(currentPassword, newPassword);
    };


  return (
    <Page
        withBackBUtton={true}
      title={"パスワード変更"}
    >
      <div className="flex justify-center">
        <div className="min-w-[90%]">
          <PasswordChange
          handleChangePassword={handleChangePassword}

          />
        </div>
      </div>
    </Page>
  );
};

export default PassWordChangePage;
