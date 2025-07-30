package com.example.myapp.repository;

import com.example.myapp.model.Question;
import com.example.myapp.model.filter.FilterCondition;
import com.example.myapp.model.sort.SortCondition;
import java.util.List;

public interface QuestionRepositoryCustom {
    List<Question> findQuestionsForQuiz(
        Long userId,
        List<Long> collectionIds,
        List<FilterCondition> filters,
        List<SortCondition> sorts,
        int limit
    );

    List<Question> findQuestionsForQuiz(
        List<Long> collectionIds,
        List<FilterCondition> filters,
        List<SortCondition> sorts,
        int limit
    );
}
