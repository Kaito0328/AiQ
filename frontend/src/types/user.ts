export interface User {
  id: number;
  username: string;
  official: boolean;
  self: boolean;
  followerCount: number;
  followingCount: number;
  following: boolean;
  followed: boolean;
}

export interface UpdateUserRequest {
  username: string;
}
