package com.example.myapp.dto.Quiz;

import java.time.LocalDateTime;
import java.util.List;

import com.example.myapp.model.CasualQuiz;
import com.example.myapp.model.filter.FilterType;
import com.example.myapp.model.sort.SortKey;

public record CasualQuizOutput(
    Long quizId,
    List<String> collectionNames,
    List<FilterType> filterTypes,
    List<SortKey> sortKeys,
    int totalQuestions,
    int remainingQuestions,
    LocalDateTime startTime
) {
    public CasualQuizOutput(CasualQuiz quiz) {
        this(
            quiz.getId(),
            quiz.getCollectionNames(),
            quiz.getFilterTypes(),
            quiz.getSortKeys(),
            quiz.getTotalQuestions(),
            quiz.getQuestions().size(),
            quiz.getCreatedAt()
        );
    }
}
