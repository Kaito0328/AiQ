import { useContext, useEffect, useState } from "react";
import { UserContext as UserContext } from "../contexts/UserContext";
import { handleError } from "../api/handleAPIError";
import { getUserById } from "../api/UserAPI"; // ← userId 指定で取得するAPIを想定

export const useUser = (userId: string | undefined) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null || user?.id === Number(userId)) return;


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

  return { user, loading, errorMessage, setUser, onFollowStatusChange };
};
