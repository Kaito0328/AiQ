import { Collection } from './collection';

export interface CollectionSet {
  id: number;
  name: string;
  descriptionText?: string;
  collections: Collection[];
}

export interface CollectionSetInput {
  name?: string;
  descriptionText?: string;
}
