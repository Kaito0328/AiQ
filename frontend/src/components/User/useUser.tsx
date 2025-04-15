import { useState, useEffect } from 'react';
import { getLoginUser } from '../../api/UserAPI'; // getCurrentUser APIをインポート
import { handleAPIError } from '../../api/handleAPIError';
import { User } from '../../types/user';

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getLoginUser();
        setUser(currentUser);
      } catch (err: any) {
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};

export default useUser;

