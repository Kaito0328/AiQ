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

export class ApiError extends Error {
    constructor(
        public status: number,
        public errorCode: ErrorCode
    ) {
        super(errorCode.message);
        this.name = 'ApiError';
    }
}

export const getErrorMessage = (code: ErrorCodeType): string => {
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
