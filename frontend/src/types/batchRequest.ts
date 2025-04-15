export interface CreateRequest<T> {
  index: number;
  input: T;
}

export interface UpdateRequest<T> {
  id: number;
  input: T;
}

export interface BatchUpsertRequest<T> {
  createsRequest: CreateRequest<T>[];
  updatesRequest: UpdateRequest<T>[];
}
