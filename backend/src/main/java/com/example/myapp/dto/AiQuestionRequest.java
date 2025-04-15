package com.example.myapp.dto;

public record AiQuestionRequest(String theme, String question_format, String answer_format,
        String question_example, String answer_example, String collectionSetName,
        boolean isPublic) {
}
