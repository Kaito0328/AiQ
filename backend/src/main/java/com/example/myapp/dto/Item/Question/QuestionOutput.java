package com.example.myapp.dto.Item.Question;

import com.example.myapp.model.Question;

public record QuestionOutput(Long id, String questionText, String correctAnswer,
        String descriptionText, Long collectionId) {

    public QuestionOutput(Question question) {
        this(question.getId(), question.getQuestionText(), question.getCorrectAnswer(),
                question.getDescriptionText(), question.getCollection().getId());
    }
}
