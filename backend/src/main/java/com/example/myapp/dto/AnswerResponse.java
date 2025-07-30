package com.example.myapp.dto;

public record AnswerResponse(boolean correct, String correctAnswer, String descriptionText) {
}
