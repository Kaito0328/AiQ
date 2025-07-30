import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError } from "../../../api/handleAPIError";
import UserInfoCard from "./UserInfoCard";
import LogoutButton from "./LogoutButton";
import DeleteAccountButton from "./DeleteAccountButton";
import BaseCard from "../../containerComponents/BaseCard";
import BaseLabel from "../../baseComponents/BaseLabel";
import { SizeKey } from "../../../style/size";
import { FontWeightKey } from "../../../style/fontWeight";
import BaseButton from "../../common/button/BaseButton";
import { ColorPropertyKey } from "../../../style/colorStyle";
import { User } from "../../../types/user";
import SuccessMessage from "../../common/Message/SuccessMessage";
import ErrorMessage from "../../common/Message/ErrorMessage";

interface UserProfileProps {
    loginUser?: User;
    handleUpdateUser: (
        username: string,
    ) => Promise<void>;
    handleDeleteAccount: () => Promise<void>;
    handleLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
    loginUser,
    handleUpdateUser,
    handleDeleteAccount,
    handleLogout
        }) => {
        const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

    const onUpdateUser = async (username: string) => {
        setSuccessMessage("");
        setErrorMessage("");
        try {
            setLoading(true);
            await handleUpdateUser(username);
            setSuccessMessage("ユーザー名が更新されました");
        } catch (error) {
            const msg = handleError(error);
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    const onDeleteUser = async () => {
        setSuccessMessage("");
        setErrorMessage("");
        try {
            setLoading(true);
            await handleDeleteAccount();
            setSuccessMessage("アカウントが削除されました");
        } catch (error) {
            const msg = handleError(error);
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    const onLogout = async () => {
        setSuccessMessage("");
        setErrorMessage("");
        try {
            setLoading(true);
            handleLogout();
            setSuccessMessage("ログアウトしました");
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
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
                <span className="text-2xl text-white">{loginUser?.username[0]}</span>
            </div>

            <SuccessMessage successMessage={successMessage} />
            <ErrorMessage   errorMessage={errorMessage} />

            <div className="w-full">
                <BaseLabel
                    label="ユーザー名"
                    style={{
                        fontWeightKey: FontWeightKey.Bold,
                        size: {
                            sizeKey: SizeKey.LG
                        }
                    }}
                />
                <div className="border-t pt-4">
                    <UserInfoCard
                        loginUser={loginUser}
                        onUpdateUser={onUpdateUser}
                        loading={loading}
                    />

                </div>



            </div>

                <div className="w-full mt-10 ">
                    <BaseLabel
                        label="パスワード変更"
                        style={{
                            fontWeightKey: FontWeightKey.Bold,
                        }}
                    />
                    <div className="flex justify-center border-t pt-4">
                        <BaseButton
                            onClick={() => navigate("/user/password-change")}
                            label="パスワードを変更する"
                            style={{
                                color: {
                                    properties: [ColorPropertyKey.Label, ColorPropertyKey.Border]
                                },
                                size: {
                                    sizeKey: SizeKey.SM,
                                    widthPercent: 30,

                                }
                            }}
                        />
                    </div>

                </div>

            <div className="mt-10 flex justify-center  items-center flex-col space-y-2">
                    <LogoutButton handleLogout={onLogout} 
                        widthPercent={30}
                    />
                    <DeleteAccountButton handleDeleteAccount={onDeleteUser} widthPercent={30} />
            </div>
        </div>
      </BaseCard>
  );
};

export default UserProfile;
