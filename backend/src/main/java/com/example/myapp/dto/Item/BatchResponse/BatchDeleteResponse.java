package com.example.myapp.dto.Item.BatchResponse;

import java.util.List;

public record BatchDeleteResponse<T>(List<T> successItems, List<FailedItem> failedItems) {
}
