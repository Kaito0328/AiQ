package com.example.myapp.dto.Quiz;

import java.util.List;
import com.example.myapp.dto.AnswerHistoryOutput;
import com.example.myapp.dto.Item.Question.QuestionOutput;

public record QuizResumeResponse(List<QuestionOutput> questions, List<AnswerHistoryOutput> answers) {
}