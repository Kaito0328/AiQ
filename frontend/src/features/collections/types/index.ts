import { DefaultCollectionMode } from "@/src/entities/quiz";

export interface CreateCollectionRequest {
    name: string;
    descriptionText?: string;
    isOpen: boolean;
    defaultMode?: DefaultCollectionMode;
    tags?: string[];
    difficultyLevel?: number;
}

export interface UpdateCollectionRequest extends CreateCollectionRequest { }

export interface UpsertCollectionItem {
    id?: string;
    name?: string;
    descriptionText?: string;
    isOpen?: boolean;
    defaultMode?: DefaultCollectionMode;
}

export interface BatchCollectionsRequest {
    upsertItems: UpsertCollectionItem[];
    deleteIds: string[];
}
