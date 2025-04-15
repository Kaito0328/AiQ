package com.example.myapp.dto.Item.BatchResponse;

import java.util.List;

public record BatchUpsertResponse<T>(List<T> successItems, List<FailedCreateItem> failedCreateItems,
                List<FailedItem> failedUpdateItems) {
}
