package com.example.myapp.dto.Quiz;

import java.util.List;
import com.example.myapp.model.filter.FilterCondition;
import com.example.myapp.model.sort.SortCondition;

public record QuizRequest(
    List<Long> collectionIds,
    List<FilterCondition> filters,
    List<SortCondition> sorts,
    int limit
) {}