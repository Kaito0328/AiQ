import React, { useState, useEffect } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { fetchUserList } from "../../api/UserAPI";
import { getFollowees, getFollowers } from "../../api/Follow";
import { User } from "../../types/user";
import { useLoginUser } from "../../hooks/useLoginUser";
import LoadingIndicator from "../../components/item/layout/LoadingIndicator";
import { useUser } from "../../hooks/useUser";
import Paths from "../../routes/Paths";

type TabType = "all" | "followers" | "followees";

const UserList: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [followers, setFollowers] = useState<User[] | null>(null);
  const [followees, setFollowees] = useState<User[] | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<TabType>("all");
  const { setUser } = useUser();

  const { loginUser } = useLoginUser();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        let data: User[] = [];

        if (tab === "all") {
          if (!allUsers) {
            const fetched = await fetchUserList();
            setAllUsers(fetched);
            data = fetched;
          } else {
            data = allUsers;
          }
        } else if (tab === "followers" && loginUser) {
          if (!followers) {
            const fetched = await getFollowers(loginUser.id);
            setFollowers(fetched);
            data = fetched;
          } else {
            data = followers;
          }
        } else if (tab === "followees" && loginUser) {
          if (!followees) {
            const fetched = await getFollowees(loginUser.id);
            setFollowees(fetched);
            data = fetched;
          } else {
            data = followees;
          }
        }

        setUsers(data);
      } catch (error) {
        console.error("ユーザー一覧の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [tab, loginUser, allUsers, followers, followees]);

  const handleSelectUser = (user: User) => {
    setUser(user);
    navigate(generatePath(Paths.COLLECTION_SET_PAGE, { userId: user.id}));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center flex items-center justify-center gap-2">
          <span role="img" aria-label="user">👥</span> ユーザー一覧
        </h1>

        {/* タブ切り替え */}
        <div className="flex justify-center mb-6 space-x-3">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === "all"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setTab("all")}
          >
            全ユーザー
          </button>
          {loginUser && (
            <>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  tab === "followees"
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setTab("followees")}
              >
                フォロー中
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  tab === "followers"
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setTab("followers")}
              >
                フォロワー
              </button>
            </>
          )}
        </div>

        {/* リスト表示 */}
        {loading ? (
          <LoadingIndicator />
        ) : users.length === 0 ? (
          <p className="text-center text-gray-600">データが見つかりませんでした。</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-100 transition cursor-pointer"
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-indigo-500 text-lg">👤</span>
                  <span className="text-gray-800 font-medium">{user.username}</span>
                </div>
                <span className="text-indigo-400 text-sm">▶</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserList;
