import { useContext, useEffect, useState } from "react";
import { LoginUserContext } from "../contexts/LoginUserContext";
import { handleError } from "../api/handleAPIError";
import { getLoginUser } from "../api/UserAPI";

export const useLoginUser = () => {
  const { loginUser, setLoginUser } = useContext(LoginUserContext);
  const [loading, setLoading] = useState(loginUser === null); // 初回取得中か
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loginUser !== null) return;
    if (!localStorage.getItem("token")) return;

    const fetchLoginUser = async () => {
      setLoading(true);
      try {
        const res = await getLoginUser();
        setLoginUser(res);
        setErrorMessage(null);
      } catch (err: unknown) {
        setErrorMessage(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchLoginUser();
  }, [loginUser, setLoginUser]);

  return { loginUser, loading, errorMessage, setLoginUser };
};