import React from "react";

type Props = {
  title: string;
  username: string;
  password: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  submitLabel: string;
  loading: boolean;
  error?: string;
  success?: string;
  children?: React.ReactNode;
};

const AuthForm: React.FC<Props> = ({
  title,
  username,
  password,
  onChange,
  onSubmit,
  submitLabel,
  loading,
  error,
  success,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">{title}</h2>
        <input
          type="text"
          name="username"
          placeholder="ユーザー名"
          value={username}
          onChange={onChange}
          className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          name="password"
          placeholder="パスワード"
          value={password}
          onChange={onChange}
          className="w-full p-3 mb-6 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full py-3 font-semibold rounded-md transition ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {loading ? `${submitLabel}中...` : submitLabel}
        </button>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {success && <p className="mt-4 text-green-600 text-center">{success}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
};

export default AuthForm;
