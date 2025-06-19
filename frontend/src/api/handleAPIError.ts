import { ErrorCode, ErrorCodeType } from '../types/error';

export const handleAPIError = (errorCode: ErrorCode): string => {
  return convertErrorCode(errorCode.code);
};

export const handleError = (error: unknown): string => {
  const code = extractErrorCode(error).code;
  return convertErrorCode(code);
};

export const convertErrorCode = (code: ErrorCodeType): string => {
  switch (code) {
    case ErrorCodeType.INVALID_PASSWORD:
      return 'パスワードが間違っています。';
    case ErrorCodeType.DUPLICATE_COLLECTION:
      return '同じ名前のコレクションが既に存在します。';
    case ErrorCodeType.NOT_FOUND_COLLECTIONSET:
      return 'コレクションセットが見つかりません。';
    case ErrorCodeType.NOT_FOUND_COLLECTION:
      return 'コレクションが見つかりません。';
    case ErrorCodeType.NOT_FOUND_QUESTION:
      return '問題が見つかりません。';
    case ErrorCodeType.NOT_FOUND_USER:
      return 'ユーザーが見つかりません。';
    case ErrorCodeType.DUPLICATE_COLLECTIONSET:
      return '同じ名前のコレクションセットが既に存在します。';
    case ErrorCodeType.DUPLICATE_USER:
      return 'このユーザーは既に存在します。';
    case ErrorCodeType.INVALID_PARENT:
      return '指定された親要素に属していません。';
    case ErrorCodeType.NOT_HAVE_VIEW_PERMISSION:
      return '閲覧権限がありません。';
    case ErrorCodeType.NOT_HAVE_MANAGE_PERMISSION:
      return '管理権限がありません。';
    case ErrorCodeType.NOT_COLLECTIONSET_OWNER:
      return 'このコレクションセットの所有者ではありません。';
    case ErrorCodeType.NOT_COLLECTION_OWNER:
      return 'このコレクションの所有者ではありません。';
    case ErrorCodeType.NOT_PUBLIC_COLLECTION:
      return 'このコレクションは公開されていません。';
    case ErrorCodeType.NOT_PUBLIC_COLLECTIONSET:
      return 'このコレクションセットは公開されていません。';
    case ErrorCodeType.QUESTION_TEXT_EMPTY:
      return '問題文が空です。';
    case ErrorCodeType.CORRECT_ANSWER_EMPTY:
      return '正解が空です。';
    case ErrorCodeType.COLLECTION_NAME_EMPTY:
      return 'コレクション名が空です。';
    case ErrorCodeType.COLLECTIONSET_NAME_EMPTY:
      return 'コレクションセット名が空です。';
    case ErrorCodeType.LOGIN_REQUIRED:
      return 'この操作にはログインが必要です。';
    case ErrorCodeType.UNKNOWN_ERROR:
      return '予期しないエラーが発生しました。';
    default:
      return 'エラーが発生しました。';
  }
};

export const extractErrorCode = (error: unknown): ErrorCode => {
  if (error instanceof Error) {
    return { code: ErrorCodeType.UNKNOWN_ERROR, message: error.message };
  } else if (typeof error === 'object' && error !== null && 'errorCode' in error) {
    return error.errorCode as ErrorCode;
  } else {
    return { code: ErrorCodeType.UNKNOWN_ERROR, message: '予期しないエラーが発生しました。' };
  }
};
