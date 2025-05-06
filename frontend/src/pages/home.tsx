import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaUsers, FaUser } from "react-icons/fa";
import { getFavoriteCollections } from "../api/CollectionAPI";
import { Collection } from "../types/collection";
import { useLoginUser } from "../hooks/useLoginUser";
import { useOfficialUser } from "../hooks/useOfficialUser";
import { UserContext } from "../contexts/UserContext";
import LoadingIndicator from "../components/item/layout/LoadingIndicator";
import Paths from "../routes/Paths";
import { generatePath } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  const { loginUser, loading: loginLoading} = useLoginUser();
  const { officialUser, loading: officialLoading } = useOfficialUser();
  const { setUser } = useContext(UserContext);

  const [collectionsLoading, setCollectionsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      if (loginUser) {
        try {
          const userCollections = await getFavoriteCollections(loginUser.id);
          setCollections(userCollections);
        } catch (err) {
          console.error("コレクションの取得に失敗しました", err);
        } finally {
          setCollectionsLoading(false);
        }
      } else {
        setCollectionsLoading(false);
      }
    };
  
    fetchCollections();
  }, [loginUser]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (type: "official" | "self" | "user") => {
    if (type === "user") {
      navigate(Paths.USER_LIST);
    } else {

      let userId;
      if (type === "self") {
        userId = loginUser?.id;
        setUser(loginUser);
      } else if (type === "official") {
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

  useEffect(() => {
    if (loginLoading || officialLoading) {
      navigate(Paths.TOP);
    }
  }, [loginLoading, officialLoading, navigate]);

  const options = [
    { label: "公式の問題解答", icon: <FaBook />, color: "bg-blue-500", type: "official" },
    { label: "自分の問題解答", icon: <FaUser />, color: "bg-green-500", type: "self" },
    { label: "他ユーザーの問題解答", icon: <FaUsers />, color: "bg-yellow-500", type: "user" },
  ];

  const visibleOptions = options.filter(
    (option) => option.type !== "self" || loginUser !== null
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 font-sans w-full">
      {showWelcome && (
        <div className="relative w-full z-50">
          <div className="bg-gradient-to-r from-purple-700 to-blue-500 text-white text-lg font-semibold py-3 px-6 rounded-b-lg shadow-xl transform opacity-90 transition-all ease-in-out duration-500">
            {loginUser ? `${loginUser.username} さん、ようこそ！` : "ゲストさん、ようこそ！"}
          </div>
        </div>
      )}

      {!loginUser && !loginLoading && (
        <div className="flex justify-end mt-5 w-full px-5">
          <button
            onClick={() => navigate(Paths.LOGIN)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            ログイン
          </button>
        </div>
      )}

      <div
        className={`mt-12 w-[90%] max-w-4xl grid gap-8 justify-center 
          ${visibleOptions.length === 1 ? "grid-cols-1" : ""}
          ${visibleOptions.length === 2 ? "grid-cols-2" : ""}
          ${visibleOptions.length >= 3 ? "md:grid-cols-3" : ""}`}
      >
        {visibleOptions.map(({ label, icon, color, type }) => (
          <button
            key={type}
            onClick={() => handleNavigate(type as "official" | "self" | "user")}
            className={`${color} flex flex-col items-center justify-center p-6 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 ease-out`}
          >
            <div className="text-5xl mb-2">{icon}</div>
            <span className="text-lg font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {loginUser && (
        <div className="mt-16 w-full px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            あなたのお気に入りコレクション
          </h2>
          {collectionsLoading ? (
            <div className="flex justify-center">
              <LoadingIndicator text="コレクションを読み込み中..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-[90%] max-w-5xl mx-auto">
              {collections.length > 0 ? (
                collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="relative flex flex-col justify-between p-6 bg-white shadow-xl rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                    onClick={() =>
                      navigate(`/user/${collection.userId}/collection/${collection.id}/questions`)
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-10 rounded-xl"></div>
                    <FaBook className="text-5xl text-purple-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">{collection.name}</h3>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center w-full">
                  まだコレクションがありません
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
