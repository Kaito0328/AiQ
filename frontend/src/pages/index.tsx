import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "../hooks/useLoginUser";
import { useOfficialUser } from "../hooks/useOfficialUser";
import Paths from "../routes/Paths";

const TopPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading: loginLoading } = useLoginUser();
  const { loading: officialLoading } = useOfficialUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loginLoading && !officialLoading) {
      setReady(true); // ローディング完了後、ボタンを有効にする
    }
  }, [loginLoading, officialLoading]);

  const handleStart = () => {
    if (ready) {
      navigate(Paths.HOME);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex flex-col items-center justify-center px-6">
      {/* 背景装飾 */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse -z-10" />

      {/* ロゴとアプリ名 */}
      <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4" />
      <h1 className="text-5xl font-bold tracking-wider drop-shadow-lg">AiQ</h1>
      <p className="mt-4 text-lg md:text-xl text-white/80 max-w-md text-center">
        あなた専用のクイズ学習アプリ。<br />知識を深め、成績を記録して成長を実感しよう。
      </p>

      {/* スタートボタン */}
      <button
        onClick={handleStart}
        disabled={!ready}
        className={`mt-10 px-8 py-3 font-semibold rounded-full shadow-lg transition transform duration-200
          ${ready
            ? "bg-white text-purple-600 hover:bg-purple-100 hover:scale-105"
            : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
      >
        {ready ? "はじめる" : (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>読み込み中...</span>
          </div>
        )}
      </button>

      {/* フッター */}
      <div className="absolute bottom-4 text-xs text-white/50">
        © 2025 AiQ All rights reserved.
      </div>
    </div>
  );
};

export default TopPage;
