package com.example.myapp.dto.Item.BatchResponse;

import java.util.List;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.exception.ErrorDetail;

public record FailedItem(Long id, List<ErrorDetail> errors) {
    public FailedItem(Long id, ErrorCode errorCode) {
        this(id, List.of(new ErrorDetail(errorCode)));
    }
}
