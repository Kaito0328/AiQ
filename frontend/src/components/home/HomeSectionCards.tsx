import React from "react";
import SectionCard from "./sectionCard";
import { FaBook, FaUser, FaUsers } from "react-icons/fa";

enum UserType {
  Official = "official",
  Self = "self",
  Users = "users",
}

interface HoneSectionCardsProps {
    navigateOfficialUser: () => void;
    navigateLoginUser: () => void;
    navigateUsers: () => void;
    isLogin: boolean;
}

const HomeSectionCards: React.FC<HoneSectionCardsProps> = ({navigateLoginUser, navigateOfficialUser, navigateUsers, isLogin}) => {

  const handleNavigate = (type: UserType) => {
    if (type === UserType.Users) {
      navigateUsers();
    } else  if (type === UserType.Self) {
        navigateLoginUser();
    } else if (type === UserType.Official) {
        navigateOfficialUser();
    }
  };

  const options = [
    { label: "公式の問題集", icon: <FaBook/>, type: UserType.Official },
    { label: "自分の問題集", icon: <FaUser/>, type: UserType.Self },
    { label: "ユーザーリスト", icon: <FaUsers/>, type: UserType.Users },
  ];

  const visibleOptions = options.filter(
    (option) => option.type !== UserType.Users || isLogin
  );

  return (
    <div className={`mt-12 w-[90%] max-w-4xl grid gap-8 justify-center 
        ${visibleOptions.length === 1 ? "grid-cols-1" : ""}
        ${visibleOptions.length === 2 ? "grid-cols-2" : ""}
        ${visibleOptions.length >= 3 ? "md:grid-cols-3" : ""}`}
    >
    {visibleOptions.map(({ label, icon, type }) => (
        <SectionCard
        key={type}
        label={label}
        icon={icon}
        onClick={() => handleNavigate(type)}
        />
    ))}
    </div>
  );
};

export default HomeSectionCards;
