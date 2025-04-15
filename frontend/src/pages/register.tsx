import React, { useState } from "react";
import { register } from "../api/AuthAPI"; // register 関数をインポート
import { AuthRequest } from "../types/types"; // 必要な型をインポート
import { Link } from "react-router-dom"; // React Router を使ってページ遷移

const Register: React.FC = () => {
  // AuthRequest を使ってユーザー名とパスワードを一つのオブジェクトで管理
  const [authRequest, setAuthRequest] = useState<AuthRequest>({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess(false);

    try {
      // register 関数を使用してユーザー登録処理を行う
      const isRegistered = await register(authRequest);

      if (!isRegistered) {
        setError("アカウント作成に失敗しました");
        return;
      }

      setSuccess(true); // 登録成功時に成功メッセージを表示
    } catch (err) {
      setError("アカウント作成に失敗しました");
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
        <h2 className="text-2xl font-semibold text-center mb-6">アカウント作成</h2>
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
          onClick={handleRegister}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
        >
          登録
        </button>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {success && <p className="mt-4 text-green-600 text-center">アカウントが作成されました！</p>}

        {/* ログインページへのリンク */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            すでにアカウントをお持ちですか？
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
              ログインはこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
