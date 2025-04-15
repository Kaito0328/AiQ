import { fetchFromAPI } from './api';
import { UpdateUserRequest, User } from '../types/user';

const USER_ENDPOINT = '/user';

export const getLoginUserid = async (): Promise<number> => {
  const response = await fetchFromAPI(`${USER_ENDPOINT}/id-only`, { method: 'GET' }, true); // 認証が必要なため、authenticated: true を指定
  return response.json();
};

export const getLoginUser = async (): Promise<User> => {
  const response = await fetchFromAPI(`${USER_ENDPOINT}`, { method: 'GET' }, true);
  return response.json();
};

export const getOfficialUser = async (): Promise<User> => {
  const response = await fetchFromAPI(`${USER_ENDPOINT}/official`, { method: 'GET' });
  return response.json();
};

export const updateUser = async (request: UpdateUserRequest): Promise<User> => {
  const response = await fetchFromAPI(
    `${USER_ENDPOINT}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    },
    true,
  );
  return response.json();
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  await fetchFromAPI(
    `${USER_ENDPOINT}/password`,
    {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    },
    true,
  );
};

export const deleteUser = async (): Promise<User> => {
  const response = await fetchFromAPI(
    `${USER_ENDPOINT}`,
    {
      method: 'DELETE',
    },
    true,
  );
  return response.json();
};

export const getOfficialUserId = async (): Promise<number> => {
  const response = await fetchFromAPI(`${USER_ENDPOINT}/id-only/official`, {}, true); // 認証が必要なため、authenticated: true を指定
  return response.json();
};

export const getUserById = async (userId: number): Promise<User> => {
  const response = await fetchFromAPI(`${USER_ENDPOINT}/id/${userId}`, {}, true); // 認証が必要なため、authenticated: true を指定
  return response.json();
};

export const fetchUserList = async (): Promise<User[]> => {
  const response = await fetchFromAPI(`${USER_ENDPOINT}/users`, {}, true);
  return response.json();
};
