export interface CreateCollectionRequest {
    name: string;
    descriptionText?: string;
    isOpen: boolean;
}

export interface UpdateCollectionRequest extends CreateCollectionRequest { }

export interface UpsertCollectionItem {
    id?: string;
    name?: string;
    descriptionText?: string;
    isOpen?: boolean;
}

export interface BatchCollectionsRequest {
    upsertItems: UpsertCollectionItem[];
    deleteIds: string[];
}
