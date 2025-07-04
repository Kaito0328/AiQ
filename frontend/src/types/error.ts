export enum ErrorCodeType {
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  DUPLICATE_COLLECTION = 'DUPLICATE_COLLECTION',
  NOT_FOUND_COLLECTIONSET = 'NOT_FOUND_COLLECTIONSET',
  NOT_FOUND_COLLECTION = 'NOT_FOUND_COLLECTION',
  NOT_FOUND_QUESTION = 'NOT_FOUND_QUESTION',
  NOT_FOUND_USER = 'NOT_FOUND_USER',
  DUPLICATE_COLLECTIONSET = 'DUPLICATE_COLLECTIONSET',
  DUPLICATE_USER = 'DUPLICATE_USER',
  INVALID_PARENT = 'INVALID_PARENT',
  NOT_HAVE_VIEW_PERMISSION = 'NOT_HAVE_VIEW_PERMISSION',
  NOT_HAVE_MANAGE_PERMISSION = 'NOT_HAVE_MANAGE_PERMISSION',
  NOT_COLLECTIONSET_OWNER = 'NOT_COLLECTIONSET_OWNER',
  NOT_COLLECTION_OWNER = 'NOT_COLLECTION_OWNER',
  NOT_PUBLIC_COLLECTION = 'NOT_PUBLIC_COLLECTION',
  NOT_PUBLIC_COLLECTIONSET = 'NOT_PUBLIC_COLLECTIONSET',
  QUESTION_TEXT_EMPTY = 'QUESTION_TEXT_EMPTY',
  CORRECT_ANSWER_EMPTY = 'CORRECT_ANSWER_EMPTY',
  COLLECTION_NAME_EMPTY = 'COLLECTION_NAME_EMPTY',
  COLLECTIONSET_NAME_EMPTY = 'COLLECTIONSET_NAME_EMPTY',
  COLLECTION_OPEN_EMPTY = 'COLLECTION_OPEN_EMPTY',
  LOGIN_REQUIRED = 'LOGIN_REQUIRED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
export interface ErrorCode {
  code: ErrorCodeType;
  message: string;
}

export interface ApiError {
  status: number;
  errorCode: ErrorCode;
}
