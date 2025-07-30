import React, { useState } from "react";
import { login } from "../../api/AuthAPI";
import { AuthRequest } from "../../types/types";
import { Link } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm.";
import SecurityNotice from "../../components/auth/SecurityNotice";
import Paths from "../../routes/Paths";
import { handleError } from "../../api/handleAPIError";
import Page from "../../components/containerComponents/Page";

const Login: React.FC = () => {
  const [authRequest, setAuthRequest] = useState<AuthRequest>({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(authRequest);
      window.location.href = Paths.HOME; // ログイン後にリダイレクト
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthRequest({ ...authRequest, [e.target.name]: e.target.value });
  };

  return (
    <Page>
      <AuthForm
        title="ログイン"
        username={authRequest.username}
        password={authRequest.password}
        onChange={handleChange}
        onSubmit={handleLogin}
        submitLabel="ログイン"
        loading={loading}
        error={error}
      >
        <div className="text-center text-sm text-gray-500">
          アカウントをお持ちでないですか？{" "}
          <Link to={Paths.REGISTER} className="text-indigo-600 hover:text-indigo-700">
            登録はこちら
          </Link>
        </div>
        <div className="mt-6">
          <SecurityNotice />
        </div>
      </AuthForm>
    </Page>

  );
};

export default Login;
