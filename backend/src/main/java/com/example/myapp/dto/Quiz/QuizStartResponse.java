package com.example.myapp.dto.Quiz;

import java.util.List;
import com.example.myapp.dto.Item.Question.QuestionOutput;

public record QuizStartResponse (
    CasualQuizOutput quiz,
    List<QuestionOutput> questions
) {}
