package com.example.myapp.service;

import com.example.myapp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.myapp.repository.AnswerHistoryRepository;
import com.example.myapp.model.AnswerHistory;
import com.example.myapp.model.Question;

@Service
public class AnswerHistoryService {

    @Autowired
    private AnswerHistoryRepository answerHistoryRepository;

    public List<AnswerHistory> getUserAnswerHistory(User user) {
        return answerHistoryRepository.findByUser(user);
    }

    public void saveAnswer(User user, Question question, String userAnswer, boolean isCorrect) {
        AnswerHistory answerHistory = new AnswerHistory();
        answerHistory.setUser(user);
        answerHistory.setQuestion(question);
        answerHistory.setUserAnswer(userAnswer);
        answerHistory.setCorrect(isCorrect);
        answerHistoryRepository.save(answerHistory);
    }
}
