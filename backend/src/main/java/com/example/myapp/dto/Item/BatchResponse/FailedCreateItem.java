package com.example.myapp.dto.Item.BatchResponse;

import java.util.List;
import com.example.myapp.exception.ErrorDetail;
import com.example.myapp.exception.ErrorCode;

public record FailedCreateItem(int index, List<ErrorDetail> errors) {
    public FailedCreateItem(int index, ErrorCode errorCode) {
        this(index, List.of(new ErrorDetail(errorCode)));
    }
}
