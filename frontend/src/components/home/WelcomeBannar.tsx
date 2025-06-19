import React from "react";

type Props = {
  username?: string;
};

const WelcomeBanner: React.FC<Props> = ({ username }) => {
  return (
    <div className="relative w-full z-50">
      <div className="bg-gradient-to-r from-purple-700 to-blue-500 text-white text-lg font-semibold py-3 px-6 rounded-b-lg shadow-xl transform opacity-90 transition-all ease-in-out duration-500">
        {username ? `${username} さん、ようこそ！` : "ゲストさん、ようこそ！"}
      </div>
    </div>
  );
};

export default WelcomeBanner;
