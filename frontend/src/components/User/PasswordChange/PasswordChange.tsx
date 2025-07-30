import React, { useState } from "react";
import { handleError } from "../../../api/handleAPIError";
import BaseCard from "../../containerComponents/BaseCard";
import { SizeKey } from "../../../style/size";
import { User } from "../../../types/user";
import SuccessMessage from "../../common/Message/SuccessMessage";
import ErrorMessage from "../../common/Message/ErrorMessage";
import PasswordChangeForm from "./PasswordChangeForm";

interface UserProfileProps {
    loginUser?: User;
    handleChangePassword: (
        currentPassword: string,
        newPassword: string,
        onSuccess?: () => void
    ) => void;
}

const PasswordChange: React.FC<UserProfileProps> = ({
    handleChangePassword
        }) => {
        const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

  const onChangePassword = async (currentPassword: string, newPassword: string) => {
    setSuccessMessage("");
    setErrorMessage("");
    try {
      setLoading(true);
      await handleChangePassword(currentPassword, newPassword);
      setSuccessMessage("パスワードが変更されました");
    } catch (error) {
      const msg = handleError(error);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseCard
        style={{
            size: {
                sizeKey: SizeKey.XL,
            }
        }}
    >
         <div className="flex flex-col items-center">
            <SuccessMessage
                successMessage={successMessage}
            />
            <ErrorMessage
                errorMessage={errorMessage}
            />

            <PasswordChangeForm
                onChangePassword={onChangePassword}
                loading={loading}

            />
        
        </div>
      </BaseCard>
  );
};

export default PasswordChange;
