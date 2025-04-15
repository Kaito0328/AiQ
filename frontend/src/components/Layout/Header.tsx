import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // lucide-reactを使用してアイコンを表示

const HeaderWithHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center h-full p-4 shadow-lg">
      {/* 左上にロゴとアプリ名 */}
      <div className="flex items-center">
      <img
        src="/logo.png"
        alt="Logo"
        className="h-10 w-10 mr-2 cursor-pointer"
        onClick={() => navigate("/")}
      />
      </div>
      <div className="text-3xl font-bold text-white">AiQ</div>
      {/* ハンバーガーメニューアイコン */}
      <button className="text-white text-4xl" onClick={() => setIsOpen(true)}>
        <Menu />
      </button>

      {/* サイドメニュー */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform ${
          isOpen ? "translate-x-0" : "translate-x-[100%]"
        } transition-transform duration-300 ease-in-out shadow-2xl z-50 rounded-l-xl`}
      >
        <div className="p-4 flex justify-between items-center border-b w-full">
          <h2 className="text-xl font-semibold">MENU</h2>
          <button className="text-white text-3xl focus:outline-none" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>
        <nav className="p-5 space-y-6">
          <a href="/" className="block text-lg font-medium hover:text-blue-400 transition duration-200">
            ホーム
          </a>
          <a href="#" className="block text-lg font-medium hover:text-blue-400 transition duration-200">
            問題一覧
          </a>
          <a href="#" className="block text-lg font-medium hover:text-blue-400 transition duration-200">
            設定
          </a>
          <a href="/user" className="block text-lg font-medium hover:text-blue-400 transition duration-200">
            アカウント
          </a>
        </nav>
      </div>

      {/* メニューオーバーレイ（クリックで閉じる） */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-60 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default HeaderWithHamburgerMenu;
