import React from "react";
import { User } from "../../../types/user";
import BaseButton from "../../common/button/BaseButton";
import { FaUser } from "react-icons/fa";
import { CoreColorKey } from "../../../style/colorStyle";

interface UserListItemProps {
  user: User;
  onSelect: (user: User) => void;
}

const UserItem: React.FC<UserListItemProps> = ({ user, onSelect }) => {
  return (
    <li className="w-full">
      <BaseButton
        onClick={() => onSelect(user)}
        label={user.username}
        icon={<FaUser/>}
        style={{
          color: {
            colorKey: CoreColorKey.Primary,
          }
        }}
      />
    </li>
  );
};

export default UserItem;
