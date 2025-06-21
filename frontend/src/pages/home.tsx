import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "../hooks/useLoginUser";
import { useOfficialUser } from "../hooks/useOfficialUser";
import { UserContext } from "../contexts/UserContext";
import Paths from "../routes/Paths";
import { generatePath } from "react-router-dom";
import FavoriteCollectionList from "../components/LearningItem/collection/favorite-collection/FavoriteCollectionList";
import WelcomeBanner from "../components/home/WelcomeBannar";
import BaseButton from "../components/common/button/BaseButton";
import HomeSectionCards from "../components/home/HomeSectionCards";
import { RoundKey } from "../style/rounded";
import { SizeKey } from "../style/size";
import { ColorKey } from "../style/colorStyle";
import Page from "../components/containerComponents/Page";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  const { loginUser, loading: loginLoading} = useLoginUser();
  const { officialUser, loading: officialLoading } = useOfficialUser();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const navigateUsers = () => {
    navigate(Paths.USER_LIST);
  }

  const navigateOfficialUser = () => {
    setUser(officialUser);
    if (officialUser) {
      navigate(generatePath(Paths.COLLECTION_SET_PAGE, { userId: String(officialUser.id) }));
    } else {
      console.error("公式ユーザーが取得できていません");
    }
  };

  const navigateLoginUser = () => {
    setUser(loginUser);
    if (loginUser) {
      navigate(generatePath(Paths.COLLECTION_SET_PAGE, { userId: String(loginUser.id) }));
    } else {
      console.error("ログインユーザーが取得できていません");
    }
  };

    useEffect(() => {
    if (loginLoading || officialLoading) {
      navigate(Paths.TOP);
    }
  }, [loginLoading, officialLoading, navigate]);

  return (
    <Page>
      <div className="flex flex-col items-center min-h-screen font-sans w-full">
        {showWelcome && (
          <WelcomeBanner
            username={loginUser ? loginUser.username : undefined}
          />
        )}

        {!loginUser && !loginLoading && (
          <div className="flex justify-end mt-5 w-full px-5">
            <BaseButton
              onClick={() => navigate(Paths.LOGIN)}
              label="ログイン"
              style={{
                color: {
                  colorKey: ColorKey.Primary
                },
                roundKey: RoundKey.Md,
                size: {
                  sizeKey: SizeKey.MD
                }
              }}
            />
          </div>
        )}

        <HomeSectionCards
          navigateLoginUser={() => navigateLoginUser()}
          navigateOfficialUser={() => navigateOfficialUser()}
          navigateUsers={() => navigateUsers()}
          isLogin={loginUser !== null}
        />

        {loginUser && (
          <div className="mt-16 w-full px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              あなたのお気に入りコレクション
            </h2>
            <FavoriteCollectionList 
              userId={Number(loginUser?.id)}
            />
          </div>
        )}
      </div>

    </Page>

  );
};

export default Home;
