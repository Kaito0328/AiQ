import React, { useState } from "react";
import { register } from "../../api/AuthAPI"; // register 関数をインポート
import { AuthRequest } from "../../types/types"; // 必要な型をインポート
import { Link, useNavigate } from "react-router-dom"; // React Router を使ってページ遷移
import SecurityNotice from "../../components/auth/SecurityNotice";
import AuthForm from "../../components/auth/AuthForm.";
import Paths from "../../routes/Paths";
import { handleError } from "../../api/handleAPIError";

const Register: React.FC = () => {
  // AuthRequest を使ってユーザー名とパスワードを一つのオブジェクトで管理
  const [authRequest, setAuthRequest] = useState<AuthRequest>({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      await register(authRequest);
      navigate(Paths.HOME);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
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
    <AuthForm
      title="新規登録"
      username={authRequest.username}
      password={authRequest.password}
      onChange={handleChange}
      onSubmit={handleRegister}
      submitLabel="登録"
      loading={loading}
      error={error}
    >
      <div className="text-center text-sm text-gray-500">
        アカウントをお持ちですか？{" "}
        <Link to={Paths.LOGIN} className="text-indigo-600 hover:text-indigo-700">
          ログインはこちら
        </Link>
      </div>
      <div className="mt-6">
        <SecurityNotice />
      </div>
    </AuthForm>
  );
};

export default Register;
