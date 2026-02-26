export interface User {
    id: string; // Uuid
    username: string;
    isOfficial: boolean;
    isSelf: boolean;
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
    isFollowed: boolean;
    collectionCount?: number;
    setCount?: number;
}

export interface UserProfile extends User {
    displayName?: string;
    bio?: string;
    iconUrl?: string;
}
