import { Collection } from './collection';

export interface CollectionSet {
  id: number;
  name?: string;
  collections: Collection[];
}

export interface CollectionSetInput {
  name?: string;
}
