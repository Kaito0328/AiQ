import { ErrorCode } from './error';

export interface FailedCreateItem {
  index: number;
  errors: ErrorCode[];
}

export interface FailedItem {
  id: number;
  errors: ErrorCode[];
}

export interface BatchUpsertResponse<T> {
  successItems: T[];
  failedCreateItems: FailedCreateItem[];
  failedUpdateItems: FailedItem[];
}

export interface BatchDeleteResponse<T> {
  successItems: T[];
  failedItems: FailedItem[];
}
