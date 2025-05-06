import { useContext, useEffect, useState } from "react";
import { UserContext as UserContext } from "../contexts/UserContext";
import { handleError } from "../api/handleAPIError";
import { getUserById } from "../api/UserAPI";
import { User } from "../types/user";

export const useUser = (
  userId?: number,
  initialUser?: User
) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 初期ユーザーを渡されたらセット
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  // IDから取得する処理
  useEffect(() => {
    if (userId === undefined || userId === null) return;
    if (user?.id === userId) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await getUserById(Number(userId));
        setUser(res);
        setErrorMessage(null);
      } catch (err: unknown) {
        setErrorMessage(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, user, setUser]);

  // 外部からフォロー状態を更新する関数
  const onFollowStatusChange = (follow: boolean) => {
    if (!user) return;

    const updatedFollowerCount = follow
      ? user.followerCount + 1
      : user.followerCount - 1;

    setUser({
      ...user,
      following: follow,
      followerCount: Math.max(0, updatedFollowerCount),
    });
  };

  return {
    user,
    loading,
    errorMessage,
    setUser,
    onFollowStatusChange
  };
};
