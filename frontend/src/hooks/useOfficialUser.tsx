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

    const localOfficialUser = localStorage.getItem("officialUser");
    if (localOfficialUser !== null) {
        const user  = JSON.parse(localOfficialUser);
        if ( user !== null ) {
            setOfficialUser(user)
            setLoading(false);
            return;
        }
    }

    const fetchOfficialUser = async () => {
      setLoading(true);
      try {
        const res = await getOfficialUser();
        setOfficialUser(res);
        setErrorMessage(null);
        localStorage.setItem("officialUser", JSON.stringify(res));
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