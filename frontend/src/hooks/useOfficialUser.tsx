import { useContext, useEffect, useState } from "react";
import { OfficialUserContext } from "../contexts/OfficialUserContext";
import { handleError } from "../api/handleAPIError";
import { getOfficialUser } from "../api/UserAPI";

export const useOfficialUser = () => {
  const { officialUser, setOfficialUser } = useContext(OfficialUserContext);
  const [loading, setLoading] = useState(officialUser === null); // 初回取得中か
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    
    if (officialUser !== null) return;
    
    const fetchOfficialUser = async () => {
      setLoading(true);
      try {
        const res = await getOfficialUser();
        console.log(res);
        setOfficialUser(res);
        setErrorMessage(null);
      } catch (err: unknown) {
        setErrorMessage(handleError(err));
      } finally {
        setLoading(false);
      }
    };


    fetchOfficialUser();
  }, [officialUser, setOfficialUser]);

  return { officialUser, loading, errorMessage, setOfficialUser };
};