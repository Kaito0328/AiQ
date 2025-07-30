import { AuthRequest, AuthResponse } from '../types/types';
import { fetchFromAPI } from './api';

export const login = async (request: AuthRequest): Promise<AuthResponse> => {
  const response = await fetchFromAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request), // ユーザー名とパスワードを送信
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const register = async (request: AuthRequest): Promise<AuthResponse> => {
  const response = await fetchFromAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(request), // ユーザー名とパスワードを送信
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};
