import React, { useState } from "react";
import { login } from "../api/AuthAPI"; // login 関数をインポート
import { AuthRequest } from "../types/types"; // 必要な型をインポート
import { Link } from "react-router-dom"; // React Router を使ってページ遷移

const Login: React.FC = () => {
  // AuthRequest を使ってユーザー名とパスワードを一つのオブジェクトで管理
  const [authRequest, setAuthRequest] = useState<AuthRequest>({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      await login(authRequest);

      window.location.href = "/"; // 認証済みページへ遷移
    } catch (err) {
      setError("ログインに失敗しました");
      console.log(err);
    }
  };

  // 入力フィールドの変更を一括で処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthRequest({
      ...authRequest,
      [e.target.name]: e.target.value, // name属性でキーを動的に変更
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">ログイン</h2>
        <input
          type="text"
          name="username"
          placeholder="ユーザー名"
          value={authRequest.username}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          name="password"
          placeholder="パスワード"
          value={authRequest.password}
          onChange={handleChange}
          className="w-full p-3 mb-6 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
        >
          ログイン
        </button>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        {/* 登録ページへのリンク */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            アカウントをお持ちでないですか？
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700">
              登録はこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
