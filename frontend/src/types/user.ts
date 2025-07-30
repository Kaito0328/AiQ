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

export enum UsersFilterType {
  All = 'all',
  Followers = 'followers',
  Followees = 'followees',
}

export type UsersFilterOption = {
  type: UsersFilterType;
  label: string;
  requiresLogin?: boolean;
};

export enum UsersSortType {
  NameAsc = 'nameAsc',
  NameDsc = 'nameDesc',
  FollowerCountAsc = 'followerCountAsc',
  FollowerCountDesc = 'followerCountDesc',
}

export type UsersSortOption = {
  type: UsersSortType;
  label: string;
};
