import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "../hooks/useLoginUser";
import { useOfficialUser } from "../hooks/useOfficialUser";
import Paths from "../routes/Paths";
import LoadingButton from "../components/common/button/LoadingButton";

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

  
      <div className="mt-10">
        <LoadingButton
        onClick={handleStart}
        loading={!ready}
        label="はじめる"
        loadingText="読み込み中..."
        bg_color={true}
      />

      </div>


      {/* フッター */}
      <div className="absolute bottom-4 text-xs text-white/50">
        © 2025 AiQ All rights reserved.
      </div>
    </div>
  );
};

export default TopPage;
