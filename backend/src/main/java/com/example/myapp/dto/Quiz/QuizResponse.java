package com.example.myapp.dto.Quiz;

import com.example.myapp.model.Question;

public record QuizResponse(Long id, String questionText) {
    public QuizResponse (Question question) {
        this(question.getId(), question.getQuestionText());
    }
}