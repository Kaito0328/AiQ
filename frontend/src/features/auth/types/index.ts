export interface AuthRequest {
    username: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
}

export interface UpdateProfileRequest {
    username?: string;
    displayName?: string;
    bio?: string;
    iconUrl?: string;
}
