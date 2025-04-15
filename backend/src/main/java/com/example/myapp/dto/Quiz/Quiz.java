package com.example.myapp.dto.Quiz;

import com.example.myapp.model.Question;

public record Quiz(Long id, String questionText) {
    public Quiz (Question question) {
        this(question.getId(), question.getQuestionText());
    }
}