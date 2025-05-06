import { useContext, useEffect, useState } from "react";
import { LoginUserContext } from "../contexts/LoginUserContext";
import { extractErrorCode, handleError } from "../api/handleAPIError";
import { getLoginUser } from "../api/UserAPI";
import { logout } from "../api/AuthAPI";

type LoginUserStatus = "initial" | "loading" | "authenticated" | "unauthenticated";

export const useLoginUser = () => {
  const { loginUser, setLoginUser } = useContext(LoginUserContext);
  const [status, setStatus] = useState<LoginUserStatus>("initial");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // すでに取得済みなら何もしない
    if (loginUser !== null) {
      setStatus("authenticated");
      return;
    }

    // トークンがなければ未ログイン
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    // ユーザー取得開始
    setStatus("loading");
    console.log("Fetching login user...");

    const fetchLoginUser = async () => {
      try {
        const res = await getLoginUser();
        setLoginUser(res);
        setErrorMessage(null);
        setStatus("authenticated");
      } catch (err: unknown) {
        console.log(err);
        if (extractErrorCode(err).code === "NOT_FOUND_USER") {
          logout();
        }
        setErrorMessage(handleError(err));
        setStatus("unauthenticated");
      }
    };

    fetchLoginUser();
  }, [loginUser, setLoginUser]);

  return {
    loginUser,
    status,
    loading: status === "loading",
    isAuthenticated: status === "authenticated",
    errorMessage,
    setLoginUser,
  };
};
