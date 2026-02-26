import { apiClient } from '@/src/shared/api/apiClient';
import { AuthRequest, AuthResponse } from '../types';
import { UserProfile } from '@/src/entities/user';

export const login = async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (response.token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
        }
    }

    return response;
};

export const register = async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await apiClient<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (response.token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
        }
    }

    return response;
};

export const getMe = async (): Promise<UserProfile> => {
    return await apiClient<UserProfile>('/auth/me', {
        authenticated: true,
    });
};

export const logout = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

export const getOfficialUser = async (): Promise<UserProfile> => {
    return await apiClient<UserProfile>('/users/official', { authenticated: true });
};

export const getProfile = async (userId: string): Promise<UserProfile> => {
    return await apiClient<UserProfile>(`/users/${userId}`, { authenticated: true });
};

export const getUsers = async (): Promise<UserProfile[]> => {
    return await apiClient<UserProfile[]>('/users', { authenticated: true });
};

export const updateProfile = async (data: { username?: string; displayName?: string; bio?: string }): Promise<UserProfile> => {
    return await apiClient<UserProfile>('/user', {
        method: 'PUT',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient<void>('/user/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword }),
        authenticated: true,
    });
};
