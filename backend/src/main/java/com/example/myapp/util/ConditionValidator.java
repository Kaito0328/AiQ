package com.example.myapp.util;

import com.example.myapp.model.filter.FilterCondition;
import com.example.myapp.model.filter.FilterType;
import com.example.myapp.model.sort.SortCondition;
import com.example.myapp.model.sort.SortKey;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ConditionValidator {

    private static final Set<FilterType> loginRequiredFilters = Set.of(
        FilterType.WRONG_COUNT,
        FilterType.NOT_SOLVED
    );

    private static final Set<SortKey> loginRequiredSorts = Set.of(
        SortKey.WRONG,
        SortKey.ACCURACY
    );

    // ログインが必要な条件を検出してエラーを出す（サービス層用）
    public static void validateLoginRequiredConditions(
            List<FilterCondition> filters,
            List<SortCondition> sorts,
            boolean isLoggedIn) {
        if (isLoggedIn) return;

        boolean hasRestrictedFilter = filters.stream()
                .anyMatch(f -> loginRequiredFilters.contains(f.type()));
        boolean hasRestrictedSort = sorts.stream()
                .anyMatch(s -> loginRequiredSorts.contains(s.key()));

        if (hasRestrictedFilter || hasRestrictedSort) {
            throw new CustomException(ErrorCode.LOGIN_REQUIRED);
        }
    }

    // 未ログイン用に、AnswerHistoryベースの条件を除去（リポジトリ層用）
    public static List<FilterCondition> filterAllowedFilters(
            List<FilterCondition> filters,
            boolean isLoggedIn) {
        if (isLoggedIn) return filters;
        return filters.stream()
                .filter(f -> !loginRequiredFilters.contains(f.type()))
                .collect(Collectors.toList());
    }

    public static List<SortCondition> filterAllowedSorts(
            List<SortCondition> sorts,
            boolean isLoggedIn) {
        if (isLoggedIn) return sorts;
        return sorts.stream()
                .filter(s -> !loginRequiredSorts.contains(s.key()))
                .collect(Collectors.toList());
    }
}
