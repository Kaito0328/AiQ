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

export const getUsers = async (params?: { q?: string; sort?: string; page?: number; limit?: number }): Promise<UserProfile[]> => {
    let url = '/users';
    if (params) {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.append('q', params.q);
        if (params.sort) searchParams.append('sort', params.sort);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        const queryString = searchParams.toString();
        if (queryString) url += `?${queryString}`;
    }
    return await apiClient<UserProfile[]>(url, { authenticated: true });
};

export const updateProfile = async (data: { username?: string; displayName?: string; bio?: string; iconUrl?: string }): Promise<UserProfile> => {
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
