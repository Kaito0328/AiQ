package com.example.myapp.exception;

import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;

@Getter
public class ErrorDetail {
    private final String code;
    private final String message;

    public ErrorDetail(ErrorCode errorCode) {
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
    }

    public static List<ErrorDetail> convertErrorCodes(List<ErrorCode> errorCodes) {
        return errorCodes.stream().map(ErrorDetail::new).collect(Collectors.toList());
    }
}
