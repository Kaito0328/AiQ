export interface Collection {
    id: number;
    name: string;
    open: boolean;
}

export interface CollectionInput {
    name?: string;
    open?: boolean;
}
