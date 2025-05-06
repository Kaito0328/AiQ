import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Paths from "../../routes/Paths";

const HeaderWithHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false); // メニューを閉じる
  };

  return (
    <div className="relative flex justify-between items-center w-full h-full p-4 shadow-lg text-white">
      {/* ロゴ（左） */}
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-10 w-10 mr-2 cursor-pointer"
          onClick={() => handleNavigate(Paths.HOME)}
        />
      </div>

      {/* AiQ（中央） */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold cursor-pointer"
        onClick={() => handleNavigate(Paths.HOME)}
      >
        AiQ
      </div>

      {/* ハンバーガーメニュー（右） */}
      <button className="text-4xl" onClick={() => setIsOpen(true)}>
        <Menu />
      </button>

      {/* サイドメニュー */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-2xl z-50 rounded-l-xl`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">MENU</h2>
          <button className="text-3xl" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>
        <nav className="p-5 space-y-6">
          <button
            onClick={() => handleNavigate(Paths.HOME)}
            className="block w-full text-left text-lg font-medium hover:text-blue-400 transition"
          >
            ホーム
          </button>
          <button
            onClick={() => handleNavigate(Paths.USER_PROFILE)}
            className="block w-full text-left text-lg font-medium hover:text-blue-400 transition"
          >
            アカウント
          </button>
          <button
            onClick={() => handleNavigate(Paths.RESUMABLE_QUIZZES_LIST)}
            className="block w-full text-left text-lg font-medium hover:text-blue-400 transition"
          >
            中断したクイズ
          </button>
        </nav>
      </div>

      {/* 背景オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default HeaderWithHamburgerMenu;
