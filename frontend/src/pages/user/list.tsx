import React, { useState, useEffect } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { fetchUserList } from "../../api/UserAPI";
import { getFollowees, getFollowers } from "../../api/Follow";
import { User, UsersFilterOption, UsersFilterType } from "../../types/user";
import { useLoginUser } from "../../hooks/useLoginUser";
import LoadingIndicator from "../../components/Loading/Loading";
import { useUser } from "../../hooks/useUser";
import Paths from "../../routes/Paths";
import UserList from "../../components/User/userList/UserList"; // ← 追加
import ChangeUsersButton from "../../components/User/userList/ChangeUsersButton";
import BaseLabel from "../../components/baseComponents/BaseLabel";
import { FaUsers } from "react-icons/fa";
import { SizeKey } from "../../style/size";
import { FontWeightKey } from "../../style/fontWeight";

const USER_LIST_TAB_OPTIONS: UsersFilterOption [] = [
  { type: UsersFilterType.All, label: '全ユーザー' },
  { type: UsersFilterType.Followees, label: 'フォロー中', requiresLogin: true },
  { type: UsersFilterType.Followers, label: 'フォロワー', requiresLogin: true },
];

const UserListPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [followers, setFollowers] = useState<User[] | null>(null);
  const [followees, setFollowees] = useState<User[] | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<UsersFilterType>(UsersFilterType.All);
  const [options, setOptions] = useState<UsersFilterOption[]>([]);
  const { setUser } = useUser();

  const { loginUser } = useLoginUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loginUser) {
      setOptions(USER_LIST_TAB_OPTIONS);
    } else {
      setOptions(USER_LIST_TAB_OPTIONS.filter(option => !option.requiresLogin));
    }
  }, [loginUser]);


  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        let data: User[] = [];

        if (tab === UsersFilterType.All) {
          if (!allUsers) {
            const fetched = await fetchUserList();
            setAllUsers(fetched);
            data = fetched;
          } else {
            data = allUsers;
          }
        } else if (tab === UsersFilterType.Followers && loginUser) {
          if (!followers) {
            const fetched = await getFollowers(loginUser.id);
            setFollowers(fetched);
            data = fetched;
          } else {
            data = followers;
          }
        } else if (tab === UsersFilterType.Followees && loginUser) {
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
    navigate(generatePath(Paths.COLLECTION_SET_PAGE, { userId: user.id }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="font-bold mb-6 text-center flex items-center justify-center">
          <BaseLabel
            icon={<FaUsers />}
            label="ユーザーリスト"
            style = {{
              size: {
                sizeKey: SizeKey.LG,
              },
              fontWeightKey: FontWeightKey.Bold,
            }}
          />
        </h1>

        {/* タブ切り替え */}
        <ul className="flex justify-center  items-center mb-6 space-x-10">
          {options.map((option) => (
            <ChangeUsersButton
              key={option.type}
              option={option}
              isSelected={tab === option.type}
              onClick={() => setTab(option.type)}
            />
          ))}
        </ul>

        {/* UserList コンポーネントに差し替え */}
        {loading ? (
          <LoadingIndicator />
        ) : (
          <UserList users={users} onSelectUser={handleSelectUser} />
        )}
      </div>
    </div>
  );
};

export default UserListPage;
