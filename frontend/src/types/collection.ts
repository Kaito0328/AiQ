export interface Collection {
  id: number;
  name: string;
  descriptionText: string;
  open: boolean;
  favoriteCount: number;
  favorite: boolean;
  userId: number;
}

export interface CollectionInput {
  name?: string;
  open?: boolean;
  descriptionText?: string;
}
