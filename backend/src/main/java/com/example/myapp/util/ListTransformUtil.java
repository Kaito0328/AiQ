package com.example.myapp.util;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import com.example.myapp.dto.AnswerHistoryOutput;
import com.example.myapp.dto.UserOutput;
import com.example.myapp.dto.Item.Collection.CollectionOutput;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetOutput;
import com.example.myapp.dto.Item.Question.QuestionOutput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.dto.Quiz.QuizResponse;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.exception.ErrorDetail;
import com.example.myapp.model.AnswerHistory;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.Question;
import com.example.myapp.model.User;
import com.example.myapp.model.filter.FilterCondition;
import com.example.myapp.model.filter.FilterType;
import com.example.myapp.model.sort.SortCondition;
import com.example.myapp.model.sort.SortKey;

public final class ListTransformUtil {
    private static <T, F> List<F> transformList(List<T> source, Function<T, F> converter) {
        return Optional.ofNullable(source)
                .map(list -> list.stream().map(converter).collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }

    public static List<ErrorDetail> toErrorDetails(List<ErrorCode> errorCodes) {
        return transformList(errorCodes, ErrorDetail::new);
    }

    public static List<QuestionOutput> toQuestionOutputs(List<Question> questions) {
        return transformList(questions, QuestionOutput::new);
    }

    public static List<CollectionOutput> toCollectionOutputs(List<Collection> collections) {
        return transformList(collections, CollectionOutput::new);
    }

    public static List<CollectionSetOutput> toCollectionSetOutputs(
            List<CollectionSet> collectionSets) {
        return transformList(collectionSets, CollectionSetOutput::new);
    }

    public static List<UserOutput> toUserOutputs(List<User> users) {
        return transformList(users, UserOutput::new);
    }
    
    public static <T> List<CreateRequest<T>> toCreateRequest(List<T> inputs) {
        return IntStream.range(0, inputs.size())
                .mapToObj(i -> new CreateRequest<>(i, inputs.get(i))).collect(Collectors.toList());
    }

    public static List<QuizResponse> toQuizs(List<Question> questions) {
        return transformList(questions, QuizResponse::new);
    }

    public static List<AnswerHistoryOutput> toAnswerHistoryOutputs(List<AnswerHistory> answers) {
        return transformList(answers, AnswerHistoryOutput::new);
    }

    public static List<FilterType> toFilterTypes(List<FilterCondition> conditions) {
        return transformList(conditions, FilterCondition::type);
    }

    public static List<SortKey> toSortKeys(List<SortCondition> conditions) {
        return transformList(conditions, SortCondition::key);
    }


}

