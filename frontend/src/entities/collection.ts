export interface Collection {
    id: string; // Uuid
    userId: string; // Uuid
    name: string;
    descriptionText?: string;
    isOpen: boolean;
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
    authorName?: string;
    authorIconUrl?: string;
    isOfficial: boolean;
    favoriteCount?: number;
    questionCount?: number;
    isFavorited?: boolean;
    userRank?: number;
}
export interface CollectionSet {
    id: string; // Uuid
    userId: string; // Uuid
    name: string;
    descriptionText?: string;
    isOpen: boolean;
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}

export interface CollectionSetResponse {
    set: CollectionSet;
    collections: Collection[];
}
