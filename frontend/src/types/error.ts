export interface ErrorCode {
    code: string;
    message: string;
}

export interface ApiError {
    status: number;
    errorCode: ErrorCode;
}