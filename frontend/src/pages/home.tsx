import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaUsers, FaUser } from "react-icons/fa";
import { useLoginUser } from "../hooks/useLoginUser";
import { useOfficialUser } from "../hooks/useOfficialUser";
import { UserContext } from "../contexts/UserContext";
import Paths from "../routes/Paths";
import { generatePath } from "react-router-dom";
import FavoriteCollectionList from "../components/item/favorite-collection/FavoriteCollectionList";
import SectionCard from "../components/common/sectionCard/sectionCard";
import { ThemeColor } from "../style/color";
import WelcomeBanner from "../components/common/bannar/WelcomeBannar";
import Button from "../components/common/button/Button";

enum UserType {
Official = "official",
Self = "self",
Users = "users",
}

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


  const handleNavigate = (type: UserType) => {
    if (type === UserType.Users) {
      navigate(Paths.USER_LIST);
    } else {

      let userId;
      if (type === UserType.Self) {
        userId = loginUser?.id;
        setUser(loginUser);
      } else if (type === UserType.Official) {
        userId = officialUser?.id;
        setUser(officialUser);
      }
      if (userId !== undefined && userId !== null) {
        navigate(generatePath(Paths.COLLECTION_SET_PAGE, { userId: String(userId) }));
      } else {
        console.error("ユーザーIDが取得できていません");
      }
    }
  };

  const options = [
    { label: "公式の問題解答", icon: <FaBook />, color: ThemeColor.Emerald, type: UserType.Official },
    { label: "自分の問題解答", icon: <FaUser />, color: ThemeColor.Indigo, type: UserType.Self },
    { label: "他ユーザーの問題解答", icon: <FaUsers />, color: ThemeColor.Gray, type: UserType.Users },
  ];

  const visibleOptions = options.filter(
    (option) => option.type !== UserType.Users || loginUser !== null
  );

    useEffect(() => {
    if (loginLoading || officialLoading) {
      navigate(Paths.TOP);
    }
  }, [loginLoading, officialLoading, navigate]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 font-sans w-full">
      {showWelcome && (
        <WelcomeBanner
          username={loginUser ? loginUser.username : undefined}
        />
      )}

      {!loginUser && !loginLoading && (
        <div className="flex justify-end mt-5 w-full px-5">
          <Button
            onClick={() => navigate(Paths.LOGIN)}
            label="ログイン"
            size="md"
            color="indigo"
            rounded="md"
            fullWidth={false}
          />
        </div>
      )}

      <div
        className={`mt-12 w-[90%] max-w-4xl grid gap-8 justify-center 
          ${visibleOptions.length === 1 ? "grid-cols-1" : ""}
          ${visibleOptions.length === 2 ? "grid-cols-2" : ""}
          ${visibleOptions.length >= 3 ? "md:grid-cols-3" : ""}`}
      >
        {visibleOptions.map(({ label, icon, color, type }) => (
          <SectionCard
            label={label}
            icon={icon}
            color={color}
            onClick={() => handleNavigate(type)}
            />
        ))}
      </div>

      {loginUser && (
        <div className="mt-16 w-full px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            あなたのお気に入りコレクション
          </h2>
          <FavoriteCollectionList 
            isOwner={true}
            userId={Number(loginUser?.id)}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
