import React, { useState, useMemo } from "react";
import { User, UsersSortType } from "../../../types/user";
import UserItem from "./UserItem";
import UserFilter from "./UserFilter";
import UserSort from "./UserSort";


type Props = {
  users: User[];
  onSelectUser: (user: User) => void;
};

const UserList: React.FC<Props> = ({ users, onSelectUser }) => {
  const [sort, setSort] = useState<UsersSortType>(UsersSortType.NameAsc);
  const [searchText, setSearchText] = useState("");

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter((u) => u.username.toLowerCase().includes(lower));
    }

    result.sort((a, b) => {
      switch (sort) {
        case UsersSortType.NameAsc:
          return a.username.localeCompare(b.username);
        case UsersSortType.NameDsc:
          return b.username.localeCompare(a.username);
        case UsersSortType.FollowerCountAsc:
          return a.followerCount - b.followerCount;
        case UsersSortType.FollowerCountDesc:
          return b.followerCount - a.followerCount;
      }
    });

    return result;
  }, [users, sort, searchText]);

  return (
    <div className="space-y-4">
      <UserFilter
        searchText={searchText}
        onSearchChange={setSearchText}
      />
      <div className="w-full flex justify-end mb-2">
        <UserSort
          sort={sort}
          onSortChange={setSort}
        />
      </div>


      {filteredAndSortedUsers.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          条件に一致するユーザーが見つかりませんでした。
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredAndSortedUsers.map((user) => (
            <UserItem key={user.id} user={user} onSelect={onSelectUser} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
