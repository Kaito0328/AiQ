package com.example.myapp.service;

import com.example.myapp.dto.AnswerHistoryOutput;
import com.example.myapp.model.*;
import com.example.myapp.repository.AnswerHistoryRepository;
import com.example.myapp.util.ListTransformUtil;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnswerHistoryService {

    private final AnswerHistoryRepository answerHistoryRepository;

    public void submitAnswer(User user, CasualQuiz quiz, Question question, String userAnswer, boolean isCorrect) {

        // if (quiz == null) {
        //     boolean alreadyAnswered = answerHistoryRepository.existsByQuizAndQuestion(quiz, question);
        //     if (alreadyAnswered) {
        //         quiz = null;
        //     }
        // }

        // 解答履歴を保存
        AnswerHistory answerHistory = new AnswerHistory(user, question, quiz, userAnswer, isCorrect);
        answerHistoryRepository.save(answerHistory);
    }

    public List<AnswerHistoryOutput> getByQuiz(CasualQuiz quiz) {
        List<AnswerHistory> answers = answerHistoryRepository.findByQuiz(quiz); 
        return ListTransformUtil.toAnswerHistoryOutputs(answers);
    }
}

