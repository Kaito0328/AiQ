package com.example.myapp.dto;

import com.example.myapp.dto.Item.Question.QuestionOutput;
import com.example.myapp.model.AnswerHistory;
import com.example.myapp.model.Question;

public record AnswerHistoryOutput(
    boolean correct,
    String userAnswer,
    QuestionOutput question
) {
    public AnswerHistoryOutput(boolean correct, String userAnswer, Question question) {
        this(correct, userAnswer, new QuestionOutput(question));
    }

    public AnswerHistoryOutput(AnswerHistory answer) {
        this(answer.isCorrect(), answer.getUserAnswer(), answer.getQuestion());
    }
}