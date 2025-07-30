package com.example.myapp.exception;

public class ErrorResponse {
    private final String code;
    private final String message;;

    ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
