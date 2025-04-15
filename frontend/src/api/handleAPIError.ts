import { ErrorCode } from '../types/error';

export const handleAPIError = (errorCode: ErrorCode): string => {
  return convertErrorCode(errorCode.code);
};

export const handleError = (error: unknown): string => {
  let code = 'UNKNOWN_ERROR';
  if (typeof error === 'object' && error !== null) {
    if (
      'errorCode' in error &&
      typeof error.errorCode === 'object' &&
      error.errorCode != null &&
      'code' in error.errorCode &&
      typeof error.errorCode.code === 'string'
    ) {
      code = error.errorCode.code;
    }
    if ('code' in error && typeof error.code === 'string') {
      code = error.code;
    }
  }
  return convertErrorCode(code);
};

const convertErrorCode = (code: string): string => {
  switch (code) {
    case 'INVALID_PASSWORD':
      return 'パスワードが間違っています。';
    case 'DUPLICATE_COLLECTION':
      return '同じ名前のコレクションが既に存在します。';
    case 'NOT_FOUND_COLLECTIONSET':
      return 'コレクションセットが見つかりません。';
    case 'NOT_FOUND_COLLECTION':
      return 'コレクションが見つかりません。';
    case 'NOT_FOUND_QUESTION':
      return '問題が見つかりません。';
    case 'NOT_FOUND_USER':
      return 'ユーザーが見つかりません。';
    case 'DUPLICATE_COLLECTIONSET':
      return '同じ名前のコレクションセットが既に存在します。';
    case 'DUPLICATE_USER':
      return 'このユーザーは既に存在します。';
    case 'INVALID_PARENT':
      return '指定された親要素に属していません。';
    case 'NOT_HAVE_VIEW_PERMISSION':
      return '閲覧権限がありません。';
    case 'NOT_HAVE_MANAGE_PERMISSION':
      return '管理権限がありません。';
    case 'NOT_COLLECTIONSET_OWNER':
      return 'このコレクションセットの所有者ではありません。';
    case 'NOT_COLLECTION_OWNER':
      return 'このコレクションの所有者ではありません。';
    case 'NOT_PUBLIC_COLLECTION':
      return 'このコレクションは公開されていません。';
    case 'NOT_PUBLIC_COLLECTIONSET':
      return 'このコレクションセットは公開されていません。';
    case 'QUESTION_TEXT_EMPTY':
      return '問題文が空です。';
    case 'CORRECT_ANSWER_EMPTY':
      return '正解が空です。';
    case 'COLLECTION_NAME_EMPTY':
      return 'コレクション名が空です。';
    case 'COLLECTIONSET_NAME_EMPTY':
      return 'コレクションセット名が空です。';
    case 'LOGIN_REQUIRED':
      return 'この操作にはログインが必要です。';
    case 'UNKNOWN_ERROR':
      return '予期しないエラーが発生しました。';
    default:
      return 'エラーが発生しました。';
  }
};

export const extractErrorCode = (error: unknown): ErrorCode => {
  if (error instanceof Error) {
    return { code: 'UNKNOWN_ERROR', message: error.message };
  } else if (typeof error === 'object' && error !== null && 'errorCode' in error) {
    return error.errorCode as ErrorCode;
  } else {
    return { code: 'UNKNOWN_ERROR', message: '予期しないエラーが発生しました。' };
  }
};
