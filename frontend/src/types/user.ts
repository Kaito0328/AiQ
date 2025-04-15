
export interface User {
    id: number;
    username: string;
    official: boolean;
    self: boolean
}

export interface UpdateUserRequest {
    username: string;
}
